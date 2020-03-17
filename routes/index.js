const express = require("express");
const router = express.Router();

// Routers
const user = require("./user");
const restaurant = require("./restaurant");
const food = require("./food");

// Using Routes
router.use("/api/user", user);
router.use("/api/restaurant", restaurant);
router.use("/api/food", food);

// NonExistent Route
router.get("*", (req, res) => {
  res.send("Invalid Endpoint");
});

module.exports = router;
