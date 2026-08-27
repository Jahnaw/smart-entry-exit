const express = require("express");

const authenticateStudent = require("../middleware/authMiddleware");

const {
  registerDevice,
} = require("../controllers/deviceController");

const router = express.Router();

router.post(
  "/register",
  authenticateStudent,
  registerDevice
);

module.exports = router;