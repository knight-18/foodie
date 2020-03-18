const mongoose = require("mongoose");
var mongooseTypePhone = require("mongoose-type-phone");

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
 *            type: Array
 *            description: Array of all the contact no.s of a restaurant
 *          address:
 *            type: string
 *          orders:
 *            type: Array
 *            description: Array of all the orders of a restaurant
 *          foods:
 *            type: Array
 *            description: Array of all the foods of a restaurant
 *        example:
 *           id: 12347914324
 *           name: Restaurant 1
 *           foods: [foodid1, foodid2]
 *           contacts: [9432451728, 1237843412]
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
  }
});

// Uncomment when done with schema
module.exports = Restaurant = mongoose.model("Restaurant", RestaurantSchema);
