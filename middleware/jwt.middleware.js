const jwt = require("jsonwebtoken");

// JWT token validation middleware
const isAuthenticated = (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Authorization header is missing." });
    }

    // Extract token from authorization header
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token is missing." });
    }

    // Verify the token and attach the payload to the request
    const payload = jwt.verify(token, process.env.TOKEN_SECRET);
    req.payload = payload;
    console.log("Payload:", payload);

    next();
  } catch (err) {
    console.error("Token verification failed", err);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired." });
    } else if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token." });
    } else {
      return res.status(500).json({ message: "Internal server error." });
    }
  }
};

module.exports = { isAuthenticated };
