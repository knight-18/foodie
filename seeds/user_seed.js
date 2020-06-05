const User = require("../models/user");

const data = require("./user_data.json");

function user_seed() {
  User.deleteMany({}, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Removed Users");
      data.forEach((seed) => {
        User.create(seed, (err, user) => {
          if (err) {
            console.log(err);
          } else {
            console.log("Added a user");
          }
        });
      });
    }
  });
}
module.exports = user_seed;
