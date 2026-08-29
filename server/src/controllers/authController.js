const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Student = require("../models/Student");
const Warden = require("../models/Warden");
const Guard = require("../models/Guard");
const Hostel = require("../models/Hostel");

// ==========================================
// STUDENT SIGNUP
// ==========================================

const signup = async (req, res) => {
  try {
    const { name, rollNumber, email, password, phone, hostelId } = req.body;

    // 1. Validate required fields

    if (!name || !rollNumber || !email || !password || !hostelId) {
      return res.status(400).json({
        success: false,
        message: "Name, roll number, email, password and hostel are required",
      });
    }

    // 2. Check email in students

    const existingStudent = await Student.findOne({
      email: email.toLowerCase(),
    });

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // 3. Check email in wardens

    const existingWarden = await Warden.findOne({
      email: email.toLowerCase(),
    });

    if (existingWarden) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // 4. Check email in guards

    const existingGuard = await Guard.findOne({
      email: email.toLowerCase(),
    });

    if (existingGuard) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // 4. Check roll number

    const existingRollNumber = await Student.findOne({
      rollNumber,
    });

    if (existingRollNumber) {
      return res.status(409).json({
        success: false,
        message: "An account with this roll number already exists",
      });
    }

    // 5. Verify hostel

    const hostel = await Hostel.findOne({
      _id: hostelId,
      active: true,
    });

    if (!hostel) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive hostel",
      });
    }

    // 6. Hash password

    const passwordHash = await bcrypt.hash(password, 12);

    // 7. Create student

    const student = await Student.create({
      name,
      rollNumber,
      email: email.toLowerCase(),
      passwordHash,
      phone,
      hostelId,
      role: "STUDENT",
    });

    // 8. Return safe information

    res.status(201).json({
      success: true,
      message: "Student account created successfully",

      student: {
        id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        email: student.email,
        hostelId: student.hostelId,
        role: student.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    res.status(500).json({
      success: false,
      message: "Server error during signup",
    });
  }
};

// ==========================================
// LOGIN
// Supports:
// STUDENT
// ADMIN
// WARDEN
// ==========================================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase();

    // ==========================================
    // 2. FIRST CHECK STUDENT / ADMIN
    // ==========================================

    const student = await Student.findOne({
      email: normalizedEmail,
    });

    if (student) {
      const passwordMatch = await bcrypt.compare(
        password,
        student.passwordHash,
      );

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Student/Admin JWT

      const token = jwt.sign(
        {
          studentId: student._id,
          role: student.role,
          hostelId: student.hostelId || null,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        },
      );

      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,

        student: {
          id: student._id,
          name: student.name,
          rollNumber: student.rollNumber,
          email: student.email,
          status: student.status,
          role: student.role,
          hostelId: student.hostelId || null,
        },
      });
    }

    // ==========================================
    // 3. CHECK WARDEN
    // ==========================================

    const warden = await Warden.findOne({
      email: normalizedEmail,
      active: true,
    }).populate("hostelId", "name code");

    if (warden) {
      const passwordMatch = await bcrypt.compare(password, warden.passwordHash);

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Warden JWT

      const token = jwt.sign(
        {
          wardenId: warden._id,
          role: "WARDEN",
          hostelId: warden.hostelId._id,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        },
      );

      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,

        student: {
          id: warden._id,
          name: warden.name,
          email: warden.email,
          phone: warden.phone,
          role: "WARDEN",
          hostelId: warden.hostelId._id,

          hostel: {
            name: warden.hostelId.name,
            code: warden.hostelId.code,
          },
        },
      });
    }

    // ==========================================
    // 4. CHECK GUARD
    // ==========================================

    const guard = await Guard.findOne({
      email: normalizedEmail,
      active: true,
    });

    if (guard) {
      const passwordMatch = await bcrypt.compare(password, guard.passwordHash);

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Guard JWT

      const token = jwt.sign(
        {
          guardId: guard._id,
          role: "GUARD",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        },
      );

      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,

        student: {
          id: guard._id,
          name: guard.name,
          email: guard.email,
          phone: guard.phone,
          role: "GUARD",
        },
      });
    }

    // ==========================================
    // 4. ACCOUNT NOT FOUND
    // ==========================================

    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

module.exports = {
  signup,
  login,
};
