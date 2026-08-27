const express = require("express");

const {
  createGate,
  getGateByQrToken,
} = require("../controllers/gateController");

const router = express.Router();

router.post("/", createGate);

router.get(
  "/qr/:qrToken",
  getGateByQrToken
);

module.exports = router;