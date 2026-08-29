const Student = require("../models/Student");
const Hostel = require("../models/Hostel");

// ==========================================
// GET ACTIVE HOSTELS
// Guard can search/select any active hostel
// ==========================================

const getGuardHostels = async (req, res) => {
  try {
    const hostels = await Hostel.find({
      active: true,
    })
      .select("_id name code")
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      hostels,
    });
  } catch (error) {
    console.error(
      "Get guard hostels error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching hostels",
    });
  }
};

// ==========================================
// GET STUDENTS OF SELECTED HOSTEL
// ==========================================

const getGuardHostelStudents = async (
  req,
  res
) => {
  try {
    const { hostelId } = req.params;

    // ==========================================
    // 1. Verify hostel exists and is active
    // ==========================================

    const hostel = await Hostel.findOne({
      _id: hostelId,
      active: true,
    });

    if (!hostel) {
      return res.status(404).json({
        success: false,
        message:
          "Hostel not found or inactive",
      });
    }

    // ==========================================
    // 2. Get students from this hostel
    // ==========================================

    const students = await Student.find({
      role: "STUDENT",
      hostelId,
    })
      .select(
        "name rollNumber email phone status hostelId"
      )
      .sort({
        name: 1,
      });

    // ==========================================
    // 3. Calculate statistics
    // ==========================================

    const totalStudents =
      students.length;

    const studentsInside =
      students.filter(
        (student) =>
          student.status === "INSIDE"
      ).length;

    const studentsOutside =
      students.filter(
        (student) =>
          student.status === "OUTSIDE"
      ).length;

    // ==========================================
    // 4. Return hostel + statistics + students
    // ==========================================

    return res.status(200).json({
      success: true,

      hostel: {
        id: hostel._id,
        name: hostel.name,
        code: hostel.code,
      },

      statistics: {
        totalStudents,
        studentsInside,
        studentsOutside,
      },

      students,
    });
  } catch (error) {
    console.error(
      "Get guard hostel students error:",
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
  getGuardHostels,
  getGuardHostelStudents,
};