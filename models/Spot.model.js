const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const spotSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: {
    type: String,
    enum: ["spot", "room", "office"],
    required: true,
  },
  deskCount: {
    type: Number,
    required: function () {
      return this.type === "room" || this.type === "office";
    },
  },
  location: {
    city: { type: String, required: true },
    address: { type: String, required: true },
  },
  amenities: {
    type: [String],
    enum: [
      "Wifi",
      "Parking",
      "Coffee",
      "Lift",
      "Phonebox",
      "Meeting Room",
      "Kitchen",
    ],
    required: true,
  },
  price: { type: Number, required: true },
  availability: [{ startDate: Date, endDate: Date }],
  images: { type: [String], required: true },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
  createdAt: { type: Date, default: Date.now },
});

const Spot = mongoose.model("Spot", spotSchema);
module.exports = Spot;
