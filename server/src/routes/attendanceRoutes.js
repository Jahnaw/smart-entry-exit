const express = require("express");

const authenticateStudent = require("../middleware/authMiddleware");

const authenticateDevice = require("../middleware/deviceMiddleware");

const authorizeAdmin = require("../middleware/adminMiddleware");

const authorizeWarden = require("../middleware/wardenMiddleware");

const {
  markAttendance,
  getAttendanceHistory,
  getAllAttendance,
  getWardenAttendance,
} = require("../controllers/attendanceController");

const router = express.Router();

// ==========================================
// Student attendance
// ==========================================

router.post(
  "/mark",
  authenticateStudent,
  authenticateDevice,
  markAttendance
);

// ==========================================
// Student's own attendance history
// ==========================================

router.get(
  "/history",
  authenticateStudent,
  authenticateDevice,
  getAttendanceHistory
);

// ==========================================
// Admin: all attendance
// ==========================================

router.get(
  "/admin/all",
  authenticateStudent,
  authorizeAdmin,
  getAllAttendance
);

// ==========================================
// Warden: assigned hostel attendance only
// ==========================================

router.get(
  "/warden/all",
  authenticateStudent,
  authorizeWarden,
  getWardenAttendance
);

module.exports = router;