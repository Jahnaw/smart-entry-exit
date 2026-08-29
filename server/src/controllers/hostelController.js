const Hostel = require("../models/Hostel");

const getActiveHostels = async (req, res) => {
  try {
    const hostels = await Hostel.find({
      active: true,
    })
      .select("_id name code")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      hostels,
    });
  } catch (error) {
    console.error(
      "Get active hostels error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching hostels",
    });
  }
};

module.exports = {
  getActiveHostels,
};