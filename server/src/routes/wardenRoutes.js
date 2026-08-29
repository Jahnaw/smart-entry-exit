const express = require("express");

const authenticateStudent = require("../middleware/authMiddleware");
const authorizeWarden = require("../middleware/wardenMiddleware");

const {
  getWardenDashboard,
} = require("../controllers/wardenController");

const router = express.Router();

// ==========================================
// Warden Dashboard
// ==========================================

router.get(
  "/dashboard",
  authenticateStudent,
  authorizeWarden,
  getWardenDashboard
);

module.exports = router;