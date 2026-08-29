const Student = require("../models/Student");
const Warden = require("../models/Warden");

const getProfile = async (req, res) => {
  try {
    const student = await Student.findById(
      req.studentId
    ).select("-passwordHash");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    console.error(
      "Get profile error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({
      role: "STUDENT",
    })
      .select("-passwordHash")
      .populate("hostelId", "name code")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    console.error(
      "Get all students error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching students",
    });
  }
};

// ==========================================
// Warden: Get students from assigned hostel
// ==========================================

const getWardenStudents = async (
  req,
  res
) => {
  try {
    const wardenId = req.wardenId;
    const hostelId = req.hostelId;

    // ==========================================
    // 1. Validate Warden information
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
    // 3. Get ONLY students from this hostel
    // ==========================================

    const students =
      await Student.find({
        role: "STUDENT",
        hostelId,
      })
        .select("-passwordHash")
        .populate(
          "hostelId",
          "name code"
        )
        .sort({
          createdAt: -1,
        });

    // ==========================================
    // 4. Return students
    // ==========================================

    return res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    console.error(
      "Get warden students error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching hostel students",
    });
  }
};

module.exports = {
  getProfile,
  getAllStudents,
  getWardenStudents,
};