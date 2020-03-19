// This file seeds dummy restaurant data for testing
const Restaurant = require("../models/restaurant");

const data = [
  {
    name: "Restaurant Check 1",
    address: "Check Address",
    foods: [1, 10, 21, 342]
  },
  {
    name: "Restaurant Check 2",
    address: "Check Address 2",
    foods: [2, 20, 22, 322]
  }
];

function restaurant_seed() {
  Restaurant.deleteMany({}, err => {
    if (err) {
      console.log(err);
    } else {
      console.log("Removed Restaurants");
      data.forEach(seed => {
        Restaurant.create(seed, (err, restaurant) => {
          if (err) {
            console.log(err);
          } else {
            console.log("Added a restaurant");
          }
        });
      });
    }
  });
}
module.exports = restaurant_seed;
