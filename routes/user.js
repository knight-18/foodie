const express = require("express");
const User = require("../models/user");
const Restaurant = require("../models/restaurant");
const Order = require("../models/order");
const deliveryGuy = require("../models/deliveryGuy");
const auth = require("../middleware/userauth");
const router = express.Router();
const jwt = require("jsonwebtoken")
const superAdminAuth = require('../middleware/super_admin_middleware')
const {orderPlaced} = require("../nodemailer/nodemailer")
const { Parser } = require("json2csv");
const user = require("../models/user");
const restaurant = require("../models/restaurant");

//==============Seeding===============
// if (process.env.NODE_ENV != "production") {
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
 *                phone: "8602313604"
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
    res.status(400).send(e);
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
    console.log('logout called')
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    console.log("logged out")
    res.send("Logged out");
  } catch (e) {
    console.log(e)
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
 *              schema:
 *                type: object
 *                properties:
 *                  user:
 *                    type: object
 *                    properties:
 *                      orders:
 *                        type: object
 *                        properties:
 *                          restaurant:
 *                            type: object
 *                            properties:
 *                              _id:
 *                                type: string
 *                                description: ObjectId of Restaurant
 *                              name:
 *                                type: string
 *                                description: Name of the Restaurant
 *                              contactNos:
 *                                type: array
 *                                items:
 *                                  type: string
 *                                description: array of all the contact no of restaurant
 *                          user:
 *                            type: object
 *                            properties:
 *                              _id:
 *                                type: string
 *                                description: ObjectId of User
 *                              name:
 *                                type: string
 *                                description: Name of the User
 *                          deliveryGuy:
 *                            type: object
 *                            properties:
 *                              _id:
 *                                type: string
 *                                description: Object Id of deliveryGuy
 *                              name:
 *                                type: string
 *                                description: Name of the deliveryGuy
 *                              phone:
 *                                type: string
 *                                description: Phone number of deliveryGuy
 *                          address:
 *                            type: string
 *                            description: address where the food is to be delivered
 *                          payment:
 *                            type: object
 *                            properties:
 *                              status:
 *                                type: string
 *                                description: Payment status of the order i.e. "UNPAID", "PAID"
 *                              total:
 *                                type: number
 *                                description: Total amount of the order to be paid
 *                              method:
 *                                type: string
 *                                description: Mode of payment i.e. "COD", "UPI", "CARD"
 *                          status:
 *                            type: string
 *                            description: Status of the order i.e. "RECIEVED", "LEFT", "DELIVERED", "CANCELED"
 *                          _id:
 *                            type: string
 *                            description: ObjectId of Order
 *                          foods:
 *                            type: array
 *                            items:
 *                              type: object
 *                              properties:
 *                                quantity:
 *                                  type: number
 *                                  description: Quantity of the food
 *                                _id:
 *                                  type: string
 *                                  description: ObjectId of Food
 *                                price:
 *                                  type: number
 *                                  description: Price of the food
 *                                name:
 *                                  type: string
 *                                  description: Name of the Food
 *                      _id:
 *                        type: string
 *                        description: objectID of User
 *                      name:
 *                        type: string
 *                        description: name of user
 *                      email:
 *                        type: string
 *                        description: Email of user
 *                      address:
 *                        type: string
 *                        description: Default address of user
 *                      phone:
 *                        type: string
 *                        description: Phone no of user
 *        "400":
 *         description: Please Authenticate
 */
router.get("/me", auth, async (req, res) => {
  const user = req.user;
  const orders = await user.populate("orders").execPopulate();
  res.status(200);
  res.send({ user });
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
 *                address:
 *                  type: string
 *                  description: address where the food is to be delivered(No need to enter if order is to be delivered at default user's address)
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
 *                  address:
 *                    type: string
 *                    description: address where the food is to be delivered
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
    if (!req.body.address) {
      order.address = user.address;
    } else {
      order.address = req.body.address;
    }
    await order.setUser(user);
    await order.setRestaurant(restaurant);
    await order.setFoods(newFoods);

    const result = await order.save();
    orderPlaced({
      name : user.name,
      email: restaurant.email,
      orderId: result._id 
    })
    res.status(200).json(result);
  } catch (error) {
    console.log("error: ",error)
    res.status(500).json(error);
  }
});


//Route to cancel order
router.post("/order/cancel/:id", auth, async (req, res) => {
  try {
    // const order = await Order.findByIdAndUpdate(
    //   { _id: req.params.id },
    //   {
    //     status: "CANCELED",
    //   }
    // );
  
    const order = await Order.findById({_id:req.params.id })
    const restaurant = await Restaurant.findById({_id: order.restaurant._id})
    
    restaurant.orders = restaurant.orders.filter((orderId)=> orderId.toString() != order._id.toString())
    req.user.orders = req.user.orders.filter((orderId)=> orderId.toString() != order._id.toString())
   
    await restaurant.save()
    await req.user.save()
    await order.remove()

    res.status(200).json({"status":`Order status Updated to "CANCELED"`});
  } catch (error) {
    console.log(error)
    res.status(500).json(error);
  }
});



//Route to get a particular order from objectId of a order.(User authorization required)
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
// ********************************************SuperAdmin Routes************************************************
//Route to login as superadmin
router.post('/super', async(req, res)=>{
  try {
    const username = req.body.username
    const password = req.body.password
  
    if((username != process.env.superUsername) || (password != process.env.superPassword) ){
      res.status(401).send("Invalid Credentials")
    }
    const token = jwt.sign({ superAdmin: `${username}${password}` }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || 129600,
    })
    res.status(200).send({token})
  } catch (error) {
    res.status(500).send(error)
  }


})


//Route to fetch all the orders for superAdmin (Super Admin)
router.get('/super/orders', superAdminAuth, async (req, res)=>{
  try {
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
    Order.find({}, {}, query, (err, orders) => {
      if (err) {
        console.log(err)
        res.status(500).json(err);
      } else {
        
        res.status(200).json(orders);
      }
    });
    
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
})

//Route to fetch all orders without pagination in csv format
router.get('/super/allorders', superAdminAuth, async(req, res)=>{
  try {
    const orders = await Order.find({})
    if(!orders){
      res.status(500).send("Unable to fetch orders")
    }
    //Array to store reformatted array
    var newOrders = [] 
    //Function to reformat time
    const formatTime = (createdAt)=>{
      const time = new Date(createdAt)
      return time.toString().substr(0,24)
    }
    //Function to reformat foods array
    const formatFoods = (foods)=>{
      var foodArray=[]
      foods.forEach((food)=>{
        var newFoodObject = {
          quantity: food.quantity,
          name: food.name
        }
        foodArray.push(newFoodObject) 
      })
      return foodArray;
    }
    orders.forEach((order)=> {
      var newOrder = {
        _id: order._id,
        customerName: order.user.name,
        customerPhone: order.user.phone,
        customerEmail: order.user.email,
        restaurantName: order.restaurant.name,
        restaurantPhone: order.restaurant.contactNos[0],
        restaurantEmail: order.restaurant.email,
        address: order.address,
        orderedOn: formatTime(order.createdAt),
        amount: order.payment.total,
        deliveryGuyName: order.deliveryGuy.name,
        deliveryGuyPhone: order.deliveryGuy.phone,
        deliveryGuyEmail: order.deliveryGuy.email,
        foods: formatFoods(order.foods)
      }
      newOrders.push(newOrder);
    })
    const fields = [
      {
        label: "Order ID",
        value: "_id"
      },
    {
      label: "Customer Name",
      value: "customerName"
    },
    {
      label: 'Customer Phone',
      value: "customerPhone"
    },
    {
      label: 'Customer Email',
      value: "customerEmail"
    },
    {
      label: 'Restaurant',
      value: "restaurantName"
    },
    {
      label: 'Restaurant Phone',
      value: "restaurantPhone"
    },
    {
      label: 'Restaurant Email',
      value: "restaurantEmail"
    },
    {
      label: 'Order Amount',
      value: "amount"
    },
    {
      label: 'Delivery Boy',
      value: "deliveryGuyName"
    },
    {
      label: 'Delivery Boy Phone',
      value: "deliveryGuyPhone"
    },
    {
      label: 'Delivery Boy Email',
      value: "deliveryGuyEmail"
    },
    {
      label: 'Customer Address',
      value: "address"
    },
    {
      label: 'Foods',
      value: "foods"
    },
    {
      label: 'Status',
      value: "status"
    },
    {
      label: "Ordered On",
      value: "orderedOn"
    }
    ]
    const json2csvParser = new Parser({fields})
    const ordersCsv = json2csvParser.parse(newOrders)
    res.status(200).send(ordersCsv)  
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
 
})

module.exports = router;
