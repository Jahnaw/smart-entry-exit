const express = require("express");

const {
  getActiveHostels,
} = require("../controllers/hostelController");

const router = express.Router();

router.get(
  "/active",
  getActiveHostels
);

module.exports = router;