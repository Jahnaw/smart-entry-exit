const bcrypt = require("bcryptjs");

const Device = require("../models/Device");

const authenticateDevice = async (
  req,
  res,
  next
) => {
  try {
    const deviceToken =
      req.headers["x-device-token"];

    if (!deviceToken) {
      return res.status(401).json({
        success: false,
        message: "Device authentication required",
      });
    }

    const device = await Device.findOne({
      student: req.studentId,
      active: true,
    });

    if (!device) {
      return res.status(401).json({
        success: false,
        message: "No registered device found",
      });
    }

    const tokenMatches =
      await bcrypt.compare(
        deviceToken,
        device.deviceTokenHash
      );

    if (!tokenMatches) {
      return res.status(401).json({
        success: false,
        message: "Unrecognized device",
      });
    }

    device.lastUsedAt = new Date();
    await device.save();

    req.deviceId = device._id;

    next();
  } catch (error) {
    console.error(
      "Device authentication error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Device authentication failed",
    });
  }
};

module.exports = authenticateDevice;