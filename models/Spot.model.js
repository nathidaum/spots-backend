const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const spotSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  deskCount: {
    type: Number,
    required: true,
    min: 1,
  },
  location: {
    city: { type: String, required: true },
    address: { type: String, required: true },
  },
  amenities: {
    type: [String],
    enum: [
      "Coffee",
      "Kitchen",
      "Lift",
      "Meeting Room",
      "Parking",
      "Phonebox",
      "Wifi"
    ],
  },
  price: { type: Number, required: true },
  blockedDates: [
    {
      startDate: { type: Date },
      endDate: { type: Date },
    },
  ],
  images: { type: [String], required: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
  createdAt: { type: Date, default: Date.now },
});

const Spot = mongoose.model("Spot", spotSchema);
module.exports = Spot;
