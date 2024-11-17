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
});

// Add pre-save validation middleware
userSchema.pre("save", function (next) {
  // Ensure company for all roles
  if (!this.profile.company) {
    return next(new Error("Your company name is required."));
  }
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
