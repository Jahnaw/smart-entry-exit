const Gate = require("../models/Gate");

const calculateDistance = require("../utils/distance");

const verifyLocation = async (req, res) => {
  try {
    const {
      qrToken,
      latitude,
      longitude,
      accuracy,
    } = req.body;

    // Validate required data
    if (
      !qrToken ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "QR token, latitude and longitude are required",
      });
    }

    // Validate coordinates
    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid location coordinates",
      });
    }

    // Validate GPS accuracy
    if (
      accuracy !== undefined &&
      accuracy > 200
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Your GPS accuracy is too low. Please move to an open area and try again.",
      });
    }

    // Find official gate information
    const gate = await Gate.findOne({
      qrToken,
      active: true,
    });

    if (!gate) {
      return res.status(404).json({
        success: false,
        message: "Invalid or inactive gate",
      });
    }

    // Calculate distance between student and gate
    const distance = calculateDistance(
      latitude,
      longitude,
      gate.latitude,
      gate.longitude
    );

    const withinGeofence =
      distance <= gate.radius;

    if (!withinGeofence) {
      return res.status(403).json({
        success: false,
        withinGeofence: false,
        message:
          "You are outside the allowed area for this gate",
        distance: Math.round(distance),
        allowedRadius: gate.radius,
      });
    }

    return res.status(200).json({
      success: true,
      withinGeofence: true,
      message: "Location verified successfully",
      gate: {
        id: gate._id,
        name: gate.name,
      },
      distance: Math.round(distance),
      allowedRadius: gate.radius,
    });
  } catch (error) {
    console.error(
      "Location verification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error during location verification",
    });
  }
};

module.exports = {
  verifyLocation,
};