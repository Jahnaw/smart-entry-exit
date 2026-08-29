require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Student = require("../src/models/Student");

const MONGO_URI =
  process.env.MONGODB_URI;

const createAdmin = async () => {
  try {
    await mongoose.connect(
      MONGO_URI
    );

    console.log(
      "Connected to MongoDB"
    );

    const email =
      "admin@smartentry.com";

    const password =
      "Admin@123";

    const existingAdmin =
      await Student.findOne({
        email
      });

    if (existingAdmin) {
      console.log(
        "Admin already exists."
      );

      await mongoose.disconnect();

      return;
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    const admin =
      await Student.create({
        name: "System Admin",

        rollNumber:
          "ADMIN001",

        email,

        passwordHash:
          hashedPassword,

        status: "OUTSIDE",

        role: "ADMIN"
      });

    console.log(
      "Admin created successfully."
    );

    console.log(
      "Email:",
      admin.email
    );

    console.log(
      "Password:",
      password
    );

    await mongoose.disconnect();
  } catch (error) {
    console.error(
      "Error creating admin:",
      error
    );

    process.exit(1);
  }
};

createAdmin();