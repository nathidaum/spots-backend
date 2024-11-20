const express = require("express");
const router = express.Router();

router.use("/users", require("./user.routes"));
router.use("/spots", require("./spot.routes"));
router.use("/bookings", require("./booking.routes"));

module.exports = router;