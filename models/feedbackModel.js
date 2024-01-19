const User = require('../models/userModel');
const Client = require('../models/clientModel');
const { text } = require("body-parser");
const mongoose = require("mongoose");
const feedbackSchema = new mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    client_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Client',
        required:true
    },
    rating:{
        type:Number,
        required:true
    },
    feedback:{
        type:String,
        required:true
    },
    complaints:{
        type:String,
        default:""
    }
});

module.exports = mongoose.model('Feedback',feedbackSchema);