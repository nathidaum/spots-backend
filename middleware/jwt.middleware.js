const jwt = require("jsonwebtoken");

// Instantiate the JWT token validation middleware
const isAuthenticated = (req, res, next) => {
  try {
    // Get token string from authorization header
    const token = req.headers.authorization.split(" ")[1];
    // Verify. Returns payload if the token is valid, otherwise throws an error
    const payload = jwt.verify(token, process.env.TOKEN_SECRET);
    req.payload = payload;
    next();
  } catch (err) {
    console.error("Token verification failed", err);
    res.status(400).json({ message: "Invalid token." });
  }
};

module.exports = { isAuthenticated };
