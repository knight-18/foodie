const express = require("express");
const User = require("../models/user");
const Restaurant = require("../models/restaurant");
const Order = require("../models/order");
const auth = require("../middleware/userauth");
const router = express.Router();

//==============Seeding===============
// if (process.env.NODE_ENV != "prod") {
//   const user_seed = require("../seeds/user_seed");
//   user_seed();
// }

//=========================== Routes==================================

/**
 * @swagger
 * tags:
 *   name: user
 * components:
 *  securitySchemes:
 *    bearerAuth:
 *      type: http
 *      scheme: bearer
 *      bearerFormat: JWT
 */

/**
 * @swagger
 * path:
 *  /user/test:
 *    get:
 *      summary: check if user router is configured correctly
 *      tags: [user]
 *      responses:
 *        "200":
 *          description: Test successfull
 *          content:
 *            text/html:
 *              [SUCCESS]: user routes connected!
 */
router.get("/test", (req, res) => {
  res.status(200);
  res.send("[SUCCESS]: User routes connected!");
});

/**
 * @swagger
 * path:
 *  /user:
 *    post:
 *      summary: create a new user
 *      tags: [user]
 *
 *      requestBody:
 *        description: needs all info about the user
 *        required: true
 *
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - name
 *                - password
 *                - email
 *                - phone
 *              properties:
 *                name:
 *                  type: string
 *                password:
 *                  type: string
 *                  format: password
 *                email:
 *                  type: string
 *                address:
 *                  type: string
 *                phone:
 *                  type: string
 *              example:
 *                name: test
 *                email: test@test.com
 *                password: "12345678"
 *                address: test address
 *                phone: "8602313604"
 *
 *      responses:
 *        "201":
 *          description: User Created
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  user:
 *                    type: object
 *                  token:
 *                    type: string
 *
 *        "400":
 *          description: internal server error occured
 */

//Route to create User
router.post("/", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

/**
 * @swagger
 * path:
 *  /user/login:
 *    post:
 *      summary: login a user
 *      tags: [user]
 *
 *      requestBody:
 *        description: needs phone and password of the user
 *        required: true
 *
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - password
 *                - phone
 *              properties:
 *                phone:
 *                  type: string
 *                password:
 *                  type: string
 *                  format: password
 *              example:
<<<<<<< HEAD
 *                phone: "+918602313604"
=======
 *                phone: "8602313604" 
>>>>>>> fb24c191b93d25822a5e2721c26eb89e50a8eb12
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
 *                  - email
 *                properties:
 *                  user:
 *                    type: object
 *                  token:
 *                    type: string
 *
 *        "400":
 *          description: An error occured
 */

//Login Route for user
router.post("/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.phone,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.status(200);
    res.send({ user, token });
  } catch (e) {
    res.status(400).send();
  }
});

/**
 * @swagger
 * path:
 *  /user/logout:
 *    post:
 *      security:
 *        - bearerAuth: []
 *      summary: logout a user, while using it here, please copy the token from the login route and add it to authorize button on top
 *      tags: [user]
 *      responses:
 *        "200":
 *          description: logged out
 *        "400":
 *          description: please authenticate
 *        "401":
 *          $ref: '#/components/responses/UnauthorizedError'
 */

//Logout route for user
router.post("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();

    res.send("Logged out");
  } catch (e) {
    res.status(500).send(e);
  }
});

/**
 * @swagger
 * path:
 *  /user/logoutAll:
 *    post:
 *      security:
 *        - bearerAuth: []
 *      summary: logout a user from All devices, while using it here, please copy the token from the login route and add it to authorize button on top
 *      tags: [user]
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
/**
 * @swagger
 * path:
 *  /user/me:
 *    get:
 *      security:
 *        - bearerAuth: []
 *      summary: read the user profile
 *      tags: [user]
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
  res.status(200);
  res.send(req.user);
});
/**
 * @swagger
 * path:
 *  /user/me:
 *    patch:
 *      security:
 *        - bearerAuth: []
 *      summary: update the user profile
 *      tags: [user]
 *      requestBody:
 *        description: needs all info about the user
 *        required: true
 *
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - name
 *                - password
 *                - email
 *                - address
 *                - phone
 *              properties:
 *                name:
 *                  type: string
 *                password:
 *                  type: string
 *                  format: password
 *                email:
 *                  type: string
 *                address:
 *                  type: string
 *                phone:
 *                  type: string
 *              example:
 *                name: test
 *                email: test@test.com
 *                password: testtest
 *                address: test address
 *                phone: "7346348343"
 *      responses:
 *        "200":
 *          content:
 *            application/json:
 *              user:
 *                type: object
 *        "400":
 *         description: Please Authenticate
 */

router.patch("/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "address", "phone"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.status(200).send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});
/**
 * @swagger
 * path:
 *  /user/order:
 *    post:
 *      summary: create order
 *      tags: [user]
 *      security:
 *        - bearerAuth: []
 *
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - password
 *                - email
 *              properties:
 *                restaurantId:
 *                  type: string
 *                  description: Id of the restaurant that is to be ordered from
 *                foods:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      foodid:
 *                        type: string
 *                      quantity:
 *                        type: number
 *                payment:
 *                  type: object
 *                  properties:
 *                    method:
 *                      type: string
 *                      description: only one of "UPI" "COD" or "CARD"
 *                    status:
 *                      type: string
 *                      description: only one of "UNPAID" or "PAID"
 *
 *      responses:
 *        "200":
 *          description: order created
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  restaurant:
 *                    type: object
 *                    properties:
 *                      _id:
 *                        type: string
 *                        description: ObjectId of Restaurant
 *                      name:
 *                        type: string
 *                        description: Name of the Restaurant
 *                  user:
 *                    type: object
 *                    properties:
 *                      _id:
 *                        type: string
 *                        description: ObjectId of User
 *                      name:
 *                         type: string
 *                         description: Name of the User
 *                  deliveryGuy:
 *                    type: object
 *                    properties:
 *                      _id:
 *                        type: string
 *                  payment:
 *                    type: object
 *                    properties:
 *                      status:
 *                        type: string
 *                        description: Payment status of the order i.e. "UNPAID", "PAID"
 *                      total:
 *                        type: number
 *                        description: Total amount of the order to be paid
 *                      method:
 *                        type: string
 *                        description: Mode of payment i.e. "COD", "UPI", "CARD"
 *                  status:
 *                    type: string
 *                    decription: Status of the order i.e. "RECIEVED", "LEFT", "DELIVERED", "CANCELED"
 *                  _id:
 *                    type: string
 *                    description: ObjectId of Order
 *                  foods:
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        quantity:
 *                          type: number
 *                          description:
 *                        _id:
 *                          type: string
 *                          description: ObjectId of Food
 *                        price:
 *                          type: number
 *                          description: Price of the food
 *                        name:
 *                          type: string
 *                          description: Name of the Food
 *
 *        "500":
 *          description: An error occured
 */

// route to create orders
router.post("/order", auth, async (req, res) => {
  try {
    const user = req.user;
    const { foods, restaurantId, payment } = req.body;
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).send("Restaurant Not found");
    }
    const length = foods.length;
    const newFoods = foods.map((obj) => {
      const price = restaurant.foods.find((doc) => {
        return doc.foodid == obj.foodid;
      }).price;
      return {
        ...obj,
        price: price,
        length: length,
      };
    });
    const order = new Order({
      payment,
    });
    //console.log(newFoods);
    order.setTotal(newFoods);
    await order.setUser(user);
    await order.setRestaurant(restaurant);
    await order.setFoods(newFoods);
    const result = await order.save();

    res.status(200).json(result);
  } catch (error) {
<<<<<<< HEAD
    console.log(error);
=======
>>>>>>> fb24c191b93d25822a5e2721c26eb89e50a8eb12
    res.status(500).json(error);
  }
});

module.exports = router;
