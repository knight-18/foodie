const express = require("express");
const router = express.Router();

// Routers
const user = require("./user");
const restaurant = require("./restaurant");
const food = require("./food");
const deliveryGuy = require("./deliveryGuy")

// Using Routes
router.use("/api/user", user);
router.use("/api/restaurant", restaurant);
router.use("/api/food", food);
router.use("/api/deliveryGuy", deliveryGuy)

/**
 * @swagger
 * path:
 *  /invalid:
 *    get:
 *      summary: sends a 404 for all invalid endpoints
 *      responses:
 *        404:
 *          description: Invalid Endpoint
 *
 */
router.get("/*", (req, res) => {
  res.status(404);
  res.send("Invalid Endpoint");
});

module.exports = router;
