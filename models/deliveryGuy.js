const mongoose = require("mongoose");
var mongooseTypePhone = require("mongoose-type-phone");

const Schema = mongoose.Schema;

const DeliveryGuySchema = new Schema({
    name:{
        type:String,
        required:true
    },
    phone:{
        type: String,
        required:true
    }
});
DeliveryGuy = mongoose.model("DeliveryGuy", DeliveryGuySchema);


// DeliveryGuy.create({name:"abc",phone:123452221},(err,guy)=>{
//     if(err){
//         console.log(err);
//     }
//     else 
//     console.log(guy);
// });
// Uncomment when done with schema
 module.exports = DeliveryGuy 
