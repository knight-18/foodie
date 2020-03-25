const mongoose = require("mongoose");
var mongooseTypePhone = require("mongoose-type-phone");

const Restaurant = require("./restaurant");
const User = require("./user");
const Food = require("./food");
const DeliveryGuy = require("./deliveryGuy");

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
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    deliveryGuy: {
      type: Schema.Types.ObjectId,
      ref: "DeliveryGuy",
      default: null
    },
    status: {
      type: String,
      enum: ["RECIEVED", "LEFT", "DELIVERED", "CANCELED"]
    },
    payment: {
      method: {
        type: String,
        enum: ["COD", "UPI", "CARD"]
      },
      status: {
        type: String,
        enum: ["UNPAID", "PAID"]
      }
    }
  },
  OrderSchemaOptions
);

// =================================== Virtuals ===================================================
// All virtuals will be named with the - in between
const RestaurantNameVirtual = OrderSchema.virtual("reataurant-name");
const UserNameVirtual = OrderSchema.virtual("user-name");
const DeliveryGuyNameVirtual = OrderSchema.virtual("deliveryGuy-name");
const DeliveryGuyPhoneVirtual = OrderSchema.virtual("deliveryGuy-phone");
const TotalVirtual = OrderSchema.virtual("total");

RestaurantNameVirtual.get(async () => {
  return (await Restaurant.findById(this.restaurant)).name;
});

UserNameVirtual.get(async () => {
  return (await User.findById(this.user)).name;
});

DeliveryGuyNameVirtual.get(async () => {
  if (!this.deliveryGuy) {
    return null;
  }
  return (await DeliveryGuy.findById(this.deliveryGuy)).name;
});

DeliveryGuyPhoneVirtual.get(async () => {
  if (!this.deliveryGuy) {
    return null;
  }
  return (await DeliveryGuy.findById(this.deliveryGuy)).phone;
});

TotalVirtual.get(async () => {
  const total = 0;
  this.foods.map(food => {
    total += food.price * food.quantity;
  });
  return 0;
});

// ========================================= Methods =====================================================
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
// Uncomment when done with schema
module.exports = Order = mongoose.model("Order", OrderSchema);
