const mongoose = require("mongoose");

const gateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["MAIN", "HOSTEL"],
      required: true,
      default: "HOSTEL",
    },

    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      required: function () {
        return this.type === "HOSTEL";
      },
    },

    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },

    radius: {
      type: Number,
      required: true,
      default: 50,
      min: 10,
      max: 500,
    },

    qrToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Gate", gateSchema);