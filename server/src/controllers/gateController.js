const Gate = require("../models/Gate");
const Hostel = require("../models/Hostel");

const generateQrToken = require("../utils/generateQrToken");
const generateQrCode = require("../utils/generateQrCode");

const createGate = async (req, res) => {
  try {
    const {
      name,
      type,
      hostelId,
      latitude,
      longitude,
      radius,
    } = req.body;

    // ==========================================
    // 1. Validate basic information
    // ==========================================

    if (
      !name ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, latitude and longitude are required",
      });
    }

    // ==========================================
    // 2. Validate gate type
    // ==========================================

    if (
      !type ||
      !["MAIN", "HOSTEL"].includes(type)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Gate type must be MAIN or HOSTEL",
      });
    }

    // ==========================================
    // 3. Main Gate
    // ==========================================

    if (type === "MAIN") {
      // Only ADMIN can create Main Gates
      if (req.userRole !== "ADMIN") {
        return res.status(403).json({
          success: false,
          message:
            "Only administrators can create main gates",
        });
      }

      // Main Gate must not have hostel
      if (hostelId) {
        return res.status(400).json({
          success: false,
          message:
            "Main gates cannot belong to a hostel",
        });
      }
    }

    // ==========================================
    // 4. Hostel Gate
    // ==========================================

    if (type === "HOSTEL") {
      if (!hostelId) {
        return res.status(400).json({
          success: false,
          message:
            "Hostel is required for a hostel gate",
        });
      }

      // Warden can only create a gate
      // inside their own hostel
      if (
        req.userRole === "WARDEN" &&
        req.hostelId.toString() !==
          hostelId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You can only manage gates in your hostel",
        });
      }

      const hostel = await Hostel.findOne({
        _id: hostelId,
        active: true,
      });

      if (!hostel) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid or inactive hostel",
        });
      }
    }

    // ==========================================
    // 5. Generate QR token
    // ==========================================

    const qrToken = generateQrToken();

    // ==========================================
    // 6. Create gate
    // ==========================================

    const gate = await Gate.create({
      name,
      type,

      hostelId:
        type === "HOSTEL"
          ? hostelId
          : undefined,

      latitude,
      longitude,
      radius: radius || 50,
      qrToken,
    });

    // ==========================================
    // 7. Generate QR code
    // ==========================================

    const qrCode = await generateQrCode(
      gate.qrToken
    );

    res.status(201).json({
      success: true,
      message:
        "Gate created successfully",

      gate: {
        id: gate._id,
        name: gate.name,
        type: gate.type,
        hostelId: gate.hostelId,
        latitude: gate.latitude,
        longitude: gate.longitude,
        radius: gate.radius,
        qrToken: gate.qrToken,
        qrCode,
        active: gate.active,
      },
    });
  } catch (error) {
    console.error(
      "Create gate error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while creating gate",
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
        message:
          "Invalid or inactive gate QR",
      });
    }

    res.status(200).json({
      success: true,

      gate: {
        id: gate._id,
        name: gate.name,
        type: gate.type,
        hostelId: gate.hostelId,
        latitude: gate.latitude,
        longitude: gate.longitude,
        radius: gate.radius,
      },
    });
  } catch (error) {
    console.error(
      "Get gate error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while finding gate",
    });
  }
};

const getGateQrCode = async (req, res) => {
  try {
    const { id } = req.params;

    const gate = await Gate.findById(id);

    if (!gate) {
      return res.status(404).json({
        success: false,
        message: "Gate not found",
      });
    }

    // Warden can only access QR codes
    // belonging to their hostel
    if (
      req.userRole === "WARDEN"
    ) {
      if (
        gate.type !== "HOSTEL" ||
        !gate.hostelId ||
        gate.hostelId.toString() !==
          req.hostelId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You can only access gates in your hostel",
        });
      }
    }

    // Guards should never reach this because
    // of role middleware, but keep this check
    // as defense in depth.
    if (req.userRole === "GUARD") {
      return res.status(403).json({
        success: false,
        message:
          "Guards cannot manage gate QR codes",
      });
    }

    const qrCode = await generateQrCode(
      gate.qrToken
    );

    res.status(200).json({
      success: true,
      qrCode,
    });
  } catch (error) {
    console.error(
      "Generate gate QR error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to generate gate QR",
    });
  }
};

const getAllGates = async (req, res) => {
  try {
    let query = {};

    // Warden sees only their hostel gates
    if (req.userRole === "WARDEN") {
      query = {
        type: "HOSTEL",
        hostelId: req.hostelId,
      };
    }

    const gates = await Gate.find(query)
      .select("-qrToken")
      .populate(
        "hostelId",
        "name code"
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,

      gates: gates.map((gate) => ({
        id: gate._id,
        name: gate.name,
        type: gate.type,

        hostelId: gate.hostelId
          ? gate.hostelId._id
          : null,

        hostel: gate.hostelId
          ? {
              name:
                gate.hostelId.name,
              code:
                gate.hostelId.code,
            }
          : null,

        latitude: gate.latitude,
        longitude: gate.longitude,
        radius: gate.radius,
        active: gate.active,
      })),
    });
  } catch (error) {
    console.error(
      "Get all gates error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching gates",
    });
  }
};

const updateGate = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      type,
      hostelId,
      latitude,
      longitude,
      radius,
      active,
    } = req.body;

    const gate = await Gate.findById(id);

    if (!gate) {
      return res.status(404).json({
        success: false,
        message: "Gate not found",
      });
    }

    // ==========================================
    // Warden can only modify hostel gates
    // belonging to their hostel
    // ==========================================

    if (req.userRole === "WARDEN") {
      if (
        gate.type !== "HOSTEL" ||
        !gate.hostelId ||
        gate.hostelId.toString() !==
          req.hostelId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You can only manage gates in your hostel",
        });
      }

      // Warden cannot change a gate into MAIN
      if (type === "MAIN") {
        return res.status(403).json({
          success: false,
          message:
            "Wardens cannot create or convert gates into main gates",
        });
      }

      // Warden cannot move a gate to another hostel
      if (
        hostelId &&
        hostelId.toString() !==
          req.hostelId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You cannot move a gate to another hostel",
        });
      }
    }

    // ==========================================
    // Determine resulting gate type
    // ==========================================

    const newType =
      type !== undefined
        ? type
        : gate.type;

    if (
      !["MAIN", "HOSTEL"].includes(
        newType
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Gate type must be MAIN or HOSTEL",
      });
    }

    // ==========================================
    // Main Gate rules
    // ==========================================

    if (newType === "MAIN") {
      if (req.userRole !== "ADMIN") {
        return res.status(403).json({
          success: false,
          message:
            "Only administrators can manage main gates",
        });
      }

      if (hostelId) {
        return res.status(400).json({
          success: false,
          message:
            "Main gates cannot belong to a hostel",
        });
      }

      gate.hostelId = undefined;
    }

    // ==========================================
    // Hostel Gate rules
    // ==========================================

    if (newType === "HOSTEL") {
      const newHostelId =
        hostelId !== undefined
          ? hostelId
          : gate.hostelId;

      if (!newHostelId) {
        return res.status(400).json({
          success: false,
          message:
            "Hostel is required for a hostel gate",
        });
      }

      const hostel =
        await Hostel.findOne({
          _id: newHostelId,
          active: true,
        });

      if (!hostel) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid or inactive hostel",
        });
      }

      if (
        req.userRole === "WARDEN" &&
        newHostelId.toString() !==
          req.hostelId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You can only manage gates in your hostel",
        });
      }

      gate.hostelId = newHostelId;
    }

    // ==========================================
    // Update fields
    // ==========================================

    if (name !== undefined) {
      gate.name = name;
    }

    if (type !== undefined) {
      gate.type = type;
    }

    if (latitude !== undefined) {
      gate.latitude = latitude;
    }

    if (longitude !== undefined) {
      gate.longitude = longitude;
    }

    if (radius !== undefined) {
      gate.radius = radius;
    }

    if (active !== undefined) {
      gate.active = active;
    }

    await gate.save();

    res.status(200).json({
      success: true,
      message:
        "Gate updated successfully",

      gate: {
        id: gate._id,
        name: gate.name,
        type: gate.type,
        hostelId:
          gate.hostelId || null,
        latitude: gate.latitude,
        longitude: gate.longitude,
        radius: gate.radius,
        active: gate.active,
      },
    });
  } catch (error) {
    console.error(
      "Update gate error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while updating gate",
    });
  }
};

const deleteGate = async (req, res) => {
  try {
    const { id } = req.params;

    const gate = await Gate.findById(id);

    if (!gate) {
      return res.status(404).json({
        success: false,
        message: "Gate not found",
      });
    }

    // Warden can only delete their own
    // hostel gates
    if (req.userRole === "WARDEN") {
      if (
        gate.type !== "HOSTEL" ||
        !gate.hostelId ||
        gate.hostelId.toString() !==
          req.hostelId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You can only manage gates in your hostel",
        });
      }
    }

    // Defense in depth
    if (req.userRole === "GUARD") {
      return res.status(403).json({
        success: false,
        message:
          "Guards cannot delete gates",
      });
    }

    await Gate.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message:
        "Gate deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete gate error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while deleting gate",
    });
  }
};

module.exports = {
  createGate,
  getGateByQrToken,
  getGateQrCode,
  getAllGates,
  updateGate,
  deleteGate,
};