const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const Device = require("../models/Device");

const registerDevice = async (req, res) => {
  try {
    const studentId = req.studentId;

    // Check if student already has a device
    const existingDevice = await Device.findOne({
      student: studentId,
      active: true,
    });

    if (existingDevice) {
      return res.status(409).json({
        success: false,
        message: "A device is already registered for this account",
      });
    }

    // Generate random device token
    const deviceToken = crypto.randomBytes(32).toString("hex");

    // Hash token before storing
    const deviceTokenHash = await bcrypt.hash(
      deviceToken,
      12
    );

    await Device.create({
      student: studentId,
      deviceTokenHash,
    });

    // Send raw token ONLY to the student's browser
    res.status(201).json({
      success: true,
      message: "Device registered successfully",
      deviceToken,
    });
  } catch (error) {
    console.error("Device registration error:", error);

    res.status(500).json({
      success: false,
      message: "Server error during device registration",
    });
  }
};

module.exports = {
  registerDevice,
};