const express = require("express");
const router = express.Router();
var Food = require('../models/food.js');
// const superAdminAuth = require("../middleware/super_admin_middleware");
// router.use(express.json());
//=========================== Routes==================================

/**
 * @swagger
 * tags:
 *   name: food
 */

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
//=======================================

//=============ROUTES====================
//find food
router.get('/',async (req,res)=>{
      try {
        var food = await Food.find({});
        if(!food){
          res.status(404).send();
          }
          res.json(food);
        }
       catch (e) {
        res.status(500).send();
      }
});

//create food
router.post('/', async (req,res)=>{
  var food = new Food({
    name:req.body.name
  })
  Food.create(req.body.name, (err, food) => {
    if (err) {
      console.log("Error");
      res.sendStatus(500);
      res.end();
    } else {
      res.Status(201).send(food);
    }
  });
  console.log("sucess in food");
  console.log(req.body.name);
  res.status(200).end();
});


router.get("/test", (req, res) => {
  res.status(200);
  res.send("[SUCCESS]: Food routes connected!");
});

module.exports = router;
