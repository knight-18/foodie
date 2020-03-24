const mongoose = require("mongoose");
var mongooseTypePhone = require("mongoose-type-phone");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const Schema = mongoose.Schema;

const DeliveryGuySchema = new Schema({
    name:{
        type:String,
        required:true
    },
    phone:{
        type: String,
        required:true
    },
    username:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
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
    orders: {
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

DeliveryGuySchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}


//JWT function to generate auth tokens
DeliveryGuySchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

//function to find user by email and verify password
DeliveryGuySchema.statics.findByCredentials = async (username, password) => {
    const user = await DeliveryGuy.findOne({ username })

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
DeliveryGuySchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

// DeliveryGuy.create({name:"abc",phone:123452221},(err,guy)=>{
//     if(err){
//         console.log(err);
//     }
//     else 
//     console.log(guy);
// });
module.exports = DeliveryGuy = mongoose.model("DeliveryGuy", DeliveryGuySchema);
