const express = require("express");
const router = express.Router();

const Food = require("../models/food.js");
const Restaurant = require("../models/restaurant");
const restAuth = require("../middleware/restauth");

if (process.env.NODE_ENV != "prod") {
  const food_seed = require("../seeds/food_seed");
  setTimeout(() => {
    food_seed();
  }, 1000);
}

// const superAdminAuth = require("../middleware/super_admin_middleware");
// router.use(express.json());
//=========================== Routes==================================

/**
 * @swagger
 * tags:
 *   name: food
 */

//=======================================
const getResponse = function(foods) {
  return foods.map(food => {
    const restaurantList = food.restaurants.map(restaurant => {
      const price = restaurant.foods.find(obj => food.id == obj.foodid).price;
      return {
        name: restaurant.name,
        _id: restaurant.id,
        price: price
      };
    });

    return {
      name: food.name,
      _id: food.id,
      restaurants: restaurantList
    };
  });
};
//=============ROUTES====================
//find food
router.get("/", async (req, res) => {
  try {
    const foods = await Food.find({})
      .populate("restaurants")
      .exec();
    if (!foods) {
      res.status(404).send();
    }
    const response = getResponse(foods);
    res.json(response);
  } catch (e) {
    res.status(500).send();
  }
});

//create food
router.post("/", restAuth, async (req, res) => {
  const food = new Food({
    name: req.body.name,
    restaurants: [req.user._id]
  });
  try {
    const result = await food.save();
    const restaurant = req.user;
    restaurant.foods.push({
      foodid: result._id,
      price: req.body.price
    });
    await restaurant.save();
    res.status(201).json(result);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @swagger
 * path:
 *  /food/test:
 *    get:
 *      summary: check if food router is configured correctly
 *      tags: [food]
 *      responses:
 *        "200":
 *          description: Test successfull
 *          content:
 *            text/html:
 *              [SUCCESS]: food routes connected!
 */
router.get("/test", (req, res) => {
  res.status(200);
  res.send("[SUCCESS]: Food routes connected!");
});

module.exports = router;
