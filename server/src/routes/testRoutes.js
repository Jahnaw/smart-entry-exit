const express = require("express");
const Gate = require("../models/Gate");

const router = express.Router();

router.post("/gate", async (req, res) => {
  try {
    const gate = await Gate.create({
      name: "Main Gate",
      latitude: 26.7606,
      longitude: 83.3732,
      radius: 50,
      qrToken: "MAIN_GATE_TEST_TOKEN",
    });

    res.status(201).json({
      success: true,
      gate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;