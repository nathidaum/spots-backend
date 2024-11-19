const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profile: {
    phoneNumber: { type: String },
    position: { type: String },
    linkedInUrl: { type: String }, 
    company: { type: String, required: true },
  },
  createdSpots: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Spot", // References spots created by the host
    },
  ],
  bookings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking", // References bookings made by the user
    },
  ],
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Spot",
    },
  ],
  createdAt: { type: Date, default: Date.now }, 
}); // research time in mongoose

const User = mongoose.model("User", userSchema);
module.exports = User;
