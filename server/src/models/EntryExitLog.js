const mongoose = require("mongoose");

const entryExitLogSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    gate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gate",
      required: true,
    },

    action: {
      type: String,
      enum: ["ENTRY", "EXIT"],
      required: true,
    },

    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },

    deviceId: {
      type: String,
      required: true,
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },
  }
);

entryExitLogSchema.index({
  student: 1,
  timestamp: -1,
});

entryExitLogSchema.index({
  gate: 1,
  timestamp: -1,
});

module.exports = mongoose.model("EntryExitLog", entryExitLogSchema);