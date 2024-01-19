const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    is_admin:{
        type:Boolean,
        required:true,
        default:false
    },
    is_verified:{
        type:Boolean,
        required:true,
        dafault:false
    },
    token:{
        type:String,
        default:''
    }
});

module.exports = mongoose.model('User',userSchema);