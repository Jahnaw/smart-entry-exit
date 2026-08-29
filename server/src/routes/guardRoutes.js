const express = require("express");

const authenticateStudent = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  getGuardHostels,
  getGuardHostelStudents,
} = require("../controllers/guardController");

const router = express.Router();

// ==========================================
// Guard: Get active hostels
// ==========================================

router.get(
  "/hostels",
  authenticateStudent,
  authorizeRoles("GUARD"),
  getGuardHostels
);

// ==========================================
// Guard: Get students of selected hostel
// ==========================================

router.get(
  "/hostels/:hostelId/students",
  authenticateStudent,
  authorizeRoles("GUARD"),
  getGuardHostelStudents
);

module.exports = router;