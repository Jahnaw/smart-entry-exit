const mongoose = require("mongoose");

const guardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    role: {
      type: String,
      default: "GUARD",
      enum: ["GUARD"],
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

module.exports = mongoose.model(
  "Guard",
  guardSchema
);