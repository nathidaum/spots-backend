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
  },
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "canceled", "completed", "blocked"],
    default: "pending",
  }, // "blocked" for host blocks
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdByHost: {
    type: Boolean,
    default: false,
  }, // true for host-created blocks
});

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
