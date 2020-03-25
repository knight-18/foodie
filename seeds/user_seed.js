const User = require("../models/user")

const data = [
    {
      name: "User 1",
      phone:"+918602313604",
      email:"user1@example.com",
      password:"12345678",
      address:"75, Gwalior"
    },
    {
        name: "User 2",
        phone:"+918602313604",
        email:"user2@example.com",
        password:"12345678",
        address:"75, Gwalior"
    }
  ]

  function user_seed() {
    User.deleteMany({}, err => {
      if (err) {
        console.log(err);
      } else {
        console.log("Removed Users");
        data.forEach(seed => {
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
  