require("dotenv").config();

const mongoose = require("mongoose");

const Hostel = require("../src/models/Hostel");
const Student = require("../src/models/Student");
const Warden = require("../src/models/Warden");
const EntryExitLog = require("../src/models/EntryExitLog");

const MONGO_URI = process.env.MONGODB_URI;

// Old demo hostels that we want to remove
const oldHostelCodes = ["H-A", "H-B", "H-C"];

const cleanupTestData = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("Connected to MongoDB");

    // ==========================================
    // 1. FIND OLD DEMO HOSTELS
    // ==========================================

    const oldHostels = await Hostel.find({
      code: { $in: oldHostelCodes },
    });

    console.log(
      `Found ${oldHostels.length} old demo hostels.`
    );

    if (oldHostels.length === 0) {
      console.log(
        "No Hostel A/B/C records found."
      );

      await mongoose.disconnect();
      return;
    }

    const oldHostelIds = oldHostels.map(
      (hostel) => hostel._id
    );

    // ==========================================
    // 2. FIND STUDENTS ASSIGNED TO OLD HOSTELS
    // ==========================================

    const students = await Student.find({
      hostelId: { $in: oldHostelIds },
      role: "STUDENT",
    }).select("_id name rollNumber email");

    console.log(
      `Found ${students.length} students assigned to old demo hostels.`
    );

    const studentIds = students.map(
      (student) => student._id
    );

    // ==========================================
    // 3. DELETE THEIR ATTENDANCE LOGS
    // ==========================================

    if (studentIds.length > 0) {
      const attendanceResult =
        await EntryExitLog.deleteMany({
          student: { $in: studentIds },
        });

      console.log(
        `Deleted ${attendanceResult.deletedCount} attendance logs.`
      );
    }

    // ==========================================
    // 4. DELETE STUDENTS
    // ONLY STUDENT ROLE
    // ADMIN IS NEVER TOUCHED
    // ==========================================

    if (oldHostelIds.length > 0) {
      const studentResult =
        await Student.deleteMany({
          hostelId: { $in: oldHostelIds },
          role: "STUDENT",
        });

      console.log(
        `Deleted ${studentResult.deletedCount} old test students.`
      );
    }

    // ==========================================
    // 5. DELETE WARDENS ASSIGNED TO OLD HOSTELS
    // ==========================================

    const wardenResult =
      await Warden.deleteMany({
        hostelId: { $in: oldHostelIds },
      });

    console.log(
      `Deleted ${wardenResult.deletedCount} old test wardens.`
    );

    // ==========================================
    // 6. DELETE OLD DEMO HOSTELS
    // ==========================================

    const hostelResult =
      await Hostel.deleteMany({
        _id: { $in: oldHostelIds },
      });

    console.log(
      `Deleted ${hostelResult.deletedCount} old demo hostels.`
    );

    // ==========================================
    // 7. FINISHED
    // ==========================================

    console.log("");
    console.log(
      "=========================================="
    );
    console.log(
      "Test data cleanup completed successfully."
    );
    console.log(
      "=========================================="
    );

    console.log("");
    console.log(
      "Your ADMIN account was NOT deleted."
    );

    console.log(
      "Your Guards were NOT deleted."
    );

    console.log(
      "Your new real hostels were NOT deleted."
    );

    await mongoose.disconnect();
  } catch (error) {
    console.error(
      "Cleanup error:",
      error
    );

    await mongoose.disconnect();

    process.exit(1);
  }
};

cleanupTestData();