const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./src/config/db");

const testRoutes = require("./src/routes/testRoutes");
const authRoutes = require("./src/routes/authRoutes");
const studentRoutes = require("./src/routes/studentRoutes");
const deviceRoutes = require("./src/routes/deviceRoutes");
const gateRoutes = require("./src/routes/gateRoutes");
const geofenceRoutes = require("./src/routes/geofenceRoutes");
const attendanceRoutes = require("./src/routes/attendanceRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Smart Entry-Exit API is running",
  });
});

app.use("/api/test", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/device", deviceRoutes);
app.use("/api/gates", gateRoutes);
app.use("/api/geofence", geofenceRoutes);
app.use("/api/attendance", attendanceRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
