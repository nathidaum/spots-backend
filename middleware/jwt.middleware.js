const jwt = require("jsonwebtoken");

// Instantiate the JWT token validation middleware
const isAuthenticated = (req, res, next) => {
  try {
    
    if (!req.headers.authorization) {
        return res.status(401).json({ message: "Authorization header is missing." });
      }
    
    // Get token string from authorization header
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Token is missing." });
      }

    // Verify. Returns payload if the token is valid, otherwise throws an error
    const payload = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = payload;
    next();

  } catch (err) {
    console.error("Token verification failed", err);
    res.status(400).json({ message: "Invalid token." });

    // Return status codes based on the error
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
