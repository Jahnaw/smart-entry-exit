const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Student = require("../models/Student");

const signup = async (req, res) => {
  try {
    const { name, rollNumber, email, password, phone } = req.body;

    // 1. Validate required fields
    if (!name || !rollNumber || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, roll number, email and password are required",
      });
    }

    // 2. Check if email already exists
    const existingEmail = await Student.findOne({
      email: email.toLowerCase(),
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // 3. Check if roll number already exists
    const existingRollNumber = await Student.findOne({
      rollNumber,
    });

    if (existingRollNumber) {
      return res.status(409).json({
        success: false,
        message: "An account with this roll number already exists",
      });
    }

    // 4. Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // 5. Create student
    const student = await Student.create({
      name,
      rollNumber,
      email: email.toLowerCase(),
      passwordHash,
      phone,
    });

    // 6. Return safe student information
    res.status(201).json({
      success: true,
      message: "Student account created successfully",
      student: {
        id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        email: student.email,
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

    // 2. Find student
    const student = await Student.findOne({
      email: email.toLowerCase(),
    });

    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 3. Compare password
    const passwordMatch = await bcrypt.compare(
      password,
      student.passwordHash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 4. Create JWT
    const token = jwt.sign(
      {
        studentId: student._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // 5. Return token
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      student: {
        id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        email: student.email,
        status: student.status,
      },
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