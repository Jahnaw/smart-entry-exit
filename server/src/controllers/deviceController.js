const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const Device = require("../models/Device");

const registerOrVerifyDevice = async (req, res) => {
  try {
    const studentId = req.studentId;

    const existingDevice = await Device.findOne({
      student: studentId,
      active: true,
    });

    /*
     * First login:
     * Student does not have a registered device yet.
     */
    if (!existingDevice) {
      const deviceToken = crypto
        .randomBytes(32)
        .toString("hex");

      const deviceTokenHash = await bcrypt.hash(
        deviceToken,
        12
      );

      await Device.create({
        student: studentId,
        deviceTokenHash,
      });

      return res.status(201).json({
        success: true,
        registered: true,
        message: "Device registered successfully",
        deviceToken,
      });
    }

    /*
     * Subsequent login:
     * Student already has a registered device.
     *
     * The frontend must provide its existing
     * device token.
     */
    const deviceToken =
      req.headers["x-device-token"];

    if (!deviceToken) {
      return res.status(401).json({
        success: false,
        registered: false,
        message:
          "This account is already registered to another device",
      });
    }

    const tokenMatches =
      await bcrypt.compare(
        deviceToken,
        existingDevice.deviceTokenHash
      );

    if (!tokenMatches) {
      return res.status(401).json({
        success: false,
        registered: false,
        message:
          "This account is already registered to another device",
      });
    }

    existingDevice.lastUsedAt = new Date();

    await existingDevice.save();

    return res.status(200).json({
      success: true,
      registered: false,
      message: "Device verified successfully",
    });
  } catch (error) {
    console.error(
      "Device registration/verification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Device verification failed",
    });
  }
};

module.exports = {
  registerOrVerifyDevice,
};