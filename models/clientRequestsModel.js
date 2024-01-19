const User = require('../models/userModel');
const Client = require('../models/clientModel');
const { text } = require("body-parser");
const mongoose = require("mongoose");
const clientRequestSchema = new mongoose.Schema({
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
    is_accepted:{
        type:Boolean,
        required:true,
        default:false
    }
});

module.exports = mongoose.model('ClientRequest',clientRequestSchema);