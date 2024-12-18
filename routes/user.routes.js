const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { isAuthenticated } = require("../middleware/jwt.middleware");
const User = require("../models/User.model");

// POST /users/register --> Register a new user
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, profile } = req.body;

    // VALIDATIONS
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        message: "Please provide email, password, first name, and last name.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "Please provide a valid email address." });
    }

    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Your password must have at least 6 characters and contain at least one number, one lowercase, and one uppercase letter.",
      });
    }

    if (!profile?.company) {
      return res
        .status(400)
        .json({ message: "Please provide your company name." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user in the DB
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      profile,
    });

    // Exclude the password field from the response (for security reasons)
    const { password: _, ...userWithoutPassword } = newUser.toObject();

    // Add these lines to generate and include the JWT token
    const payload = {
      _id: newUser._id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
    };

    const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn: "12h",
    });

    res.status(201).json({
      message: "User registered successfully.",
      user: userWithoutPassword,
      authToken, // Include token in response
    });
  } catch (err) {
    console.error("Error trying to create an account:", err.message, err.stack);
    res.status(500).json({ message: "Error registering user." });
  }
});

// POST /users/login --> Log in a user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // VALIDATIONS
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password." });
    }

    // Check the users collection if a user with the same email exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(401).json({ message: "User not found." });
    }

    // Compare the provided password with the one saved in the database
    const passwordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!passwordCorrect) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Create an object that will be set as the token payload
    const payload = {
      _id: existingUser._id,
      email: existingUser.email,
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
    };

    // Create and sign the token
    const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn: "12h", // Token expiration time
    });

    // Send the token as the response
    res.status(200).json({ authToken });
  } catch (err) {
    console.error("Error trying to log in...\n\n", err.message, err.stack);
    res.status(500).json({ message: "Internal Server Error." });
  }
});

// GET /auth/verify
router.get("/verify", isAuthenticated, (req, res, next) => {
  res.json(req.user);
});

router.get("/favorites", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id; ;
    console.log("User ID from token:", userId);

    const user = await User.findById(userId).populate("favorites");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const favorites = user.favorites || [];
    res.status(200).json({ favorites });
  } catch (error) {
    console.error("Error fetching user favorites:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
});

// DELETE /users/delete --> Delete the logged-in user's account
router.delete("/delete", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;

    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "Account deleted successfully." });
  } catch (err) {
    console.error("Error deleting user account:", err);
    res.status(500).json({ message: "Error deleting user account." });
  }
});

// POST /users/favorites --> Add or remove a spot from favorites
router.post("/favorites", isAuthenticated, async (req, res) => {
  try {
    const { spotId } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.favorites.includes(spotId)) {
      // If the spot is already a favorite, remove it
      user.favorites = user.favorites.filter((id) => id.toString() !== spotId);
    } else {
      // Otherwise, add it to favorites
      user.favorites.push(spotId);
    }

    await user.save();

    const updatedUser = await User.findById(userId).populate("favorites");
    res.status(200).json({ favorites: updatedUser.favorites });
  } catch (error) {
    console.error("Error toggling favorites:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});


module.exports = router;
