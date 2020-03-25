const express = require("express");
const router = express.Router();
const Restaurant = require("../models/restaurant");
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
    res.status(400).send();
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
router.delete('/me', auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
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
