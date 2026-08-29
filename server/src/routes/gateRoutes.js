const express = require("express");

const authenticateStudent = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const authorizeHostel = require("../middleware/hostelMiddleware");

const {
  createGate,
  getGateByQrToken,
  getGateQrCode,
  getAllGates,
  updateGate,
  deleteGate,
} = require("../controllers/gateController");

const router = express.Router();

// ==========================================
// Student/public gate identification
// ==========================================

router.get(
  "/qr/:qrToken",
  getGateByQrToken
);

// ==========================================
// Gate management
// ==========================================
//
// ADMIN:
//   Can manage all gates.
//
// WARDEN:
//   Will be restricted to their hostel
//   inside the controller.
//
// GUARD:
//   Cannot manage gates.
//

router.get(
  "/",
  authenticateStudent,
  authorizeRoles("ADMIN", "WARDEN"),
  authorizeHostel,
  getAllGates
);

router.post(
  "/",
  authenticateStudent,
  authorizeRoles("ADMIN", "WARDEN"),
  authorizeHostel,
  createGate
);

router.put(
  "/:id",
  authenticateStudent,
  authorizeRoles("ADMIN", "WARDEN"),
  authorizeHostel,
  updateGate
);

router.delete(
  "/:id",
  authenticateStudent,
  authorizeRoles("ADMIN", "WARDEN"),
  authorizeHostel,
  deleteGate
);

// ==========================================
// QR code retrieval
// ==========================================

router.get(
  "/:id/qr",
  authenticateStudent,
  authorizeRoles("ADMIN", "WARDEN"),
  authorizeHostel,
  getGateQrCode
);

module.exports = router;