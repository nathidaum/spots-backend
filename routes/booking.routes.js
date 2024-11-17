const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

const Booking = require("../models/Booking.model");
const Spot = require("../models/Spot.model");
const User = require("../models/User.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

// POST /bookings --> Create a new booking
router.post("/bookings", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user._id; // Authenticated user's ID
      const { spotId, startDate, endDate } = req.body;
  
      // Validate required fields
      if (!spotId || !startDate || !endDate) {
        return res.status(400).json({ message: "Missing required fields." });
      }
  
      // Check if the spot exists
      const spot = await Spot.findById(spotId);
      if (!spot) {
        return res.status(404).json({ message: "Spot not found." });
      }
  
      // Ensure endDate is equal to or after startDate
      if (new Date(startDate) > new Date(endDate)) {
        return res
          .status(400)
          .json({ message: "End date must be equal to or after start date." });
      }
  
      // Create the booking
      const newBooking = await Booking.create({
        userId, // Authenticated user ID
        spotId,
        startDate,
        endDate,
      });
  
      // Add the booking reference to the user's bookings array
      await User.findByIdAndUpdate(userId, {
        $push: { bookings: newBooking._id },
      });
  
      res.status(201).json({ success: true, booking: newBooking });
    } catch (err) {
      console.error("Error while creating the booking:", err);
      res.status(500).json({ message: "Error while creating the booking." });
    }
  });  

// GET	/bookings --> Get all bookings for the logged-in user

// GET	/bookings/:id --> Get details of a specific booking

// DELETE /bookings/:id  --> Cancel/ delete a booking


module.exports = router; 