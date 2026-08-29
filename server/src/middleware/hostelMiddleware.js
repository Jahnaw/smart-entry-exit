const Student = require("../models/Student");
const Warden = require("../models/Warden");

const authorizeHostel = async (req, res, next) => {
  try {
    // ==========================================
    // ADMIN
    // ==========================================
    // Admin can access all hostels.
    // ==========================================

    if (req.userRole === "ADMIN") {
      return next();
    }

    // ==========================================
    // WARDEN
    // ==========================================
    // Warden is stored in the Warden collection,
    // NOT the Student collection.
    // ==========================================

    if (req.userRole === "WARDEN") {
      if (!req.wardenId) {
        return res.status(403).json({
          success: false,
          message: "Warden identity is missing",
        });
      }

      const warden = await Warden.findOne({
        _id: req.wardenId,
        active: true,
      }).select("hostelId role");

      if (!warden) {
        return res.status(404).json({
          success: false,
          message: "Warden not found",
        });
      }

      if (!warden.hostelId) {
        return res.status(403).json({
          success: false,
          message:
            "No hostel is assigned to this warden",
        });
      }

      // Get hostel directly from Warden record.
      req.hostelId = warden.hostelId;

      return next();
    }

    // ==========================================
    // STUDENT / GUARD
    // ==========================================

    if (!req.studentId) {
      return res.status(403).json({
        success: false,
        message: "User identity is missing",
      });
    }

    const student = await Student.findById(
      req.studentId
    ).select("hostelId role");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!student.hostelId) {
      return res.status(403).json({
        success: false,
        message:
          "No hostel is assigned to this account",
      });
    }

    req.hostelId = student.hostelId;

    next();
  } catch (error) {
    console.error(
      "Hostel authorization error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while checking hostel authorization",
    });
  }
};

module.exports = authorizeHostel;