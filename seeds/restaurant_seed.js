//This file seeds dummy restaurant data for testing
const Restaurant = require("../models/restaurant");

const data = require("./restaurants_data.json");

function restaurant_seed() {
  Restaurant.deleteMany({}, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Removed Restaurants");
      data.forEach((seed) => {
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
