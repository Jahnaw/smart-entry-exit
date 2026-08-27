const Student = require("../models/Student");

const getProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.studentId).select(
      "-passwordHash"
    );

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
    console.error("Get profile error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getProfile,
};