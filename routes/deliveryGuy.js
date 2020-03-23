const express = require("express");
const router = express.Router();
var DeliveryGuy = require('../models/deliveryGuy.js');

//===========ROUTES==================================


//To see DeliveryGuys in Database
router.get('/', async (req,res)=>{
    try {
        var deliveryGuy = await DeliveryGuy.find({});
        if(!deliveryGuy){
          res.status(404).send();
          }
          res.json(deliveryGuy);
        }
       catch (e) {
        res.status(500).send();
      }

});


//Create DeliveryBoy
router.post("/", (res,req)=>{
       var guy = new DeliveryGuy({
        name : req.body.name,
        phone: req.body.phone
       })

       DeliveryGuy.create(guy,(err,newguy)=>{
           if(err){
                console.log(err);
           }else{
                res.json(newguy);
           }
       })
       
});

module.exports = router;