const express = require("express");

const authenticateStudent = require("../middleware/authMiddleware");
const authenticateDevice = require("../middleware/deviceMiddleware");

const {
  markAttendance,
  getAttendanceHistory,
} = require("../controllers/attendanceController");

const router = express.Router();

router.post(
  "/mark",
  authenticateStudent,
  authenticateDevice,
  markAttendance
);

router.get(
  "/history",
  authenticateStudent,
  authenticateDevice,
  getAttendanceHistory
);

module.exports = router;