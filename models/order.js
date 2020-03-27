const mongoose = require("mongoose");
var mongooseTypePhone = require("mongoose-type-phone");

const Food = require("./food");

const Schema = mongoose.Schema;
const OrderSchemaOptions = {
  virtuals: true
};
const OrderSchema = new Schema(
  {
    foods: [
      {
        _id: {
          type: Schema.Types.ObjectId,
          ref: "Food",
          required: true
        },
        price: {
          type: Number,
          required: true
        },
        name: {
          type: String,
          required: true
        },
        quantity: {
          type: Number,
          default: 1
        }
      }
    ],
    restaurant: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true
      },
      name: {
        type: String,
        required: true
      }
    },
    user: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      name: {
        type: String,
        required: true
      }
    },
    deliveryGuy: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: "DeliveryGuy",
        default: null
      },
      name: {
        type: String,
        required: true
      },
      phone: {
        type: mongoose.SchemaTypes.Phone,
        required: true
      }
    },
    status: {
      type: String,
      enum: ["RECIEVED", "LEFT", "DELIVERED", "CANCELED"],
      default: "RECIEVED"
    },
    payment: {
      method: {
        type: String,
        enum: ["COD", "UPI", "CARD"],
        required: true
      },
      status: {
        type: String,
        enum: ["UNPAID", "PAID"],
        default: "UNPAID"
      }
    }
  },
  OrderSchemaOptions
);

// =================================== Virtuals ===================================================
// // All virtuals will be named with the - in between
// const RestaurantNameVirtual = OrderSchema.virtual("reataurant-name");
// const UserNameVirtual = OrderSchema.virtual("user-name");
// const DeliveryGuyNameVirtual = OrderSchema.virtual("deliveryGuy-name");
// const DeliveryGuyPhoneVirtual = OrderSchema.virtual("deliveryGuy-phone");
const TotalVirtual = OrderSchema.virtual("total");

// RestaurantNameVirtual.get(async () => {
//   return (await Restaurant.findById(this.restaurant)).name;
// });

// UserNameVirtual.get(async () => {
//   return (await User.findById(this.user)).name;
// });

// DeliveryGuyNameVirtual.get(async () => {
//   if (!this.deliveryGuy) {
//     return null;
//   }
//   return (await DeliveryGuy.findById(this.deliveryGuy)).name;
// });

// DeliveryGuyPhoneVirtual.get(async () => {
//   if (!this.deliveryGuy) {
//     return null;
//   }
//   return (await DeliveryGuy.findById(this.deliveryGuy)).phone;
// });

TotalVirtual.get(async () => {
  var total = 0;
  this.foods.map(food => {
    total += food.price * food.quantity;
  });
  return total;
});

// ========================================= Methods =====================================================
// method to set the food array
OrderSchema.methods.setFoods = async foods => {
  if (!foods.isArray()) {
    throw new Error("Invalid foods array, please make sure foods is an array");
  }
  const arr = foods.map(async ({ foodid, quantity }) => {
    food = await Food.findById(foodid);
    return {
      _id: foodid,
      name: food.name,
      price: food.price,
      quantity: quantity
    };
  });
  this.foods = arr;
};

// method to set the user
OrderSchema.methods.setUser = async user => {
  // Add this to the users orders list
  user.orders.push(this._id);
  // Add users name and id to this.user
  this.user._id = user._id;
  this.user.name = user.name;
  // Save them both
  await this.save;
  await user.save();
};

// method to set the restaurant
OrderSchema.methods.setRestaurant = async restaurant => {
  // Add this to the users orders list
  restaurant.orders.push(this._id);
  // Add users name and id to this.user
  this.restaurant._id = user._id;
  restaurant;
  this.restaurant.name = user.name;
  // Save them both
  await this.save;
  await restaurant.save();
};

// method to assign the deliveryGuy
OrderSchema.methods.setDeliveryGuy = async deliveryGuy => {
  // Add this to the users orders list
  deliveryGuy.orders.push(this._id);
  // Add users name and id to this.user
  this.deliveryGuy._id = user._id;
  deliveryGuy;
  this.deliveryGuy.name = user.name;
  this.deliveryGuy.phone = user.phone;
  // Save them both
  await this.save;
  await deliveryGuy.save();
};

// Uncomment when done with schema
module.exports = Order = mongoose.model("Order", OrderSchema);
