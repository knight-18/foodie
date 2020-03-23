const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const FoodSchema = new Schema({
    name:{
        type:String,
        required:true
    }
});


Food = mongoose.model("Food", FoodSchema);

//==================for testing ===========================

// var data =[
//     {name:'chicken'},
//     {name:'paneer'},
//     {name:'cheese cake'}
// ]
// Food.create(data,(err,food)=>{
//     if(err){
//         console.log(err);
//     }else{
//         console.log("food created");
//     }

// });

//======================================================



// Uncomment when done with schema
 module.exports = Food ;
