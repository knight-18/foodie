const Food = require("../models/food");
const Restaurant = require("../models/restaurant");

module.exports = food_seed = async () => {
  const restaurant = (await Restaurant.find({}))[0];
  Food.deleteMany({}, (err, food) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Removed Foods");
      const food = new Food({
        name: "food 1",
        restaurants: [restaurant._id]
      });
      restaurant.foods.push({
        foodid: food._id,
        price: 10
      });
      restaurant.save();
      food.save();
      console.log("created a food");
    }
  });
};
