const DeliveryGuy = require("../models/deliveryGuy")

const data = [
    {
      name: "Dguy 1",
      phone:"+918602313604",
      username:"dguy1",
      password:"12345678"
    },
    {
        name: "Dguy 2",
        phone:"+918602313604",
        username:"dguy2",
        password:"12345678"
    }
  ]

  function deliveryGuy_seed() {
    DeliveryGuy.deleteMany({}, err => {
      if (err) {
        console.log(err);
      } else {
        console.log("Removed Delivery Guys");
        data.forEach(seed => {
          DeliveryGuy.create(seed, (err, deliveryGuy) => {
            if (err) {
              console.log(err);
            } else {
              console.log("Added a Delivery Guy");
            }
          });
        });
      }
    });
  }
  module.exports = deliveryGuy_seed;
  