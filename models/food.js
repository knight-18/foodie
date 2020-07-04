const mongoose = require("mongoose");

const Schema = mongoose.Schema;

/**
 * @swagger
 *  components:
 *    schemas:
 *      Food:
 *        type: object
 *        properties:
 *          name:
 *            type: string
 *          restaurants:
 *            type: array
 *            items:
 *              type: string
 *              description: id of the restaurants
 */

const FoodSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  image: {
    type: Buffer
  },
  imageLink: {
    type: String
  },
  restaurants: [
    {
      type: Schema.Types.ObjectId,
      ref: "Restaurant"
    }
  ]
});

Food = mongoose.model("Food", FoodSchema);

module.exports = Food;
