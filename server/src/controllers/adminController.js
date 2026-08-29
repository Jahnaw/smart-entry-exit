const bcrypt = require("bcryptjs");

const Student = require("../models/Student");
const Warden = require("../models/Warden");
const Guard = require("../models/Guard");
const Gate = require("../models/Gate");
const EntryExitLog = require("../models/EntryExitLog");
const Hostel = require("../models/Hostel");

// ==========================================
// ADMIN DASHBOARD
// ==========================================

const getDashboardStats = async (req, res) => {
  try {
    // Students only
    const totalStudents =
      await Student.countDocuments({
        role: "STUDENT",
      });

    const studentsInside =
      await Student.countDocuments({
        role: "STUDENT",
        status: "INSIDE",
      });

    const studentsOutside =
      await Student.countDocuments({
        role: "STUDENT",
        status: "OUTSIDE",
      });

    // Gates
    const totalGates =
      await Gate.countDocuments();

    const activeGates =
      await Gate.countDocuments({
        active: true,
      });

    // Recent attendance
    const recentActivity =
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
        .limit(10);

    res.status(200).json({
      success: true,

      dashboard: {
        totalStudents,
        studentsInside,
        studentsOutside,
        totalGates,
        activeGates,
        recentActivity,
      },
    });
  } catch (error) {
    console.error(
      "Dashboard stats error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching dashboard statistics",
    });
  }
};

// ==========================================
// CREATE WARDEN
// ==========================================

const createWarden = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      hostelId,
    } = req.body;

    // 1. Validate required fields
    if (
      !name ||
      !email ||
      !password ||
      !hostelId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, password and hostel are required",
      });
    }

    // 2. Check whether email is already
    //    used by a student
    const existingStudent =
      await Student.findOne({
        email: email.toLowerCase(),
      });

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    // 3. Check whether email is already
    //    used by another warden
    const existingWarden =
      await Warden.findOne({
        email: email.toLowerCase(),
      });

    if (existingWarden) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    // 4. Verify hostel
    const hostel =
      await Hostel.findOne({
        _id: hostelId,
        active: true,
      });

    if (!hostel) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or inactive hostel",
      });
    }

    // 5. Hash password
    const passwordHash =
      await bcrypt.hash(
        password,
        12
      );

    // 6. Create Warden in Warden collection
    const warden =
      await Warden.create({
        name,
        email: email.toLowerCase(),
        passwordHash,
        phone,
        hostelId,
        role: "WARDEN",
        active: true,
      });

    // 7. Return safe information
    res.status(201).json({
      success: true,
      message:
        "Warden created successfully",

      warden: {
        id: warden._id,
        name: warden.name,
        email: warden.email,
        phone: warden.phone,
        hostelId: warden.hostelId,

        hostel: {
          name: hostel.name,
          code: hostel.code,
        },

        role: warden.role,
        active: warden.active,
      },
    });
  } catch (error) {
    console.error(
      "Create warden error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while creating warden",
    });
  }
};

// ==========================================
// GET ALL WARDENS
// ==========================================

const getAllWardens = async (req, res) => {
  try {
    const wardens =
      await Warden.find()
        .populate(
          "hostelId",
          "name code"
        )
        .sort({
          createdAt: -1,
        });

    res.status(200).json({
      success: true,

      wardens: wardens.map(
        (warden) => ({
          id: warden._id,
          name: warden.name,
          email: warden.email,
          phone: warden.phone,

          hostel: warden.hostelId
            ? {
                id:
                  warden.hostelId._id,
                name:
                  warden.hostelId.name,
                code:
                  warden.hostelId.code,
              }
            : null,

          role: warden.role,
          active: warden.active,
          createdAt:
            warden.createdAt,
        })
      ),
    });
  } catch (error) {
    console.error(
      "Get all wardens error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching wardens",
    });
  }
};

// ==========================================
// DELETE WARDEN
// ==========================================

const deleteWarden = async (req, res) => {
  try {
    const { id } = req.params;

    const warden =
      await Warden.findByIdAndDelete(id);

    if (!warden) {
      return res.status(404).json({
        success: false,
        message:
          "Warden not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Warden removed successfully",
    });
  } catch (error) {
    console.error(
      "Delete warden error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while removing warden",
    });
  }
};

// ==========================================
// CREATE GUARD
// ==========================================

const createGuard = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
    } = req.body;

    // 1. Validate required fields

    if (
      !name ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required",
      });
    }

    const normalizedEmail =
      email.toLowerCase();

    // 2. Check Student account

    const existingStudent =
      await Student.findOne({
        email: normalizedEmail,
      });

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    // 3. Check Warden account

    const existingWarden =
      await Warden.findOne({
        email: normalizedEmail,
      });

    if (existingWarden) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    // 4. Check Guard account

    const existingGuard =
      await Guard.findOne({
        email: normalizedEmail,
      });

    if (existingGuard) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    // 5. Hash password

    const passwordHash =
      await bcrypt.hash(
        password,
        12
      );

    // 6. Create Guard

    const guard =
      await Guard.create({
        name,
        email: normalizedEmail,
        passwordHash,
        phone,
        role: "GUARD",
        active: true,
      });

    // 7. Return safe information

    return res.status(201).json({
      success: true,
      message:
        "Guard created successfully",

      guard: {
        id: guard._id,
        name: guard.name,
        email: guard.email,
        phone: guard.phone,
        role: guard.role,
        active: guard.active,
      },
    });
  } catch (error) {
    console.error(
      "Create guard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while creating guard",
    });
  }
};

// ==========================================
// GET ALL GUARDS
// ==========================================

const getAllGuards = async (req, res) => {
  try {
    const guards =
      await Guard.find()
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,

      guards: guards.map(
        (guard) => ({
          id: guard._id,
          name: guard.name,
          email: guard.email,
          phone: guard.phone,
          role: guard.role,
          active: guard.active,
          createdAt:
            guard.createdAt,
        })
      ),
    });
  } catch (error) {
    console.error(
      "Get all guards error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching guards",
    });
  }
};

// ==========================================
// DELETE GUARD
// ==========================================

const deleteGuard = async (req, res) => {
  try {
    const { id } = req.params;

    const guard =
      await Guard.findByIdAndDelete(id);

    if (!guard) {
      return res.status(404).json({
        success: false,
        message: "Guard not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Guard removed successfully",
    });
  } catch (error) {
    console.error(
      "Delete guard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while removing guard",
    });
  }
};

module.exports = {
  getDashboardStats,
  createWarden,
  getAllWardens,
  deleteWarden,
  createGuard,
  getAllGuards,
  deleteGuard,
};