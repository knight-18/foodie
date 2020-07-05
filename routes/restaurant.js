const express = require("express");
const router = express.Router();
const multer = require("multer");
const sharp = require("sharp");
const Restaurant = require("../models/restaurant");
const Food = require("../models/food");
const Order = require("../models/order");
const superAdminAuth = require("../middleware/super_admin_middleware");
const auth = require("../middleware/restauth");
const {orderPlaced, orderAccepted, orderRejected, contactDeliveryBoy} = require('../nodemailer/nodemailer')
const DeliveryGuy = require("../models/deliveryGuy")

//==============Seeding===============
// if (process.env.NODE_ENV != "production") {
//   const restaurant_seed = require("../seeds/restaurant_seed");
//   restaurant_seed();
// }

//Function to upload picture of restaurant
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      cb(new Error("Please upload jpg,jpeg or png file only"));
    }

    cb(undefined, true);
  },
});

//Function to convert arrayBuffer to base 64
function base64ArrayBuffer(arrayBuffer) {
  var base64 = "";
  var encodings =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  var bytes = new Uint8Array(arrayBuffer);
  var byteLength = bytes.byteLength;
  var byteRemainder = byteLength % 3;
  var mainLength = byteLength - byteRemainder;

  var a, b, c, d;
  var chunk;

  // Main loop deals with bytes in chunks of 3
  for (var i = 0; i < mainLength; i = i + 3) {
    // Combine the three bytes into a single integer
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

    // Use bitmasks to extract 6-bit segments from the triplet
    a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
    b = (chunk & 258048) >> 12; // 258048   = (2^6 - 1) << 12
    c = (chunk & 4032) >> 6; // 4032     = (2^6 - 1) << 6
    d = chunk & 63; // 63       = 2^6 - 1

    // Convert the raw binary segments to the appropriate ASCII encoding
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
  }

  // Deal with the remaining bytes and padding
  if (byteRemainder == 1) {
    chunk = bytes[mainLength];

    a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2

    // Set the 4 least significant bits to zero
    b = (chunk & 3) << 4; // 3   = 2^2 - 1

    base64 += encodings[a] + encodings[b] + "==";
  } else if (byteRemainder == 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];

    a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
    b = (chunk & 1008) >> 4; // 1008  = (2^6 - 1) << 4

    // Set the 2 least significant bits to zero
    c = (chunk & 15) << 2; // 15    = 2^4 - 1

    base64 += encodings[a] + encodings[b] + encodings[c] + "=";
  }

  return base64;
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
 *  /restaurant?pageNo=1&size=10:
 *    get:
 *      summary: get a list of all restaurants
 *      tags: [Restaurant]
 *      parameters:
 *        - in: query
 *          name: pageNo
 *          schema:
 *            type: integer
 *          description: the page number
 *        - in: query
 *          name: size
 *          schema:
 *            type: integer
 *          description: The number of items to return
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
  const pageNo = parseInt(req.query.pageNo) || 1;
  const size = parseInt(req.query.size) || 10;
  if (pageNo < 0 || pageNo === 0) {
    response = {
      error: true,
      message: "invalid page number, should start with 1",
    };
    return res.json(response);
  }
  let query = {};
  query.skip = size * (pageNo - 1);
  query.limit = size;

  Restaurant.find({}, {}, query, (err, restaurants) => {
    if (err) {
      console.log(err);
      res.status(500).json(err);
    } else {
      var data = [];
      restaurants.forEach((restaurant) => {
        data.push({
          id: restaurant._id,
          name: restaurant.name,
          //foods: restaurant.foods,
          contactNos: restaurant.contactNos,
          address: restaurant.address,
          email: restaurant.email,
          restId: restaurant.rest_id
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
 *          description: DeliveryGuy Created
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
    req.user.tokens = req.user.tokens.filter((token) => {
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
  const allowedUpdates = ["name", "password", "address", "contactNos","email"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }
  if (updates.contactNos && !updates.contactNos.isArray()) {
    return res.status(400).send({
      error:
        "contactNos should be an array containing all the numbers of the restaurants including the old ones!",
    });
  }
  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.status(200).send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

//Timestamps

// const currentTS = ()=>{
//   let ts = Date.now();
//   // timestamp in seconds
//   console.log( "currentTS- "+ Math.floor(ts/1000));

//   return Math.floor(ts/1000)
// }

// const orderTS = (str)=>{
//   var myDate = new Date(str);
//   var orderts = myDate.getTime();
//   console.log("OrderTS- " +Math.floor(orderts/1000));
//   return Math.floor(orderts/1000)
// }

//Route for notification

/**
 * @swagger
 * path:
 *  /restaurant/notify:
 *    get:
 *      summary: Route to get details of latest orders
 *      tags: [Restaurant]
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
 *                      phone:
 *                        type: string
 *                        description: Phone number of the user
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

router.get("/notify", auth, async (req, res) => {
  try {
    var restaurant = req.user;
    var result = await restaurant.populate("orders").execPopulate();
    var data = [];
    result.orders.forEach(async (order) => {
      if (!order.restNotification) {
        data.push(order);
        await Order.findByIdAndUpdate(
          { _id: order._id },
          {
            restNotification: true,
          },
          (err, res) => {
            if (err) {
              console.log(err);
            } else {
            }
          }
        );
      }
    });
    res.status(200).send(data);
  } catch (e) {
    res.status(500).send(e);
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
        error: "No such restaurant found!",
      });
    }

    res.status(200).json({
      restaurant: restaurant,
      // _id: restaurant._id,
      // name: restaurant.name,
      // contactNos: restaurant.contactNos,
      // address: restaurant.address,
      // foods: restaurant.foods,
      // image: base64ArrayBuffer(restaurant.image)
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
        error: "Food doesn't exist",
      });
    } else {
      const restaurant = req.user;
      restaurant.foods.push({
        foodid: req.body.foodid,
        price: req.body.price,
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
    restaurant.foods = restaurant.foods.filter((obj) => {
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
    if (food.restaurants.length == 0) {
      await food.remove();
    } else {
      food.save();
    }
    const result = await restaurant.save();
    res.status(200).send("Food Deleted");
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
router.post("/image/avatar", auth, upload.single("image"), async (req, res) => {
  try {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 500, height: 500 })
      .png()
      .toBuffer();
    req.user.image = buffer;
    await req.user.save();
    res.send("Added Restaurant Picture Successfully");
  } catch (error) {
    console.log(error)
    res.status(400).send(error);
  }
});

//Route to get retaurant image
router.get('/image/avatar/:id', async (req, res) => {
  try {
      const restaurant = await Restaurant.findById({_id: req.params.id})
      res.set('Content-Type','image/png')
      res.status(200).send(restaurant.image)

  } catch (e) {
      res.status(404).send(e)
  }
})

//Route to update order status
/**
 * @swagger
 * path:
 *   /restaurant/status/{id}:
 *     patch:
 *       summary: Route to update order status to "LEFT"
 *       security:
 *         - bearerAuth: []
 *       tags: [Restaurant]
 *       parameters:
 *         - in: path
 *           name: id
 *       responses:
 *         "200":
 *           description: Status Updated to "LEFT"
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

//Route to accept or order
router.post('/order/acceptreject/accept/:id', auth, async(req, res)=>{
  try {
    const order = await Order.findById(req.params.id)
    if(!order){
      res.json({error: "Can not fetch Order from orderID"})
    }
    orderAccepted({
      email: order.user.email,
      name: order.user.name,
      time: req.body.eta
    })
    const deliveryGuys = await DeliveryGuy.find({})
    if(!deliveryGuys){
      console.log("No delivery Guy found")
    }
    deliveryGuys.forEach( (deliveryGuy)=>{
      contactDeliveryBoy({
        email: deliveryGuy.email,
        orderId: order._id
      })
    })
    order.status = "ACCEPTED"
    order.eta = req.body.eta
    await order.save()

    res.status(200).json({response: "Order Accepted"})
  } catch (error) {
      res.status(500).send(error)
  }
})

//Route to decline order
router.post('/order/acceptreject/reject/:id', auth, async(req, res)=>{
  try {
    const order = await Order.findById(req.params.id)
    if(!order){
      res.json({error:"Can not fetch order from orderID"})
    }
    orderRejected({
      email: order.user.email,
      name: order.user.name
    })
    order.status = "REJECTED"
    await order.save()
    res.status(200).json({message:"Order rejected"})
  } catch (error) {
    res.status(500).send(error)
  }

})

//Route to get a particular order from objectId of a order.(Restaurant authorization required)
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

//Route to delete restaurant
router.delete('/delete/:id',superAdminAuth, async(req, res)=>{
  const restaurant = await Restaurant.findById({_id:req.params.id})
  if(!restaurant){
    res.status(500).send("Invalid restaurant ID")
  }
  const removed = await restaurant.remove()
  res.status(200).send(`Removed ${removed.name}`)
})
module.exports = router;
