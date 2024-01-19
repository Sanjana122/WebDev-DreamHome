const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/project");
const express = require("express");
const app = express();

//for user routes
const userRoute = require('./routes/userRoute');
const adminRoute = require('./routes/adminRoute');
const clientRoute = require('./routes/clientRoute');
app.use('/',adminRoute);
app.use('/',clientRoute);
app.use('/',userRoute);

app.listen(9000,function(){
    console.log("server is running.....")
})