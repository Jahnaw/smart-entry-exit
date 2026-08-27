const Gate = require("../models/Gate");
const generateQrToken = require("../utils/generateQrToken");
const generateQrCode = require("../utils/generateQrCode");

const createGate = async (req, res) => {
  try {
    const { name, latitude, longitude, radius } = req.body;

    if (!name || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, latitude and longitude are required",
      });
    }

    const qrToken = generateQrToken();

    const gate = await Gate.create({
      name,
      latitude,
      longitude,
      radius: radius || 50,
      qrToken,
    });

    const qrCode = await generateQrCode(gate.qrToken);

    res.status(201).json({
      success: true,
      message: "Gate created successfully",
      gate: {
        id: gate._id,
        name: gate.name,
        latitude: gate.latitude,
        longitude: gate.longitude,
        radius: gate.radius,
        qrToken: gate.qrToken,
        qrCode,
        active: gate.active,
      },
    });
  } catch (error) {
    console.error("Create gate error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating gate",
    });
  }
};

const getGateByQrToken = async (req, res) => {
  try {
    const { qrToken } = req.params;

    const gate = await Gate.findOne({
      qrToken,
      active: true,
    });

    if (!gate) {
      return res.status(404).json({
        success: false,
        message: "Invalid or inactive gate QR",
      });
    }

    res.status(200).json({
      success: true,
      gate: {
        id: gate._id,
        name: gate.name,
        latitude: gate.latitude,
        longitude: gate.longitude,
        radius: gate.radius,
      },
    });
  } catch (error) {
    console.error("Get gate error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while finding gate",
    });
  }
};

module.exports = {
  createGate,
  getGateByQrToken,
};
