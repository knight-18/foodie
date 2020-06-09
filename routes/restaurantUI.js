const express = require('express')
const router = express.Router()
const request = require('request')

//Route for restaurant login
router.get('/login',(req, res)=>{
    res.render("restLogin")
})


//Route to render list of all restaurants
router.get("/:pg", function (req, res) {
  res.render("restaurant", { pagenumber: req.params.pg });
});


router.get("/:restaurantname/:id", function (req, res) {
  res.render("foodItems", {
    restaurantName: req.params.restaurantname,
    restaurantId: req.params.id,
  });
});

//Route to show details and food available in the restaurant
// router.get("/restfood/:id/", function (req, res) {
//     var url =
//       "https://knight-foodji.herokuapp.com/api/restaurant/" + req.params.id;
//     var rname = req.params.restaurantname;
//     request(
//       {
//         url: url,
//         json: true,
//       },
  
//       function (error, response, body) {
//         var foodlist = [];
//         foodlist = body;
//         res.render("restFood", {
//           list: foodlist,
//           restaurantName: rname,
//         });
//       }
//     );
//   });
  
module.exports = router