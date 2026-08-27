const express = require("express");

const authenticateStudent = require("../middleware/authMiddleware");
const authenticateDevice = require("../middleware/deviceMiddleware");

const {
  verifyLocation,
} = require("../controllers/geofenceController");

const router = express.Router();

router.post(
  "/verify",
  authenticateStudent,
  authenticateDevice,
  verifyLocation
);

module.exports = router;