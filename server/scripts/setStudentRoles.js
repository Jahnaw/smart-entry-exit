require("dotenv").config();

const mongoose = require("mongoose");

const Student = require("../src/models/Student");

const MONGO_URI =
  process.env.MONGODB_URI;

const setStudentRoles = async () => {
  try {
    await mongoose.connect(
      MONGO_URI
    );

    console.log(
      "Connected to MongoDB"
    );

    const result =
      await Student.updateMany(
        {
          role: {
            $exists: false
          }
        },
        {
          $set: {
            role: "STUDENT"
          }
        }
      );

    console.log(
      `Updated ${result.modifiedCount} students`
    );

    await mongoose.disconnect();

    console.log(
      "Disconnected from MongoDB"
    );
  } catch (error) {
    console.error(
      "Error updating roles:",
      error
    );

    process.exit(1);
  }
};

setStudentRoles();