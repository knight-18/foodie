const express = require("express");
const router = express.Router();
const multer = require("multer");
const sharp = require("sharp");

const Food = require("../models/food");
const Restaurant = require("../models/restaurant");
const restAuth = require("../middleware/restauth");

// if (process.env.NODE_ENV != "prod") {
//   const food_seed = require("../seeds/food_seed");
//   setTimeout(() => {
//     food_seed();
//   }, 1000);
// }

// const superAdminAuth = require("../middleware/super_admin_middleware");
// router.use(express.json());
//=========================== Routes==================================

/**
 * @swagger
 * path:
 *  /food/test:
 *    get:
 *      summary: check if food router is configured correctly
 *      tags: [food]
 *      responses:
 *        "200":
 *          description: Test successfull
 *          content:
 *            text/html:
 *              [SUCCESS]: food routes connected!
 */
router.get("/test", (req, res) => {
  res.status(200);
  res.send("[SUCCESS]: Food routes connected!");
});

/**
 * @swagger
 * tags:
 *   name: food
 */

//=======================================
const getResponse = function (foods) {
  return foods.map((food) => {
    const restaurantList = food.restaurants.map((restaurant) => {
      const price = restaurant.foods.find((obj) => food.id == obj.foodid).price;
      return {
        name: restaurant.name,
        _id: restaurant.id,
        image: restaurant.image,
        price: price,
      };
    });

    return {
      name: food.name,
      _id: food.id,
      image: food.image,
      restaurants: restaurantList,
    };
  });
};
//=============ROUTES====================
//find food

/**
 * @swagger
 * path:
 *  /food:
 *    get:
 *      summary: get list of all available foods
 *      tags: [food]
 *
 *      responses:
 *        "200":
 *          description: Get food list successful
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                properties:
 *                  foods:
 *                    type: object
 *                items:
 *                  type: object
 *                  properties:
 *                    name:
 *                      type: string
 *                    _id:
 *                      type: string
 *                    restaurants:
 *                      type: array
 *                      items:
 *                        type: object
 *                        properties:
 *                          name:
 *                            type: string
 *                          _id:
 *                            type: string
 *                          price:
 *                            type: string
 *        "500":
 *          description: Error
 *
 */
router.get("/", async (req, res) => {
  try {
    const foods = await Food.find({}).populate("restaurants").exec();
    if (!foods) {
      res.status(404).send();
    }
    const response = getResponse(foods);
    res.status(200).json(response);
  } catch (e) {
    res.status(500).send();
  }
});

//create food

/**
 * @swagger
 * path:
 *   /food:
 *     post:
 *       summary: Route to create food if it already doesn't exists, while using it here, please copy the token from the login route and add it to authorize button on top
 *       security:
 *         - bearerAuth: []
 *       required: true
 *       tags: [food]
 *       requestBody:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - name
 *                 - price
 *               properties:
 *                 name:
 *                   type: string
 *                   description: Name of the food to be added
 *                 price:
 *                   type: string
 *                   description: Price of added food
 *               example:
 *                 name: Food1
 *                 price: "999"
 *
 *       responses:
 *         "200":
 *           description: Food added
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   foodid:
 *                     type: string
 *                   name:
 *                     type: string
 *                   restaurants:
 *                     type: array
 *                     items:
 *                       type: string
 *         "500":
 *           description: Error
 *
 */

router.post("/", restAuth, async (req, res) => {
  const food = new Food({
    name: req.body.name,
    restaurants: [req.user._id],
  });
  try {
    const result = await food.save();
    const restaurant = req.user;
    restaurant.foods.push({
      foodid: result._id,
      price: req.body.price,
    });
    await restaurant.save();
    res.status(201).json(result);
  } catch (error) {
    res.status(500).send(error);
  }
});

//Function to upload picture of food
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      cb(new Error("Please upload jpg,jpeg or png file only"));
    }

    cb(undefined, true);
  },
});

/**
 * @swagger
 * path:
 *   /food/image/{id}:
 *     post:
 *       summary: Route to upload image of the food(File size should not exceed 1 MB)
 *       security:
 *         - bearerAuth: []
 *       required: true
 *       parameters:
 *         - in: path
 *           name: id
 *       tags: [food]
 *       requestBody:
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: base64
 *       responses:
 *         "200":
 *           description: Added Food picture successfully
 *         "400":
 *           description: Unable to add food picture
 *
 */
router.post(
  "/image/:id",
  restAuth,
  upload.single("image"),
  async (req, res) => {
    try {
      const food = await Food.findById(req.params.id);
      if (!food) {
        throw new Error("Food doesn't exists");
      }
      const buffer = await sharp(req.file.buffer)
        .resize({ width: 150, height: 150 })
        .png()
        .toBuffer();
      food.image = buffer;
      await food.save();
      res.status(200).send("Added Food Picture Successfully");
    } catch (error) {
      res.status(400).send(error);
    }
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

module.exports = router;
