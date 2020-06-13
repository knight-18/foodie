const mongoose = require("mongoose");
var mongooseTypePhone = require("mongoose-type-phone");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Schema = mongoose.Schema;

/**
 * @swagger
 *  components:
 *    schemas:
 *      User:
 *        type: object
 *        required:
 *          - name
 *          - email
 *          - phone
 *          - password
 *          - address
 *          - tokens
 *        properties:
 *          name:
 *            type: string
 *          phone:
 *            type: string
 *            description: 10 digit phone no.
 *          email:
 *            type: string
 *          password:
 *            type: string
 *            format: password
 *          address:
 *            type: string
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

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      validate(value){
        if(value.length != 10){
          throw new Error("Invalid Phone Number")
        }
      }
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
      },
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

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;

  return userObject;
};

//JWT function to generate auth tokens
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || 129600,
  });

  // user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

//function to find user by email and verify password
userSchema.statics.findByCredentials = async (phone, password) => {
  const user = await User.findOne({ phone });

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
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

module.exports = User = mongoose.model("User", userSchema);
