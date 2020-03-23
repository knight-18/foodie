const mongoose = require("mongoose");
var mongooseTypePhone = require("mongoose-type-phone");
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const Schema = mongoose.Schema;

/**
 * @swagger
 *  components:
 *    schemas:
 *      Restaurant:
 *        type: object
 *        required:
 *          - name
 *          - address
 *        properties:
 *          name:
 *            type: string
 *          contactNos:
 *            type: array
 *            description: Array of all the contact no.s of a restaurant
 *          address:
 *            type: string
 *          orders:
 *            type: array
 *            description: Array of all the orders of a restaurant
 *          foods:
 *            type: array
 *            description: Array of all the foods of a restaurant
 *        example:
 *           id: 12347914324
 *           name: Restaurant 1
 *           foods: [foodid1, foodid2]
 *           contactNos: ["+919432451728"]
 *           address: Example address, example street, example city...
 *
 *
 */
const RestaurantSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  rest_id :{
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 7,
    trim: true,
    validate(value) {
        if (value.toLowerCase().includes('password')) {
            throw new Error('Password cannot contain "password"')
        }
    }
},
  // Array of of phone no.s as a restaurant may have more than one phone no.
  contactNos: [
    {
      type: mongoose.SchemaTypes.Phone,
      allowBlank: false
    }
  ],

  address: {
    type: String,
    required: true
  },
  orders: {
    type: Array
  },
  foods: {
    type: Array
  },
  tokens: [{
    token: {
        type: String,
        required: true
    }
}]}, 
{
timestamps: true
});

RestaurantSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()

  delete userObject.password
  delete userObject.tokens

  return userObject
}


//JWT function to generate auth tokens
RestaurantSchema.methods.generateAuthToken = async function () {
  const user = this
  const token = jwt.sign({ _id: user._id.toString() }, 'foodie')

  user.tokens = user.tokens.concat({ token })
  await user.save()

  return token
}

//function to find user by restaurant id and verify password
RestaurantSchema.statics.findByCredentials = async (rest_id, password) => {
  const user = await Restaurant.findOne({ rest_id })

  if (!user) {
      throw new Error('Unable to login')
  }

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
      throw new Error('Unable to login')
  }

  return user
}

//To hash the password before saving
RestaurantSchema.pre('save', async function (next) {
  const user = this

  if (user.isModified('password')) {
      user.password = await bcrypt.hash(user.password, 8)
  }

  next()
})


module.exports = Restaurant = mongoose.model("Restaurant", RestaurantSchema);
