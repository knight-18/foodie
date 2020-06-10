const mongoose = require("mongoose");
var mongooseTypePhone = require("mongoose-type-phone");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator")

const Schema = mongoose.Schema;

/**
 * @swagger
 *  components:
 *    schemas:
 *      DeliveryGuy:
 *        type: object
 *        required:
 *          - name
 *          - phone
 *          - username
 *          - password
 *          - tokens
 *        properties:
 *          name:
 *            type: string
 *          phone:
 *            type: string
 *            description: 10 digit phone no.
 *          username:
 *            type: string
 *            description: unique username of delivery boy
 *          password:
 *            type: string
 *            format: password
 *          orders:
 *            type: array
 *            items:
 *              type: string
 *          tokens:
 *            type: array
 *            items:
 *              type: string
 *
 *
 */

const DeliveryGuySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
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
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
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
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
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

DeliveryGuySchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;

  return userObject;
};

//JWT function to generate auth tokens
DeliveryGuySchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || 129600,
  });

  // user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

//function to find user by email and verify password
DeliveryGuySchema.statics.findByCredentials = async (username, password) => {
  const user = await DeliveryGuy.findOne({ username });

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
DeliveryGuySchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

module.exports = DeliveryGuy = mongoose.model("DeliveryGuy", DeliveryGuySchema);
