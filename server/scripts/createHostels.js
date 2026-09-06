require("dotenv").config();

const mongoose = require("mongoose");

const Hostel = require("../src/models/Hostel");

const MONGO_URI = process.env.MONGODB_URI;

const hostels = [
  // ==========================================
  // BOYS HOSTELS
  // ==========================================

  {
    name: "Raman Bhawan",
    code: "RAMAN",
  },
  {
    name: "Subhash Bhawan",
    code: "SUBHASH",
  },
  {
    name: "Visveswaraya Bhawan",
    code: "VISVESWARAYA",
  },
  {
    name: "Tagore Bhawan",
    code: "TAGORE",
  },
  {
    name: "Ambedkar Bhawan",
    code: "AMBEDKAR",
  },
  {
    name: "Tilak Bhawan",
    code: "TILAK",
  },
  {
    name: "Ramanujam Bhawan",
    code: "RAMANUJAM",
  },

  // ==========================================
  // GIRLS HOSTELS
  // ==========================================

  {
    name: "Saraswati Bhawan",
    code: "SARASWATI",
  },
  {
    name: "Sarojani Bhawan",
    code: "SAROJANI",
  },
  {
    name: "Kalpna Chawala Bhawan",
    code: "KALPNA-CHAWALA",
  },
  {
    name: "Kasturaba Bhawan",
    code: "KASTURABA",
  },
  {
    name: "Savitribai Phule Bhawan",
    code: "SAVITRIBAI-PHULE",
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