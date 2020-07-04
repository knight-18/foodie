const mongoose = require("mongoose");
var mongooseTypePhone = require("mongoose-type-phone");

const Food = require("./food");

const Schema = mongoose.Schema;
const OrderSchemaOptions = {
  virtuals: true
};

/**
 * @swagger
 *  components:
 *    schemas:
 *      Order:
 *        type: object
 *        required:
 *          - payment
 *        properties:
 *          foods:
 *            type: array
 *            description: Array of foods to be ordered
 *            items:
 *              type: object
 *              properties: 
 *                _id:
 *                  type: string
 *                price:
 *                  type: number
 *                name:
 *                  type: string
 *                quantity:
 *                  type: number
 *          restaurant:
 *            type: object
 *            properties:
 *              _id:
 *                type: string
 *                description: objectID of restaurant
 *              name:
 *                type: string
 *                description: name of the restaurant
 *              contactNos:
 *                type: array
 *                items:
 *                  type: string
 *                description: array of all the contact no of restaurant
 *          user:
 *            type: object
 *            properties:
 *              _id:
 *                type: string
 *                description: objectID of User
 *              name: 
 *                type: string
 *                description: Name of user
 *              phone:
 *                type: string
 *                description: Phone no of user
 *          deliveryGuy:
 *            type: object
 *            properties: 
 *              _id:
 *                type: string
 *                description: objectID of DeliveryGuy
 *              name:
 *                type: string
 *              phone:
 *                type: string
 *          status:
 *            type: string
 *            description: Status of the order- RECIEVED/ LEFT/ DELIVERED/ CANCELLED
 *          payment:
 *            type: object
 *            description: Details of payment
 *            properties:
 *              method: 
 *                type: string
 *                description: Mode of payment- COD/ UPI/ CARD
 *              status:
 *                type: string
 *                description: Payment status- PAID/ UNPAID
 *              total:
 *                type: string
 *                description: Total amount to be paid
 *
 */


const OrderSchema = new Schema(
  {
    assign:{
      type: Boolean,
      default: false
    },
    eta: {
      type: String,
    },
    foods: [
      {
        _id: {
          type: Schema.Types.ObjectId,
          ref: "Food"
        },
        price: {
          type: Number
        },
        name: {
          type: String
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
        ref: "Restaurant"
      },
      name: {
        type: String
      },
      email: {
        type: String
      },
      address: {
        type: String
      },
      contactNos: [
        {
          type: String,
          allowBlank: false
        }
      ]
    },
    user: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: "User"
      },
      name: {
        type: String
      },
      phone: {
        type: String
      },
      email:{
        type: String
      }
    },
    address:{
      type: String,
      required: true
    },
    deliveryGuy: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: "DeliveryGuy"
      },
      name: {
        type: String
      },
      phone: {
        type: String
      },
      email:{
        type: String
      }
    },
    status: {
      type: String,
      enum: ["RECEIVED", "LEFT", "DELIVERED", "CANCELED","REJECTED","ACCEPTED","PENDING","SHIPPED"],
      default: "PENDING"
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
      },
      total: {
        type: Number,
        default: 0
      }
    }
  },
  {
    timestamps: true
  },
  OrderSchemaOptions
);

// =================================== Virtuals ===================================================
// // All virtuals will be named with the - in between
// const RestaurantNameVirtual = OrderSchema.virtual("reataurant-name");
// const UserNameVirtual = OrderSchema.virtual("user-name");
// const DeliveryGuyNameVirtual = OrderSchema.virtual("deliveryGuy-name");
// const DeliveryGuyPhoneVirtual = OrderSchema.virtual("deliveryGuy-phone");

// RestaurantNameVirtual.get(async () => {
//   return (await Restaurant.findById(order.restaurant)).name;
// });

// UserNameVirtual.get(async () => {
//   return (await User.findById(order.user)).name;
// });

// DeliveryGuyNameVirtual.get(async () => {
//   if (!order.deliveryGuy) {
//     return null;
//   }
//   return (await DeliveryGuy.findById(order.deliveryGuy)).name;
// });

// DeliveryGuyPhoneVirtual.get(async () => {
//   if (!order.deliveryGuy) {
//     return null;
//   }
//   return (await DeliveryGuy.findById(order.deliveryGuy)).phone;
// });


OrderSchema.methods.setTotal = async function (foods){
  const order = this
  try {
    for(let i = 0; i < foods.length; i++){
      order.payment.total += foods[i].price * foods[i].quantity
    }
  } catch (error) {
    
  }
}

// ========================================= Methods =====================================================
// method to set the food array
OrderSchema.methods.setFoods = async function(foods) {
  const order = this;
  try {
      
    for(let i = 0; i < foods.length;i++ ){
      const food = await Food.findById(foods[i].foodid)
      const arr = 
        {
          _id: foods[i].foodid,
          price: foods[i].price,
          name: food.name,
          quantity: foods[i].quantity
        }
      

      console.log(arr)
      order.foods.push(arr)
    }    
    // const arr = foods.map(async ({ foodid, quantity, price }) => {
    //   var food = await Food.findById(foodid);
    //   console.log(food)
    //   console.log(price)
    //   console.log(quantity)
    //   console.log(food.name);
    //   if (!food) {
    //     throw new Error("Invalid food in the array");
    //   }

    //   return {
    //     _id: foodid,
    //     name: food.name,
    //     price: price,
    //     quantity: quantity
    //   };
    // });
    // console.log(arr);
    // order.foods = arr;
  } catch (error) {
    console.log(error);
  }
};

// method to set the user
OrderSchema.methods.setUser = async function(user) {
  const order = this;
  try {
    // Add order to the users orders list
    user.orders.push(order._id);
    // Add users name and id to order.user
    order.user = {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email
    };
    // Save them both

    await user.save();
    await order.save();
  } catch (error) {
    console.log(error);
  }
};

// method to set the restaurant
OrderSchema.methods.setRestaurant = async function(restaurant) {
  const order = this;
  try {
    // Add order to the users orders list
    restaurant.orders.push(order._id);
    // Add users name and id to order.user
    order.restaurant = {
      _id: restaurant._id,
      name: restaurant.name,
      contactNos: restaurant.contactNos,
      email: restaurant.email,
      address: restaurant.address
    };
    // Save them both
    await order.save();
    await restaurant.save();
  } catch (error) {
    console.log(error);
  }
};

// method to assign the deliveryGuy
OrderSchema.methods.setDeliveryGuy = async function(deliveryGuy) {
  const order = this;
  try {
    // Add order to the users orders list
    deliveryGuy.orders.push(order._id);
    // Add users name and id to order.user
    order.deliveryGuy._id = {
      _id: deliveryGuy._id,
      name: deliveryGuy.name,
      phone: deliveryGuy.phone
    };
    // Save them both
    await order.save();
    await deliveryGuy.save();
  } catch (error) {
    console.log(error);
  }
};

// Uncomment when done with schema
module.exports = Order = mongoose.model("Order", OrderSchema);
