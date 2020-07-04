const express = require("express");
const router = express.Router();
const multer = require("multer");
const sharp = require("sharp");

const Food = require("../models/food");
const Restaurant = require("../models/restaurant");
const restAuth = require("../middleware/restauth");

/* Google Drive API */
var formidable = require('formidable');
const fs = require('fs');
const { google } = require('googleapis');
const readline = require('readline');

const SCOPES = ['https://www.googleapis.com/auth/drive.appdata',
'https://www.googleapis.com/auth/drive.file',
'https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = 'token.json';


// if (process.env.NODE_ENV != "production") {
//   const food_seed = require("../seeds/food_seed");
//   setTimeout(() => {
//     food_seed();
//   }, 5000);
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
//Function to convert arrayBuffer to base 64
function base64ArrayBuffer(arrayBuffer) {
  var base64 = "";
  var encodings =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  var bytes = new Uint8Array(arrayBuffer);
  var byteLength = bytes.byteLength;
  var byteRemainder = byteLength % 3;
  var mainLength = byteLength - byteRemainder;

  var a, b, c, d;
  var chunk;

  // Main loop deals with bytes in chunks of 3
  for (var i = 0; i < mainLength; i = i + 3) {
    // Combine the three bytes into a single integer
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

    // Use bitmasks to extract 6-bit segments from the triplet
    a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
    b = (chunk & 258048) >> 12; // 258048   = (2^6 - 1) << 12
    c = (chunk & 4032) >> 6; // 4032     = (2^6 - 1) << 6
    d = chunk & 63; // 63       = 2^6 - 1

    // Convert the raw binary segments to the appropriate ASCII encoding
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
  }

  // Deal with the remaining bytes and padding
  if (byteRemainder == 1) {
    chunk = bytes[mainLength];

    a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2

    // Set the 4 least significant bits to zero
    b = (chunk & 3) << 4; // 3   = 2^2 - 1

    base64 += encodings[a] + encodings[b] + "==";
  } else if (byteRemainder == 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];

    a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
    b = (chunk & 1008) >> 4; // 1008  = (2^6 - 1) << 4

    // Set the 2 least significant bits to zero
    c = (chunk & 15) << 2; // 15    = 2^4 - 1

    base64 += encodings[a] + encodings[b] + encodings[c] + "=";
  }

  return base64;
}
const getResponse = function (foods) {
  return foods.map((food) => {
    const restaurantList = food.restaurants.map((restaurant) => {
      const price = restaurant.foods.find((obj) => food.id == obj.foodid).price;
      return {
        name: restaurant.name,
        _id: restaurant.id,
        price: price,
      };
    });

    return {
      name: food.name,
      _id: food.id,
      restaurants: restaurantList,
    };
  });
};
//=============ROUTES====================
//find food

/**
 * @swagger
 * path:
 *  /food?pageNo=1&size=10:
 *    get:
 *      summary: get list of all available foods
 *      tags: [food]
 *      parameters:
 *        - in: query
 *          name: pageNo
 *          schema:
 *            type: integer
 *          description: the page number
 *        - in: query
 *          name: size
 *          schema:
 *            type: integer
 *          description: The number of items to return
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
    const pageNo = parseInt(req.query.pageNo) || 1;
    const size = parseInt(req.query.size) || 10;
    if (pageNo < 0 || pageNo === 0) {
      response = {
        error: true,
        message: "invalid page number, should start with 1",
      };
      return res.json(response);
    }
    let query = {};
    query.skip = size * (pageNo - 1);
    query.limit = size;

    const foods = await Food.find({})
      .populate("restaurants")
      .limit(query.limit)
      .skip(query.skip)
      .exec();
    if (!foods) {
      res.status(404).send();
    }
    const response = getResponse(foods);
    res.status(200).json(response);
  } catch (e) {
    res.status(500).send(e);
    console.log(e);
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

function authorize(credentials, callback, next, fields, req, res) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) {
      console.log(err)
    }
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client, next, fields, req, res);
  });
}


var fileID
var filePath
async function uploadFile(auth, next, fields, req, res) {
  const drive = google.drive({version: 'v3', auth});
  const fileMetadata = {
    'name': 'photo.jpg',
    parents: ['15BrinRLmiRr0b9ue8hpPKGkgkJ6A8nDJ']
  };
  const media = {
    mimeType: 'image/jpg',
    body: fs.createReadStream(filePath)
  };

  console.log("IN UPLOAD FILE")
  try{
    console.log("IN UPLOAD FILE 1")
    var file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id'
    });

    console.log("IN UPLOAD FILE 2")
    fileID = file.data.id
    var imageLink = "https://drive.google.com/uc?export=view&id="+fileID;

    console.log(imageLink)
    console.log(fields)

    const food = new Food({
      name: fields.name,
      restaurants: [req.user._id],
      imageLink: imageLink
    });

    console.log(food)
    try {
      const result = await food.save();
      const restaurant = req.user;
      restaurant.foods.push({
        name: result.name,
        foodid: result._id,
        price: fields.price,
        imageLink: imageLink
      });
      await restaurant.save();
      console.log(restaurant)
      res.status(201).json(result);
      next()
    } catch (error) {
      res.status(500).send(error);
    }
  }catch(err){
    console.log(err)
    next()
  }

}

function fun1(req,res,next){
  console.log("In fun1")
  const form = formidable({ multiples: true });

  form.parse(req, function (err, fields, files) {
    if(err) console.log(err)

    filePath = files.image.path;

    fs.readFile('credentials.json', (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      authorize(JSON.parse(content), uploadFile, next, fields, req, res);
    });

  }) 
}

router.post("/", restAuth, fun1, (req, res) => {
  console.log("Fuck you")
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
        .resize({ width: 500, height: 500 })
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

//route to get food image
router.get('/image/:id', async (req, res) => {
  try {
      const food = await Food.findById({_id: req.params.id})
      res.set('Content-Type','image/png')
      res.status(200).send(food.image)

  } catch (e) {
      res.status(404).send(e)
  }
})
module.exports = router;
