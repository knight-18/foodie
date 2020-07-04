const mongoose = require("mongoose");
var mongooseTypePhone = require("mongoose-type-phone");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Food = require('./food');
const { deleteMany } = require("./order");

const Schema = mongoose.Schema;

/**
 * @swagger
 *  components:
 *    schemas:
 *      Restaurant:
 *        type: object
 *        required:
 *          - name
 *          - password
 *          - rest_id
 *          - address
 *          - contactNos
 *          - tokens
 *        properties:
 *          name:
 *            type: string
 *            description: Name of the restaurant
 *          rest_id:
 *            type: string
 *            description: Unique ID of the restaurant.
 *          contactNos:
 *            type: array
 *            items:
 *              type: string
 *            description: Array of all the contact nos of a restaurant
 *          address:
 *            type: string
 *          email:
 *            type: string
 *          orders:
 *            type: array
 *            items:
 *              type: string
 *            description: Array of all the orders of a restaurant
 *          tokens:
 *            type: array
 *            items:
 *              type: string
 *          foods:
 *            type: array
 *            items:
 *              schema:
 *                type: object
 *                required:
 *                  - foodid
 *                  - price
 *                properties:
 *                  foodid:
 *                    type: string
 *                    description: id of the food
 *                  price:
 *                    type: number
 *                    description: price of the given food id
 *            description: Array of all the foods of a restaurant as an object {foodid, price}
 *
 *
 */
const RestaurantSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    rest_id: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 7,
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error('Password cannot contain "password"');
        }
      },
    },
    // Array of of phone no.s as a restaurant may have more than one phone no.
    contactNos: [
      {
        type: String,
        allowBlank: false,
      },
    ],
    email : {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      }
    },
    address: {
      type: String,
      required: true,
    },
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    image: {
      type: Buffer,
    },
    foods: [
      {
        name:{
          type: String
        },
        imageLink:{
          type: String
        },
        foodid: {
          type: Schema.Types.ObjectId,
          ref: "Food",
        },
        price: {
          type: Number,
          default: 0,
        },
      },
    ],
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

RestaurantSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;

  return userObject;
};

//JWT function to generate auth tokens
RestaurantSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || 129600,
  });
  // user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

//function to find user by restaurant id and verify password
RestaurantSchema.statics.findByCredentials = async (rest_id, password) => {
  const user = await Restaurant.findOne({ rest_id });

  if (!user) {
    throw new Error("Unable to login");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Unable to login");
  }

  return user;
};

//To hash the password before saving
RestaurantSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

//Removing foods in a restaurant while deleting restaurant
RestaurantSchema.pre('remove', async function(next) {
  const restaurant = this;

  await Food.deleteMany({restaurants: restaurant._id})

  next();
});

module.exports = Restaurant = mongoose.model("Restaurant", RestaurantSchema);
