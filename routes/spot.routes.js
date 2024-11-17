const express = require("express");
const router = express.Router();

const Spot = require("../models/Spot.model");
const User = require("../models/User.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

// POST	/spots --> Create a new spot
router.post("/spots", isAuthenticated, async (req, res) => {
  try {
    // Extract user ID from the authenticated user
    const createdBy = req.user._id;

    // Extract fields from request body
    const {
      title,
      description,
      type,
      deskCount,
      location,
      amenities,
      price,
      availability,
      images,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !type ||
      !location ||
      !location.city ||
      !location.address ||
      !amenities?.length ||
      !price ||
      !images?.length
    ) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Check if user exists
    const user = await User.findById(createdBy);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Create the spot
    const newSpot = await Spot.create({
      title,
      description,
      type,
      deskCount,
      location,
      amenities,
      price,
      availability,
      images,
      createdBy,
      status: "active", // Set default status
    });

    // Add the new spot to the user's createdSpots array
    await User.findByIdAndUpdate(createdBy, {
      $push: { createdSpots: newSpot._id },
    });

    res.status(201).json({ success: true, spot: newSpot });
  } catch (err) {
    console.error("Error while creating the spot:", err);
    res.status(500).json({ message: "Error while creating the spot." });
  }
});

// GET /spots --> Fetch all spots with optional type and city filters
router.get("/spots", async (req, res) => {
  try {
    const { type, city } = req.query;

    // Build the query object dynamically based on filters
    const query = {};
    if (type) query.type = type;
    if (city) query["location.city"] = city;

    // Fetch spots based on the query
    const spots = await Spot.find(query);

    res.status(200).json({ success: true, spots });
  } catch (err) {
    console.error("Error fetching spots:", err);
    res.status(500).json({ message: "Error fetching spots." });
  }
});

module.exports = router;
