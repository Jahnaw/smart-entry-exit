const express = require("express");

const {
  createGate,
  getGateByQrToken,
  getGateQrCode,
} = require("../controllers/gateController");

const router = express.Router();

router.post("/", createGate);

router.get(
  "/qr/:qrToken",
  getGateByQrToken
);

router.get(
  "/:id/qr",
  getGateQrCode
);

module.exports = router;