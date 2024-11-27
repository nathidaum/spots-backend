const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  mongoose.connection.db
    .admin()
    .ping()
    .then(() => {
      res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
      });
    })
    .catch((err) => {
      console.error("MongoDB ping failed:", err);
      res.status(500).json({
        status: "error",
        message: "Failed to connect to MongoDB",
      });
    });
});

module.exports = router;