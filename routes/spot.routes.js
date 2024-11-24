const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

const Spot = require("../models/Spot.model");
const User = require("../models/User.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

// POST	/spots --> Create a new spot
router.post("/", isAuthenticated, async (req, res) => {
  try {
    // Extract user ID from the authenticated user
    const createdBy = req.user._id;

    // Extract fields from request body
    const {
      title,
      description,
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
      !location ||
      !location.city ||
      !location.address ||
      !amenities?.length ||
      !price
    ) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: "Images must be an array with at least one URL." });
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

// GET /spots --> Fetch all spots with optional city filters
router.get("/", async (req, res) => {
  try {
    const { city } = req.query;

    // Build the query object dynamically based on filters
    const query = {};
    if (city) query["location.city"] = city;

    // Fetch spots based on the query
    const spots = await Spot.find(query).populate("createdBy", "company");

    res.status(200).json({ success: true, spots });
  } catch (err) {
    console.error("Error fetching spots:", err);
    res.status(500).json({ message: "Error fetching spots." });
  }
});

// GET /spots/:id --> Fetch details of a specific spot
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ID  to avoid attempting to query the DB with invalid input
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid spot ID." });
    }

    // Find the spot by ID
    const spot = await Spot.findById(id)
      .populate("createdBy")
      .populate("bookings");

    // If spot is not found
    if (!spot) {
      return res.status(404).json({ message: "Spot not found." });
    }

    // Respond with the spot details
    res.status(200).json({ success: true, spot });
  } catch (err) {
    console.error("Error fetching the spot:", err);
    res.status(500).json({ message: "Error fetching the spot." });
  }
});

// PUT /spots/:id --> Update a specific spot (only the creator / owner)
router.put("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body; // Fields to update
    const userId = req.user._id; // Authenticated user's ID

    // Validate the ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid spot ID." });
    }

    // Find the spot by ID
    const spot = await Spot.findById(id);

    // If spot not found
    if (!spot) {
      return res.status(404).json({ message: "Spot not found." });
    }

    // Ensure the user owns the spot
    if (spot.createdBy.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this spot." });
    }

    // Update the spot
    const updatedSpot = await Spot.findByIdAndUpdate(id, updates, {
      new: true, // Return the updated document
      runValidators: true, // Ensure the updates follow schema validation rules
    });

    res.status(200).json({ success: true, spot: updatedSpot });
  } catch (err) {
    console.error("Error updating the spot:", err);
    res.status(500).json({ message: "Error updating the spot." });
  }
});

// DELETE /spots/:id --> Delete a specific spot (owner-only)
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id; // Authenticated user's ID

    // Validate the ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid spot ID." });
    }

    // Find the spot by ID
    const spot = await Spot.findById(id);

    // If spot not found
    if (!spot) {
      return res.status(404).json({ message: "Spot not found." });
    }

    // Ensure the user created / owns the spot
    if (spot.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You are not authorized to delete this spot." });
    }

    // Delete the spot
    await Spot.findByIdAndDelete(id);

    // Remove the spot reference from the user's createdSpots array
    await User.findByIdAndUpdate(userId, {
      $pull: { createdSpots: id },
    });

    res.status(200).json({ success: true, message: "Spot deleted successfully." });
  } catch (err) {
    console.error("Error deleting the spot:", err);
    res.status(500).json({ message: "Error deleting the spot." });
  }
});

module.exports = router;
