const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

const Booking = require("../models/Booking.model");
const Spot = require("../models/Spot.model");
const User = require("../models/User.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

// POST /bookings --> Create a new booking
// POST /bookings --> Create a new booking
router.post("/", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const { spotId, startDate, endDate } = req.body;

    if (!spotId || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const spot = await Spot.findById(spotId);
    if (!spot) {
      return res.status(404).json({ message: "Spot not found." });
    }

    const requestedStart = new Date(startDate);
    const requestedEnd = new Date(endDate);

    if (requestedStart > requestedEnd) {
      return res
        .status(400)
        .json({ message: "End date must be equal to or after start date." });
    }

    // Debug logs to ensure correct data
    console.log("Requested Start:", requestedStart);
    console.log("Requested End:", requestedEnd);
    console.log("Blocked Dates:", spot.blockedDates);

    // Strip time component for normalized date comparison
    const stripTime = (date) =>
      new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

    const isBlocked = spot.blockedDates.some(({ startDate, endDate }) => {
      const blockedStart = stripTime(new Date(startDate));
      const blockedEnd = stripTime(new Date(endDate));

      // Debug log for each blocked range
      console.log(
        `Checking blocked range: Blocked Start: ${blockedStart}, Blocked End: ${blockedEnd}, Requested Start: ${stripTime(
          requestedStart
        )}, Requested End: ${stripTime(requestedEnd)}`
      );

      return (
        stripTime(requestedStart) <= blockedEnd &&
        stripTime(requestedEnd) >= blockedStart
      );
    });

    if (isBlocked) {
      console.error(
        "Dates are blocked. Requested:",
        requestedStart,
        requestedEnd
      );
      return res
        .status(400)
        .json({ message: "The selected dates are already booked." });
    }

    // Create new booking
    const newBooking = await Booking.create({
      userId,
      spotId,
      startDate,
      endDate,
    });

    // Add the new blocked dates to the spot
    spot.blockedDates.push({ startDate: requestedStart, endDate: requestedEnd });
    await spot.save();

    // Add the booking to the user
    await User.findByIdAndUpdate(userId, {
      $push: { bookings: newBooking._id },
    });

    res.status(201).json({ success: true, booking: newBooking });
  } catch (err) {
    console.error("Error while creating the booking:", err);
    res.status(500).json({ message: "Error while creating the booking." });
  }
});

// GET /bookings --> Get all bookings for the logged-in user
router.get("/", isAuthenticated, async (req, res) => {
  try {
    console.log("Authenticated User in /bookings route:", req.user); // Debug log
    const userId = req.user._id; // Authenticated user's ID

    // find bookings belonging to the user
    const bookings = await Booking.find({ userId })
      .populate("userId", "firstName lastName email")
      .populate("spotId");

    res.status(200).json({ success: true, bookings });
  } catch (err) {
    console.error("Error while fetching bookings for the logged-in user:", err);
    res.status(500).json({
      message: "Error while fetching bookings for the logged-in user.",
    });
  }
});

// GET /bookings/:id --> Get details of a specific booking
router.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params; // Booking ID
    const userId = req.user._id; // Authenticated user's ID

    // Validate the Booking ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking ID." });
    }

    // Find the booking by ID and populate fields
    const booking = await Booking.findById(id)
      .populate("userId", "firstName lastName email")
      .populate("spotId");

    // If booking not found
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    // Ensure the user is either the one who created the booking or owns / hosts the spot
    const isBookingOwner = booking.userId._id.toString() === userId.toString();
    const isSpotOwner =
      booking.spotId.createdBy.toString() === userId.toString();

    if (!isBookingOwner && !isSpotOwner) {
      return res
        .status(403)
        .json({ message: "You are not authorized to view this booking." });
    }

    // Return the booking details
    res.status(200).json({ success: true, booking });
  } catch (err) {
    console.error("Error while fetching the booking:", err);
    res.status(500).json({ message: "Error while fetching the booking." });
  }
});

// DELETE /bookings/:id --> Cancel/delete a booking
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params; // Booking ID
    const userId = req.user._id; // Authenticated user's ID

    // Validate the Booking ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking ID." });
    }

    // Find the booking by ID
    const booking = await Booking.findById(id)
      .populate("userId", "firstName lastName email")
      .populate("spotId", "title location createdBy");

    // If booking not found
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    // Ensure the user is either the one who created the booking or owns/hosts the spot
    const isBookingOwner = booking.userId._id.toString() === userId.toString();
    const isSpotOwner =
      booking.spotId.createdBy.toString() === userId.toString();

    if (!isBookingOwner && !isSpotOwner) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this booking." });
    }

    // Delete the booking after authorization
    await Booking.findByIdAndDelete(id);

    res
      .status(200)
      .json({ success: true, message: "Booking deleted successfully." });
  } catch (err) {
    console.error("Error while deleting the booking:", err);
    res.status(500).json({ message: "Error while deleting the booking." });
  }
});

module.exports = router;
