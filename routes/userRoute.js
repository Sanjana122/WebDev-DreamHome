const express = require('express');
const user_route = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const config = require('../config/config');

const auth = require('../middlewares/auth');

user_route.use(session({secret:config.sessionSecret,resave: true,saveUninitialized: true}));
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:true}));
user_route.set('view engine','ejs');
user_route.set('views','./views/pages');

//importing public to use
user_route.use('/public', express.static('public'));

const userController = require('../controllers/userController');

//basic static home pages
user_route.get('/',async(req,res)=>{
    res.render("home-page");
});
user_route.get('/home',async(req,res)=>{
    res.render("home-page");
});
user_route.get('/home/services',async(req,res)=>{
    res.render("services");
});
user_route.get('/home/aboutus',async(req,res)=>{
    res.render("aboutus");
});

//autentication
user_route.get('/signup',auth.isLogout,userController.loadRegister);
user_route.post('/signup',userController.insertUser);
user_route.get('/verify',userController.verifyMail);
user_route.get('/signin',auth.isLogout,userController.loadLogin);
user_route.post('/signin',userController.verifyLogin);
user_route.get('/forgetPassword',auth.isLogout,userController.loadForget);
user_route.post('/forgetPassword',userController.verifyForget);
user_route.get('/resetPassword',auth.isLogout,userController.loadResetPassword);
user_route.post('/resetPassword',userController.resetPassword);

//view user
user_route.get('/dashboard',auth.isLogin,userController.loadHouse);
user_route.get('/dashboard/house_buy',userController.loadHouse);
user_route.post('/dashboard/house_buy',auth.isLogin,userController.houseFilters);
user_route.get('/dashboard/house_sell',auth.isLogin,userController.house_sell);
user_route.post('/dashboard/house_sell',userController.houseSell);
user_route.get('/dashboard/land_buy',userController.loadLand);
user_route.post('/dashboard/land_buy',auth.isLogin,userController.LandFilters);
user_route.get('/dashboard/land_sell',auth.isLogin,userController.land_sell);
user_route.post('/dashboard/land_sell',userController.LandSell);
user_route.get('/dashboard/architects',auth.isLogin,userController.loadArchitects);
user_route.post('/dashboard/architects',auth.isLogin,userController.architectsFilters);
user_route.get('/dashboard/contractors',auth.isLogin,userController.loadContractors);
user_route.post('/dashboard/contractors',auth.isLogin,userController.contractorsFilters);
user_route.get('/dashboard/designers',auth.isLogin,userController.loadDesigners);
user_route.post('/dashboard/designers',auth.isLogin,userController.designersFilters);
user_route.post('/dashboard/requestClient',auth.isLogin,userController.requestClient);
user_route.post('/dashboard/viewProfile',auth.isLogin,userController.viewProfile);
user_route.post('/dashboard/loadSendFeedback',auth.isLogin,userController.loadSendFeedback);
user_route.post('/dashboard/sendFeedback',auth.isLogin,userController.sendFeedback);
user_route.get('/dashboard/deals',auth.isLogin,userController.loadDeals);
user_route.get('/dashboard/changePassword',auth.isLogin,userController.loadChangePassword);
user_route.post('/dashboard/changePassword',auth.isLogin,userController.changePassword);
user_route.get('/dashboard/logout',auth.isLogin,userController.loadLogout);

module.exports = user_route