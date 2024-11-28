const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  spotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Spot",
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
    index: true
  },
  endDate: {
    type: Date,
    required: true,
  },
  bookedAt: {
    type: Date,
    default: Date.now,
  }
});

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
