require("dotenv").config();

const mongoose = require("mongoose");

const Hostel = require("../src/models/Hostel");

const MONGO_URI = process.env.MONGODB_URI;

const hostels = [
  {
    name: "Hostel A",
    code: "H-A",
  },
  {
    name: "Hostel B",
    code: "H-B",
  },
  {
    name: "Hostel C",
    code: "H-C",
  },
];

const createHostels = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("Connected to MongoDB");

    for (const hostelData of hostels) {
      const existingHostel = await Hostel.findOne({
        code: hostelData.code,
      });

      if (existingHostel) {
        console.log(
          `${hostelData.name} already exists.`
        );
        continue;
      }

      const hostel = await Hostel.create(
        hostelData
      );

      console.log(
        `Created hostel: ${hostel.name} (${hostel.code})`
      );
    }

    await mongoose.disconnect();

    console.log("Hostel setup completed.");
  } catch (error) {
    console.error(
      "Error creating hostels:",
      error
    );

    await mongoose.disconnect();

    process.exit(1);
  }
};

createHostels();