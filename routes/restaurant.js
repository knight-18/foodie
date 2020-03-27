const express = require("express");
const router = express.Router();
const Restaurant = require("../models/restaurant");
const Food = require("../models/food");
const superAdminAuth = require("../middleware/super_admin_middleware");
const auth = require("../middleware/restauth");

//==============Seeding===============
if (process.env.NODE_ENV != "prod") {
  const restaurant_seed = require("../seeds/restaurant_seed");
  restaurant_seed();
}

//=========================== Routes==================================

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
      console.log(err);
      res.status(500).json(err);
    } else {
      var data = [];
      restaurants.forEach(restaurant => {
        data.push({
          id: restaurant._id,
          name: restaurant.name,
          //foods: restaurant.foods,
          //contacts: restaurant.contactNos,
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
 *  /restaurant:
 *    post:
 *      summary: create a new restaurant
 *      tags: [Restaurant]
 *
 *      requestBody:
 *        description: needs all the info about the restuarant
 *        required: true
 *
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - super
 *                - restaurant
 *              properties:
 *                super:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *                   password:
 *                     type: string
 *                     format: password
 *                restaurant:
 *                  type: object
 *                  required:
 *                    - name
 *                    - contactNos
 *                    - address
 *                  properties:
 *                    name:
 *                      type: string
 *                    contactNos:
 *                      type: array
 *                      items:
 *                        type: string
 *                      description: array of all the contact no's of the restaurant (each contact no. must be a string)
 *                    address:
 *                      type: string
 *              example:
 *                super:
 *                  username: admin
 *                  password: password
 *                restaurant:
 *                  name: Restaurant 1
 *                  contactNos: ["+919432451728"]
 *                  address: Example address, example street, example city...
 *
 *
 *      responses:
 *        "201":
 *          description: Restaurant Created
 *        "500":
 *          description: internal server error occured
 */

router.post("/", superAdminAuth, async (req, res) => {
  const restaurant = new Restaurant(req.body.restaurant);
  try {
    await restaurant.save();
    const token = await restaurant.generateAuthToken();
    res.status(201).send({ restaurant, token });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

//Login Route for restaurant
router.post("/login", async (req, res) => {
  try {
    const restaurant = await Restaurant.findByCredentials(
      req.body.rest_id,
      req.body.password
    );
    const token = await restaurant.generateAuthToken();
    res.send({ restaurant, token });
  } catch (e) {
    res.status(500).send(e);
  }
});

//Logout route for restaurant
router.post("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => {
      return token.token !== req.token;
    });
    await req.user.save();

    res.send("Logged Out");
  } catch (e) {
    res.status(500).send();
  }
});

//Route to logout all sessions
router.post("/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});
//Route to read restaurant profile
router.get("/me", auth, async (req, res) => {
  res.send(req.user);
});

//Route to delete restaurant profile
router.delete("/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

// upadte route for the restaurant
router.patch("/", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "password", "address", "contactNos"];
  const isValidOperation = updates.every(update =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }
  if (updates.contactNos && !updates.contactNos.isArray()) {
    return res.status(400).send({
      error:
        "contactNos should be an array containing all the numbers of the restaurants including the old ones!"
    });
  }
  try {
    updates.forEach(update => (req.user[update] = req.body[update]));
    await req.user.save();
    res.status(200).send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

// get the details of the restarant for details page
router.get("/:_id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params._id).populate(
      "foods.foodid"
    );

    if (!restaurant) {
      return res.status(404).json({
        error: "No such restaurant found!"
      });
    }

    res.status(200).json({
      _id: restaurant._id,
      name: restaurant.name,
      contactNos: restaurant.contactNos,
      address: restaurant.address,
      foods: restaurant.foods
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

// route to add new food

router.post("/food", auth, async (req, res) => {
  try {
    const food = await Food.findById(req.body.foodid);
    if (!food) {
      res.status(404).json({
        error: "Food doesn't exist"
      });
    }
    const restaurant = req.user;
    restaurant.foods.push({
      foodid: req.body.foodid,
      price: req.body.price
    });
    const result = await restaurant.save();

    food.restaurants.push(result._id);
    food.save();
    res.status(200).end();
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// route to delete food from the restaurant
router.delete("/food", auth, async (req, res) => {
  try {
    const restaurant = req.user;
    restaurant.foods = restaurant.foods.filter(obj => {
      return obj.foodid != req.body.foodid;
    });
    const food = await Food.findById(req.body.foodid);
    let arr = [];
    for (let i = 0; i < food.restaurants.length; i++) {
      if (food.restaurants[i] != restaurant.id) {
        arr.push(food.restaurants[i]);
      }
    }
    food.restaurants = arr;
    food.save();
    const result = await restaurant.save();
    res.status(200).end();
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
