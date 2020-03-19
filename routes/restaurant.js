const express = require("express");
const router = express.Router();
const Restaurant = require("../models/restaurant");

//==============Seeding===============
if (process.env.NODE_ENV != "prod") {
  const restaurant_seed = require("../seeds/restaurant_seed");
  restaurant_seed();
}

//=========================== Routes==================================

/**
 * @swagger
 * tags:
 *   name: Restaurant
 */

/**
 * @swagger
 * path:
 *  /restaurant:
 *    get:
 *      summary: get a list of all restaurants
 *      tags: [Restaurant]
 *      responses:
 *        "200":
 *          description: Gives back all the restaurants
 *          content:
 *            application/json:
 *              schema:
 *              $ref: "#/components/schemas/Restaurant"
 *
 *
 */
router.get("/", (req, res) => {
  Restaurant.find({}, (err, restaurants) => {
    if (err) {
      res.sendStatus(500);
    } else {
      var data = [];
      restaurants.forEach(restaurant => {
        data.push({
          id: restaurant._id,
          name: restaurant.name,
          foods: restaurant.foods,
          contacts: restaurant.contactNos,
          address: restaurant.address
        });
      });
      res.json(data);
    }
  });
});

/**
 * @swagger
 * path:
 *  /restaurant/test:
 *    get:
 *      summary: check if restaurant router is configured correctly
 *      tags: [Restaurant]
 *      responses:
 *        "200":
 *          description: Test successfull
 *          content:
 *            text/html:
 *              [SUCCESS]: Restaurant routes connected!
 */
router.get("/test", (req, res) => {
  res.status(200);
  res.send("[SUCCESS]: Restaurant routes connected!");
});

module.exports = router;
