const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./src/config/db");

const testRoutes = require("./src/routes/testRoutes");

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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});