const Food = require("../models/food");
const Restaurant = require("../models/restaurant");
const data = require("./foods_data.json");

function randomChoice(arr) {
  return arr[Math.floor(arr.length * Math.random())];
}

module.exports = food_seed = async () => {
  const restaurant = (await Restaurant.find({}))[0];
  Food.deleteMany({}, (err, food) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Removed Foods");
      for (i = 0; i < 7; i++) {
        random_food = randomChoice(data);
        const food = await food.find({name: random_food.name})
        
        food = new Food({
          name: random_food.name,
          restaurants: [restaurant._id],
        });
        restaurant.foods.push({
          foodid: food._id,
          price: random_food.price,
        });
        restaurant.save();
        food.save();
        console.log("created a food");
      }
    }
  });
};
