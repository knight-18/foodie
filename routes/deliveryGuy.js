const express = require("express");
const router = express.Router();
var Order = require("../models/order");
var DeliveryGuy = require("../models/deliveryGuy");
const superAdminAuth = require("../middleware/super_admin_middleware");
const auth = require("../middleware/deliveryguyauth");

//==============Seeding===============
// if (process.env.NODE_ENV != "production") {
//   const deliveryGuy_seed = require("../seeds/deliveryGuy_seed");
//   deliveryGuy_seed();
// }

//===========ROUTES==================================

/**
 * @swagger
 * tags:
 *   name: DeliveryGuy
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * path:
 *  /deliveryguy/test:
 *    get:
 *      summary: check if user router is configured correctly
 *      tags: [DeliveryGuy]
 *      responses:
 *        "200":
 *          description: Test successfull
 *          content:
 *            text/html:
 *              [SUCCESS]: deliveryGuy routes connected!
 */

router.get("/test", (req, res) => {
  res.status(200);
  res.send("[SUCCESS]: DeliveryGuy routes connected!");
});

//Router to access all delivery boys.Only SuperAdmin can access list of all delivery boys

router.get("/", superAdminAuth, async (req, res) => {
  try {
    var deliveryGuy = await DeliveryGuy.find({});
    if (!deliveryGuy) {
      res.status(404).send();
    }
    res.json(deliveryGuy);
  } catch (e) {
    res.status(500).send();
  }
});

//Route to create deliveryGuy. Requires superadmin authentication

/**
 * @swagger
 * path:
 *  /deliveryguy:
 *    post:
 *      summary: create a new deliveryguy
 *      tags: [DeliveryGuy]
 *
 *      requestBody:
 *        description: needs all the info about the deliveryguy
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
 *                deliveryGuy:
 *                  type: object
 *                  required:
 *                    - name
 *                    - phone
 *                    - username
 *                    - password
 *                  properties:
 *                    name:
 *                      type: string
 *                    phone:
 *                      type: string
 *                    username:
 *                      type: string
 *                    password:
 *                      type: string
 *                      description: minimum length of password must be 7
 *              example:
 *                super:
 *                  username: admin
 *                  password: password
 *                deliveryGuy:
 *                  name: deliveryGuy 1
 *                  phone: 8889998899
 *                  username: dguy1
 *                  password: "12345678"
 *      responses:
 *        "201":
 *          description: deliveryGuy Created
 *        "500":
 *          description: internal server error occured
 */

router.post("/", superAdminAuth, async (req, res) => {
  const deliveryGuy = new DeliveryGuy(req.body.deliveryGuy);
  try {
    await deliveryGuy.save();
    const token = await deliveryGuy.generateAuthToken();
    res.status(201).send({ deliveryGuy, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

//Route to get details o forder for which delivery guy is not assigned

/**
 * @swagger
 * path:
 *  /deliveryguy/notify:
 *    get:
 *      summary: Route to get details of orders for which the deliveryguy is not assigned yet
 *      tags: [DeliveryGuy]
 *      security:
 *        - bearerAuth: []
 *
 *      responses:
 *        "200":
 *          description: Details Successfully fetched
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
 *                  address:
 *                    type: string
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

router.get("/notify", auth, async (req, res) => {
  try {
    var delGuy = req.user;
    var data = await Order.find({ deliveryGuy: null });
    res.status(200).send(data);
  } catch (e) {
    res.status(500).send(e);
  }
});

//Route for assign deliveryGuy

/**
 * @swagger
 * path:
 *  /deliveryguy/assign/{id}:
 *    post:
 *      summary: Route to assign deliveryguy
 *      tags: [DeliveryGuy]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *      description: order id is to be mentioned in params for which deliveryguy is to be assigned
 *    responses:
 *      "200":
 *        description: Whole order object is returned as response
 *      "400":
 *        description: An error occured
 *
 */

router.post("/assign/:id", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(400).send("Incorrect orderID");
    }
    if (!order.assign) {
      order.deliveryGuy._id = req.user._id;
      order.deliveryGuy.name = req.user.name;
      order.deliveryGuy.phone = req.user.phone;
      order.deliveryGuy.email = req.user.email
      req.user.orders.push(order._id);
      order.assign = true;
      await order.save();
      await req.user.save();
      res.status(200).send(order);
    } else {
      res.status(400).send("DeliveryGuy already Assigned.");
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

//Login Route for deliveryGuy

/**
 * @swagger
 * path:
 *  /deliveryguy/login:
 *    post:
 *      summary: login a deliveryGuy
 *      tags: [DeliveryGuy]
 *
 *      requestBody:
 *        description: needs deliveryGuy username and password
 *        required: true
 *
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - password
 *                - username
 *              properties:
 *                username:
 *                  type: string
 *                password:
 *                  type: string
 *                  format: password
 *              example:
 *                username: dguy1
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
 *                  - username
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
    const deliveryGuy = await DeliveryGuy.findByCredentials(
      req.body.username,
      req.body.password
    );
    const token = await deliveryGuy.generateAuthToken();
    res.send({ deliveryGuy, token });
  } catch (e) {
    res.status(400).send();
  }
});

//Logout route for deliveryGuy

/**
 * @swagger
 * path:
 *  /deliveryguy/logout:
 *    post:
 *      security:
 *        - bearerAuth: []
 *      summary: logout a deliveryGuy, while using it here, please copy the token from the login route and add it to authorize button on top
 *      tags: [DeliveryGuy]
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
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();

    res.send("Logged Out");
  } catch (e) {
    res.status(500).send();
  }
});

//Route to logout all sessions

/**
 * @swagger
 * path:
 *  /deliveryguy/logoutAll:
 *    post:
 *      security:
 *        - bearerAuth: []
 *      summary: logout a deliveryGuy from All devices, while using it here, please copy the token from the login route and add it to authorize button on top
 *      tags: [DeliveryGuy]
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
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

//Route to read deliveryGuy profile

/**
 * @swagger
 * path:
 *  /deliveryguy/me:
 *    get:
 *      security:
 *        - bearerAuth: []
 *      summary: read the deliveryGuy profile
 *      tags: [DeliveryGuy]
 *      responses:
 *        "200":
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  orders:
 *                    type: object
 *                    properties:
 *                      restaurant:
 *                        type: object
 *                        properties:
 *                          _id:
 *                            type: string
 *                            description: ObjectId of Restaurant
 *                          name:
 *                            type: string
 *                            description: Name of the Restaurant
 *                          contactNos:
 *                            type: array
 *                            items:
 *                              type: string
 *                            description: array of all the contact nos of restaurant
 *                      user:
 *                        type: object
 *                        properties:
 *                          _id:
 *                            type: string
 *                            description: ObjectId of User
 *                          name:
 *                            type: string
 *                            description: Name of the User
 *                      deliveryGuy:
 *                        type: object
 *                        properties:
 *                          _id:
 *                            type: string
 *                            description: Object Id of deliveryGuy
 *                          name:
 *                            type: string
 *                            description: Name of the deliveryGuy
 *                          phone:
 *                            type: string
 *                            description: Phone number of deliveryGuy
 *                      address:
 *                        type: string
 *                        description: address where the food is to be delivered
 *                      payment:
 *                        type: object
 *                        properties:
 *                          status:
 *                            type: string
 *                            description: Payment status of the order i.e. "UNPAID", "PAID"
 *                          total:
 *                            type: number
 *                            description: Total amount of the order to be paid
 *                          method:
 *                            type: string
 *                            description: Mode of payment i.e. "COD", "UPI", "CARD"
 *                      status:
 *                        type: string
 *                        description: Status of the order i.e. "RECIEVED", "LEFT", "DELIVERED", "CANCELED"
 *                      _id:
 *                        type: string
 *                        description: ObjectId of Order
 *                      foods:
 *                        type: array
 *                        items:
 *                          type: object
 *                          properties:
 *                            quantity:
 *                              type: number
 *                              description: Quantity of the food
 *                            _id:
 *                              type: string
 *                              description: ObjectId of Food
 *                            price:
 *                              type: number
 *                              description: Price of the food
 *                            name:
 *                              type: string
 *                              description: Name of the Food
 *                  _id:
 *                    type: string
 *                    description: objectID of DelivryGuy
 *                  username:
 *                    type: string
 *                    description: Username of deliveryGuy
 *                  name:
 *                    type: string
 *                    description: Name of deliveryGuy
 *                  phone:
 *                    type: string
 *                    description: Phone no of deliveryGuy
 *        "400":
 *         description: Please Authenticate
 */
router.get("/me", auth, async (req, res) => {
  const user = req.user;
  const orders = await user.populate("orders").execPopulate();
  res.send(user);
});

//Update route for delivery guy

/**
 * @swagger
 * path:
 *  /deliveryguy/me:
 *    patch:
 *      security:
 *        - bearerAuth: []
 *      summary: update the deliveryGUy profile
 *      tags: [DeliveryGuy]
 *      requestBody:
 *        description: needs info to be upated about the deliveryGuy
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
 *                password:
 *                  type: string
 *                  format: password
 *                phone:
 *                  type: string
 *              example:
 *                password: "87654321"
 *                phone: "+918602313604"
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
  const allowedUpdates = ["name","email","phone", "password"]; //Updates allowed for deliveryGuy
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

//Route to delete deliveryGuy profile
router.delete("/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

//Route to get a particular order from objectId of a order.(deliveryGuy authorization required)
router.get('/order/:id',auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if(!order){
      res.json({error:"Incorrect orderID"})
    }

    res.send(order)
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
})


//Route to delete deliveryGuy
router.delete("/delete/:id",superAdminAuth,async(req, res)=>{
  try {
    const dguy = await DeliveryGuy.findById({_id:req.params.id});
    if(!dguy){
      res.status(500).send("Can not find deliveryBoy")
    }
    const removed = await dguy.remove()
    res.status(200).send(`Removed ${removed.name}`)
  } catch (error) {
    res.status(500).send(error)
  }

})

//Route to get all delivery boys(super admin authentication)
router.get('/all',superAdminAuth,async(req, res)=>{
  try {
    const deliveryGuys = await DeliveryGuy.find({})
    if(!deliveryGuys){
      res.status(500).send("Can not find delivery Guys")
    }
    res.status(200).send(deliveryGuys)
  } catch (error) {
    res.status(500).send(error)
  }
})

//Route to update order status
/**
 * @swagger
 * path:
 *   /deliveryguy/status/{id}:
 *     patch:
 *       summary: Route to update order status to "SHIPPED"
 *       security:
 *         - bearerAuth: []
 *       tags: [DeliveryGuy]
 *       parameters:
 *         - in: path
 *           name: id
 *       responses:
 *         "200":
 *           description: Status Updated to "SHIPPED"
 *         "500":
 *           description: Error
 *
 */
router.patch("/status/:id", auth, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      { _id: req.params.id },
      {
        status: "SHIPPED",
      }
    );
    res.status(200).send(`Status Updated to "SHIPPED"`);
  } catch (error) {
    res.status(500).send(error);
  }
});

//Route to update order status
/**
 * @swagger
 * path:
 *   /deliveryguy/order/status/delivered/{id}:
 *     patch:
 *       summary: Route to update order status to "delivered"
 *       security:
 *         - bearerAuth: []
 *       tags: [DeliveryGuy]
 *       parameters:
 *         - in: path
 *           name: id
 *       responses:
 *         "200":
 *           description: Status Updated to "DELIVERED"
 *         "500":
 *           description: Error
 *
 */
router.patch("/order/status/:id", auth, async (req, res) => {
  var updatedOrder = {
    status: "DELIVERED"
  }  
  updatedOrder.payment = {}
  updatedOrder.payment.method = "COD"
  updatedOrder.payment.status = "PAID"
  try {
    const order = await Order.updateOne(
      { _id: req.params.id },updatedOrder
    );
    res.status(200).send(`Order status Updated to "Delivered"`);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
