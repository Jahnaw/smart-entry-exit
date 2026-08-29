const Warden = require("../models/Warden");
const Student = require("../models/Student");
const EntryExitLog = require("../models/EntryExitLog");
const Hostel = require("../models/Hostel");

const getWardenDashboard = async (req, res) => {
  try {
    const wardenId = req.wardenId;
    const hostelId = req.hostelId;

    // ==========================================
    // 1. Validate authenticated Warden
    // ==========================================

    if (!wardenId || !hostelId) {
      return res.status(403).json({
        success: false,
        message: "Warden information is missing",
      });
    }

    // ==========================================
    // 2. Verify Warden still exists and is active
    // ==========================================

    const warden = await Warden.findOne({
      _id: wardenId,
      hostelId,
      active: true,
    }).populate("hostelId", "name code");

    if (!warden) {
      return res.status(403).json({
        success: false,
        message: "Warden account is inactive or invalid",
      });
    }

    // ==========================================
    // 3. Get hostel
    // ==========================================

    const hostel = await Hostel.findOne({
      _id: hostelId,
      active: true,
    });

    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: "Hostel not found or inactive",
      });
    }

    // ==========================================
    // 4. Student statistics
    // ==========================================

    const totalStudents = await Student.countDocuments({
      role: "STUDENT",
      hostelId,
    });

    const studentsInside = await Student.countDocuments({
      role: "STUDENT",
      hostelId,
      status: "INSIDE",
    });

    const studentsOutside = await Student.countDocuments({
      role: "STUDENT",
      hostelId,
      status: "OUTSIDE",
    });

    // ==========================================
    // 5. Recent activity
    // ==========================================
    //
    // First find students belonging to this hostel.
    // Then only retrieve their attendance records.
    //

    const hostelStudents = await Student.find({
      role: "STUDENT",
      hostelId,
    }).select("_id");

    const studentIds = hostelStudents.map(
      (student) => student._id
    );

    const recentActivity = await EntryExitLog.find({
      student: { $in: studentIds },
    })
      .populate("student", "name rollNumber email")
      .populate("gate", "name type")
      .sort({
        timestamp: -1,
      })
      .limit(10);

    // ==========================================
    // 6. Return dashboard
    // ==========================================

    return res.status(200).json({
      success: true,

      dashboard: {
        hostel: {
          id: hostel._id,
          name: hostel.name,
          code: hostel.code,
        },

        warden: {
          id: warden._id,
          name: warden.name,
          email: warden.email,
        },

        totalStudents,
        studentsInside,
        studentsOutside,

        recentActivity,
      },
    });
  } catch (error) {
    console.error(
      "Warden dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching warden dashboard",
    });
  }
};

module.exports = {
  getWardenDashboard,
};