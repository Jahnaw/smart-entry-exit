const express = require("express");

const authenticateStudent = require("../middleware/authMiddleware");

const {
  getProfile,
} = require("../controllers/studentController");

const router = express.Router();

router.get(
  "/profile",
  authenticateStudent,
  getProfile
);

module.exports = router;