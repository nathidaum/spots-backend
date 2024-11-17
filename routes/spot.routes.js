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
    const spots = await Spot.find(query).populate("createdBy", "company");

    res.status(200).json({ success: true, spots });
  } catch (err) {
    console.error("Error fetching spots:", err);
    res.status(500).json({ message: "Error fetching spots." });
  }
});

// GET /spots/:id --> Fetch details of a specific spot
router.get("/spots/:id", async (req, res) => {
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
router.put("/spots/:id", isAuthenticated, async (req, res) => {
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

module.exports = router;
