const { text } = require("body-parser");
const mongoose = require("mongoose");
const clientSchema = new mongoose.Schema({
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
    rating:{
        type:Number,
        default:0,
    },
    profession:{
        type:String,
        required:true
    },
    location:{
        type:String,
        default:"Not Required"
    },
    projects:{
        type:String,
        default:"Not Mentioned"
    },
    experience:{
        type:Number,
        default:0
    },
    minBudget:{
        type:Number,
        default:0
    },
    description:{
        type:String,
        default:""
    },
    is_verified:{
        type:Boolean,
        default:false
    },
    token:{
        type:String,
        default:''
    }
});

module.exports = mongoose.model('Client',clientSchema);