const mongoose = require("mongoose");

const entryExitLogSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    gate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gate",
      required: true,
      index: true,
    },

    action: {
      type: String,
      enum: ["ENTRY", "EXIT"],
      required: true,
    },

    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },

    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },

    accuracy: {
      type: Number,
      required: true,
    },

    distanceFromGate: {
      type: Number,
      required: true,
    },

    device: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "EntryExitLog",
  entryExitLogSchema
);