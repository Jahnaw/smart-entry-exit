const Gate = require("../models/Gate");
const Student = require("../models/Student");
const Device = require("../models/Device");
const EntryExitLog = require("../models/EntryExitLog");
const Warden = require("../models/Warden");

const calculateDistance = require("../utils/distance");

const markAttendance = async (req, res) => {
  try {
    const {
      qrToken,
      latitude,
      longitude,
      accuracy,
    } = req.body;

    const studentId = req.studentId;
    const deviceId = req.deviceId;

    /*
     * 1. Validate request data
     */
    if (
      !qrToken ||
      latitude === undefined ||
      longitude === undefined ||
      accuracy === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "QR token and location information are required",
      });
    }

    /*
     * 2. Get student
     */
    const student = await Student.findById(
      studentId
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    /*
     * 3. Get gate using QR token
     */
    const gate = await Gate.findOne({
      qrToken,
      active: true,
    });

    if (!gate) {
      return res.status(404).json({
        success: false,
        message: "Invalid or inactive gate",
      });
    }

    /*
     * 4. Calculate distance
     */
    const distance = calculateDistance(
      latitude,
      longitude,
      gate.latitude,
      gate.longitude
    );

    /*
     * 5. Verify geofence
     */
    if (distance > gate.radius) {
      return res.status(403).json({
        success: false,
        message:
          "You are outside the allowed area for this gate",
        distance: Math.round(distance),
        allowedRadius: gate.radius,
      });
    }

    /*
     * 6. Validate GPS accuracy
     */
    if (accuracy > 200) {
      return res.status(400).json({
        success: false,
        message:
          "GPS accuracy is too low. Please try again.",
      });
    }

    /*
     * 7. Decide ENTRY or EXIT
     */
    const action =
      student.status === "OUTSIDE"
        ? "ENTRY"
        : "EXIT";

    /*
     * 8. Prevent rapid duplicate scans
     */
    const thirtySecondsAgo =
      new Date(Date.now() - 30 * 1000);

    const recentLog =
      await EntryExitLog.findOne({
        student: studentId,
        gate: gate._id,
        timestamp: {
          $gte: thirtySecondsAgo,
        },
      });

    if (recentLog) {
      return res.status(429).json({
        success: false,
        message:
          "Please wait before scanning again.",
      });
    }

    /*
     * 9. Create attendance log
     */
    const attendanceLog =
      await EntryExitLog.create({
        student: studentId,
        gate: gate._id,
        action,
        latitude,
        longitude,
        accuracy,
        distanceFromGate: Math.round(
          distance
        ),
        device: deviceId,
      });

    /*
     * 10. Update student status
     */
    student.status =
      action === "ENTRY"
        ? "INSIDE"
        : "OUTSIDE";

    await student.save();

    /*
     * 11. Return result
     */
    return res.status(201).json({
      success: true,
      message:
        action === "ENTRY"
          ? "Entry marked successfully"
          : "Exit marked successfully",
      attendance: {
        id: attendanceLog._id,
        action,
        gate: gate.name,
        timestamp:
          attendanceLog.timestamp,
        distance:
          attendanceLog.distanceFromGate,
      },
      currentStatus: student.status,
    });
  } catch (error) {
    console.error(
      "Mark attendance error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while marking attendance",
    });
  }
};

const getAttendanceHistory = async (req, res) => {
  try {
    const studentId = req.studentId;

    const logs =
      await EntryExitLog.find({
        student: studentId,
      })
        .populate("gate", "name")
        .sort({
          timestamp: -1,
        })
        .limit(50);

    return res.status(200).json({
      success: true,
      attendance: logs.map((log) => ({
        id: log._id,
        action: log.action,
        gate: log.gate
          ? log.gate.name
          : "Unknown Gate",
        timestamp: log.timestamp,
        distanceFromGate:
          log.distanceFromGate,
      })),
    });
  } catch (error) {
    console.error(
      "Get attendance history error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching attendance history",
    });
  }
};

const getAllAttendance = async (req, res) => {
  try {
    const logs =
      await EntryExitLog.find()
        .populate(
          "student",
          "name rollNumber email"
        )
        .populate(
          "gate",
          "name"
        )
        .sort({
          timestamp: -1,
        })
        .limit(100);

    return res.status(200).json({
      success: true,
      attendance: logs.map((log) => ({
        id: log._id,
        action: log.action,
        timestamp: log.timestamp,
        distanceFromGate:
          log.distanceFromGate,

        student: log.student
          ? {
              id: log.student._id,
              name: log.student.name,
              rollNumber:
                log.student.rollNumber,
              email: log.student.email,
            }
          : null,

        gate: log.gate
          ? {
              id: log.gate._id,
              name: log.gate.name,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error(
      "Get all attendance error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching attendance",
    });
  }
};

// ==========================================
// Warden: Attendance for assigned hostel
// ==========================================

const getWardenAttendance = async (
  req,
  res
) => {
  try {
    const wardenId = req.wardenId;
    const hostelId = req.hostelId;

    // ==========================================
    // 1. Validate Warden
    // ==========================================

    if (!wardenId || !hostelId) {
      return res.status(403).json({
        success: false,
        message:
          "Warden information is missing",
      });
    }

    // ==========================================
    // 2. Verify Warden
    // ==========================================

    const warden =
      await Warden.findOne({
        _id: wardenId,
        hostelId,
        active: true,
      });

    if (!warden) {
      return res.status(403).json({
        success: false,
        message:
          "Warden account is invalid or inactive",
      });
    }

    // ==========================================
    // 3. Find students in Warden's hostel
    // ==========================================

    const students =
      await Student.find({
        role: "STUDENT",
        hostelId,
      }).select("_id");

    const studentIds = students.map(
      (student) => student._id
    );

    // ==========================================
    // 4. Find attendance only for those students
    // ==========================================

    const logs =
      await EntryExitLog.find({
        student: {
          $in: studentIds,
        },
      })
        .populate(
          "student",
          "name rollNumber email"
        )
        .populate(
          "gate",
          "name type"
        )
        .sort({
          timestamp: -1,
        })
        .limit(100);

    // ==========================================
    // 5. Return records
    // ==========================================

    return res.status(200).json({
      success: true,

      attendance: logs.map((log) => ({
        id: log._id,
        action: log.action,
        timestamp: log.timestamp,
        distanceFromGate:
          log.distanceFromGate,

        student: log.student
          ? {
              id: log.student._id,
              name: log.student.name,
              rollNumber:
                log.student.rollNumber,
              email: log.student.email,
            }
          : null,

        gate: log.gate
          ? {
              id: log.gate._id,
              name: log.gate.name,
              type: log.gate.type,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error(
      "Get warden attendance error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching hostel attendance",
    });
  }
};

module.exports = {
  markAttendance,
  getAttendanceHistory,
  getAllAttendance,
  getWardenAttendance,
};