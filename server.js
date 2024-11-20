require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Set up Middleware
app.use(express.json());

app.use(cors({ origin: "http://localhost:5173" }));

// Connect to MongoDB
connectDB();

// Handle routes
app.use("/", require("./routes"));

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
