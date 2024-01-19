const mongoose = require("mongoose");
const User = require('../models/userModel');
const LandSell = new mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    //basic info
    City: {
        type: String,
        //required: true
    },
    Locality: {
        type: String,
        //required: true
    },
    Area:{
        type:Number,
        required: true
    },
    Price: {
        type:Number,
        required: true
    },
    Description:{
        type: String,
        required: true
    }
});


module.exports = mongoose.model('LandSell',LandSell);