const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: [String],
    enum: ["guest", "host", "admin"],
    default: ["guest"],
  },
  profile: {
    phoneNumber: { type: String },
    position: { type: String }, // Guests only
    linkedInUrl: { type: String }, // Guests only
    company: { type: String, required: true }, // Required for both guests and hosts
  },
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
  // Ensure position and LinkedIn URL for guests
  if (this.role.includes("guest")) {
    if (!this.profile.position || !this.profile.linkedInUrl) {
      return next(
        new Error("Position and LinkedIn URL are required for guests."),
      );
    }
  }
  // Ensure company for all roles
  if (!this.profile.company) {
    return next(new Error("Your company name is required."));
  }
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
