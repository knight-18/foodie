const express = require("express");
const router = express.Router();
const multer = require('multer')
const sharp = require('sharp')
const Restaurant = require("../models/restaurant");
const Food = require("../models/food");
const superAdminAuth = require("../middleware/super_admin_middleware");
const auth = require("../middleware/restauth");

//==============Seeding===============
// if (process.env.NODE_ENV != "prod") {
//   const restaurant_seed = require("../seeds/restaurant_seed");
//   restaurant_seed();
// }

//Function to upload picture of restaurant
const upload = multer( {
  limits:{
      fileSize:1000000
  },
  fileFilter(req, file, cb) {

      if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
          cb(new Error('Please upload jpg,jpeg or png file only'))
      }

      cb(undefined, true)
  }
} )


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
 *        description: needs all the info about the restaurant
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
 *                    - rest_id
 *                    - contactNos
 *                    - address
 *                    - password
 *                  properties:
 *                    name:
 *                      type: string
 *                    rest_id:
 *                      type: string
 *                    contactNos:
 *                      type: array
 *                      items:
 *                        type: string
 *                      description: array of all the contact no's of the restaurant (each contact no. must be a string)
 *                    address:
 *                      type: string
 *                    password:
 *                      type: string
 *                      description: minimum length of password must be 7
 *              example:
 *                super:
 *                  username: admin
 *                  password: password
 *                restaurant:
 *                  name: Restaurant 1
 *                  rest_id: rest3
 *                  contactNos: ["8602313604"]
 *                  address: Example address, example street, example city...
 *                  password: "12345678"
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

/**
 * @swagger
 * path:
 *  /restaurant/login:
 *    post:
 *      summary: login a restaurant
 *      tags: [Restaurant]
 *
 *      requestBody:
 *        description: needs restaurant ID (rest_id) and password
 *        required: true
 *
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - password
 *                - rest_id
 *              properties:
 *                rest_id:
 *                  type: string
 *                password:
 *                  type: string
 *                  format: password
 *              example:
 *                rest_id: rest1
 *                password: "12345678"
 *
 *      responses:
 *        "200":
 *          description: logged in
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                required:
 *                  - password
 *                  - rest_id
 *                properties:
 *                  user:
 *                    type: object
 *                  token:
 *                    type: string
 *
 *        "400":
 *          description: An error occured
 */
router.post("/login", async (req, res) => {
  try {
    const restaurant = await Restaurant.findByCredentials(
      req.body.rest_id,
      req.body.password
    );
    const token = await restaurant.generateAuthToken();
    res.status(200).send({ restaurant, token });
  } catch (e) {
    res.status(500).send(e);
  }
});

//Logout route for restaurant

/**
 * @swagger
 * path:
 *  /restaurant/logout:
 *    post:
 *      security:
 *        - bearerAuth: []
 *      summary: logout a restaurant, while using it here, please copy the token from the login route and add it to authorize button on top
 *      tags: [Restaurant]
 *      responses:
 *        "200":
 *          description: logged out
 *        "400":
 *          description: please authenticate
 *        "401":
 *          $ref: '#/components/responses/UnauthorizedError'
 */

router.post("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => {
      return token.token !== req.token;
    });
    await req.user.save();

    res.status(200).send("Logged Out");
  } catch (e) {
    res.status(500).send(e);
  }
});

//Route to logout all sessions

/**
 * @swagger
 * path:
 *  /restaurant/logoutAll:
 *    post:
 *      security:
 *        - bearerAuth: []
 *      summary: logout a restaurant from All devices, while using it here, please copy the token from the login route and add it to authorize button on top
 *      tags: [Restaurant]
 *      responses:
 *        "200":
 *          description: logged out
 *        "400":
 *          description: please authenticate
 *        "500":
 *          description: internal server error
 */

router.post("/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send("Logged out all sessions");
  } catch (e) {
    res.status(500).send(e);
  }
});

//Route to read restaurant profile

/**
 * @swagger
 * path:
 *  /restaurant/me:
 *    get:
 *      security:
 *        - bearerAuth: []
 *      summary: read the restaurant profile, while using it here, please copy the token from the login route and add it to authorize button on top
 *      tags: [Restaurant]
 *      responses:
 *        "200":
 *          content:
 *            application/json:
 *              user:
 *                type: object
 *        "400":
 *         description: Please Authenticate
 */

router.get("/me", auth, async (req, res) => {
  res.send(req.user);
});

// update route for the restaurant

/**
 * @swagger
 * path:
 *  /restaurant:
 *    patch:
 *      security:
 *        - bearerAuth: []
 *      summary: Update the restaurant profile, while using it here, please copy the token from the login route and add it to authorize button on top
 *      tags: [Restaurant]
 *      requestBody:
 *        description: needs info to be updated
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - name
 *                - password
 *                - address
 *                - contactNos
 *              properties:
 *                name:
 *                  type: string
 *                password:
 *                  type: string
 *                  format: password
 *                address:
 *                  type: string
 *                contactNos:
 *                  type: array
 *                  items:
 *                    type: string
 *                    description: array of all the contact no's of the restaurant (each contact no. must be a string)
 *              example:
 *                name: Restaurant Update
 *                password: testtestupdate
 *                address: test address update
 *                contactNos: ["8889986863","8602313604"]
 *      responses:
 *        "200":
 *          content:
 *            application/json:
 *              user:
 *                type: object
 *        "400":
 *         description: Please Authenticate
 */
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

// get the details of the restaurant for details page

/**
 * @swagger
 * path:
 *  /restaurant/{id}:
 *    get:
 *      summary: get the restaurant profile for user
 *      tags: [Restaurant]
 *      parameters:
 *        - in: path
 *          name: id
 *      description: restaurant id is taken from the path parameters
 *      responses:
 *        "200":
 *          description: Restaurant Information for user
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  _id:
 *                    type: string
 *                    description: The restaurant object ID.
 *                  address:
 *                    type: string
 *                    description: The restaurant address.
 *                  contactNos:
 *                    type: array
 *                    items:
 *                      type: string
 *                    description: array of contact numbers of restaurants
 *                  foods:
 *                    type: array
 *                    items:
 *                      type: string
 *                    description: array of foods available at the restaurant
 *        "500":
 *          description: No such restaurant found
 */

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
      foods: restaurant.foods,
      image: restaurant.image
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

// route to add new food
/**
 * @swagger
 * path:
 *   /restaurant/food:
 *     post:
 *       summary: Add food to the restaurant
 *       tags: [Restaurant]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - foodid
 *                 - price
 *               properties:
 *                 foodid:
 *                   type: string
 *                   description: Id of the food object
 *                 price:
 *                   type: string
 *                   description: price at which the food is available in the restaurant
 *       responses:
 *         "200":
 *           description: Food added to the restaurant
 *         "404":
 *           description: Food doesn't exists.Please add it first from food routes first
 *         "500":
 *           description: Error
 *
 *
 *
 */
router.post("/food", auth, async (req, res) => {
  try {
    const food = await Food.findById(req.body.foodid);
    if (!food) {
      res.status(404).json({
        error: "Food doesn't exist"
      });
    } else {
      const restaurant = req.user;
      restaurant.foods.push({
        foodid: req.body.foodid,
        price: req.body.price
      });
      const result = await restaurant.save();

      food.restaurants.push(result._id);
      food.save();
      res.status(200).send("Food added to restaurant");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// route to delete food from the restaurant
/**
 * @swagger
 * path:
 *   /restaurant/food:
 *     delete:
 *       security:
 *         - bearerAuth: []
 *       summary: route to delete food from restaurant, while using it here, please copy the token from the login route(restaurant login) and add it to authorize button on top
 *       tags: [Restaurant]
 *       requestBody:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - foodid
 *               properties:
 *                 foodid:
 *                   type: string
 *                   description: Object Id of the food to be deleted
 *       responses:
 *         "200":
 *           description: Food deleted
 *         "500":
 *           description: Error
 *
 */
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


//route to upload image of the restaurant
/**
 * @swagger
 * path:
 *   /restaurant/image:
 *     post:
 *       summary: Route to upload image of the restaurant(File size should not exceed 1 MB) 
 *       security:
 *         - bearerAuth: []
 *       required: true
 *       tags: [Restaurant]
 *       requestBody:
 *         content:
 *           image/jpg:
 *             schema:
 *               type: string
 *               format: binary
 *       responses:
 *         "200":
 *           description: Added Restaurant picture successfully
 *         "400":
 *           description: Unable to add restaurant picture 
 * 
 */
router.post('/image', auth, upload.single('image'), async (req, res) => {
  try {
    const buffer = await sharp(req.file.buffer).resize( {width:150, height:150} ).png().toBuffer()
    req.user.image = buffer
    await req.user.save()
    res.send("Added Restaurant Picture Successfully")
  } catch (error) {
    res.status(400).send(error)
  }
},(error, req, res, next) => {
  res.status(400).send({error: error.message})
})

module.exports = router;
