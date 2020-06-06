const express = require("express");
const router = express.Router();

// Routers
const user = require("./user");
const restaurant = require("./restaurant");
const food = require("./food");
const deliveryGuy = require("./deliveryGuy")
const userUI = require('./userUI')
const restaurantUI = require('./restaurantUI')
 
// Using Routes
router.use("/api/user", user);
router.use("/api/restaurant", restaurant);
router.use("/api/food", food);
router.use("/api/deliveryguy", deliveryGuy)
router.use("/ui/user", userUI)
router.use('/ui/restaurant',restaurantUI)

router.get('/ui',(req, res)=>{
  res.render('index')
})

// error handling
router.use((eq, res, next) => {
  const error = new Error("Invalid Endpoint");
  error.status = 404;
  next(error);
});

router.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = router;
