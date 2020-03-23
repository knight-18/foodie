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

// error handling
router.use((eq, res, next) => {
  const error = new Error("Invalid Endpoint");
  error.status = 404;
  next(error);
});

router.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = router;
