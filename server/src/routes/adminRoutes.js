const express = require("express");

const authenticateStudent = require("../middleware/authMiddleware");
const authorizeAdmin = require("../middleware/adminMiddleware");

const {
  getDashboardStats,
  createWarden,
  getAllWardens,
  deleteWarden,
  createGuard,
  getAllGuards,
  deleteGuard,
} = require("../controllers/adminController");

const router = express.Router();

// ==========================================
// A1 — Authorization test
// ==========================================

router.get("/test", authenticateStudent, authorizeAdmin, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin access granted",
  });
});

// ==========================================
// A2 — Admin Dashboard
// ==========================================

router.get(
  "/dashboard",
  authenticateStudent,
  authorizeAdmin,
  getDashboardStats,
);

// ==========================================
// B2.5 — Create Warden
// ==========================================

router.post("/wardens", authenticateStudent, authorizeAdmin, createWarden);

// ==========================================
// B2.7 — Get all Wardens
// ==========================================

router.get("/wardens", authenticateStudent, authorizeAdmin, getAllWardens);

// ==========================================
// B2.7 — Remove Warden
// ==========================================

router.delete(
  "/wardens/:id",
  authenticateStudent,
  authorizeAdmin,
  deleteWarden,
);

// ==========================================
// GUARD MANAGEMENT
// ==========================================

// Create Guard

router.post(
  "/guards",
  authenticateStudent,
  authorizeAdmin,
  createGuard
);

// Get all Guards

router.get(
  "/guards",
  authenticateStudent,
  authorizeAdmin,
  getAllGuards
);

// Remove Guard

router.delete(
  "/guards/:id",
  authenticateStudent,
  authorizeAdmin,
  deleteGuard
);

module.exports = router;
