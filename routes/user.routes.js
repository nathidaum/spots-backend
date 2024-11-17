const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { isAuthenticated } = require("../middleware/jwt.middleware")
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

    res.status(201).json({
      message: "User registered successfully.",
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error("Error trying to create an account...\n\n", err);
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
    console.error("Error trying to log in...\n\n", err);
    res.status(500).json({ message: "Internal Server Error." });
  }
});

// GET /auth/verify
router.get('/verify', isAuthenticated, (req, res, next) => {
 
  // If JWT token is valid the payload gets decoded by the
  // isAuthenticated middleware and made available on `req.payload`
  console.log(`req.payload`, req.payload);
 
  // Send back the object with user data
  // previously set as the token payload
  res.json(req.payload);
});


module.exports = router;
