const express = require("express");

const authenticateStudent = require("../middleware/authMiddleware");

const authorizeAdmin = require("../middleware/adminMiddleware");
const authorizeWarden = require("../middleware/wardenMiddleware");

const {
  getProfile,
  getAllStudents,
  getWardenStudents,
} = require("../controllers/studentController");

const router = express.Router();

// ==========================================
// Student: own profile
// ==========================================

router.get(
  "/profile",
  authenticateStudent,
  getProfile
);

// ==========================================
// Admin: all students
// ==========================================

router.get(
  "/admin/all",
  authenticateStudent,
  authorizeAdmin,
  getAllStudents
);

// ==========================================
// Warden: students from assigned hostel only
// ==========================================

router.get(
  "/warden/all",
  authenticateStudent,
  authorizeWarden,
  getWardenStudents
);

module.exports = router;