const express = require("express");

const authenticateStudent = require("../middleware/authMiddleware");

const {
  registerOrVerifyDevice,
} = require("../controllers/deviceController");

const router = express.Router();

router.post(
  "/register",
  authenticateStudent,
  registerOrVerifyDevice
);

module.exports = router;