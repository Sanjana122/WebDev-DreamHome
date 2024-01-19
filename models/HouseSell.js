const mongoose = require("mongoose");
const User = require('../models/userModel');
const houseSell = new mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    //basic info
    property: {
        type: String,
        //required: true
    },
    status: {
        type: String,
        //required: true
    },
    no_rooms: {
        type: String,
        //required: true
    },
    no_baths: {
        type: Number,
        //required: true
    },
    balcony: {
        type:Number,
        //required: true
    },
    parking: {
        type:Number,
        //required: true
    },
    city: {
         type: String,
         required: true
     },
    building: {
         type: String,
         required: true
     },
    local: {
         type: String,
        required: true
     },
    flat: {
        type: String,
         required: true
     },
    floor: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        // required: true
    },
    area: {
        type: Number,
        // required: true
    },
    Description:{
        type: String,
        required: true
    }
});


module.exports = mongoose.model('HouseSell',houseSell);