const Gate = require("../models/Gate");
const Student = require("../models/Student");
const Device = require("../models/Device");
const EntryExitLog = require("../models/EntryExitLog");

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
     * 3. Get gate using the QR token
     *
     * IMPORTANT:
     * Gate coordinates come from MongoDB.
     * We do NOT trust coordinates sent by frontend
     * for the gate.
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
     * 5. Verify geofence again
     *
     * We intentionally verify this again here
     * instead of trusting a previous frontend check.
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
     * 7. Decide ENTRY or EXIT from current status
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
     * 10. Update current student status
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

    const logs = await EntryExitLog.find({
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

module.exports = {
  markAttendance,
  getAttendanceHistory,
};