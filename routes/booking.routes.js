const express = require("express"); 
const router = express.Router();
const Bookings = require("../models/Booking.model")

// POST	/bookings --> Create a new booking

// GET	/bookings --> Get all bookings for the logged-in user

// GET	/bookings/:id --> Get details of a specific booking

// DELETE /bookings/:id  --> Cancel/ delete a booking


module.exports = router; 