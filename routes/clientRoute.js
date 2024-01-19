const express = require('express');
const client_route = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const config = require('../config/config');
const auth = require('../middlewares/auth');
client_route.use(session({secret:config.sessionSecret,resave: true,saveUninitialized: true}));
client_route.use(bodyParser.json());
client_route.use(bodyParser.urlencoded({extended:true}));
client_route.set('view engine','ejs');
client_route.set('views','./views/pages');

//importing public to use
client_route.use('/public', express.static('public'));

const clientController = require('../controllers/clientController');

client_route.post('/client/signin',clientController.verifyLogin);
client_route.get('/clientRegistration',clientController.loadclientRegistration);
client_route.post('/clientRegistration',clientController.insertClient);
client_route.post('/client/forgetPassword',clientController.verifyForget);
client_route.get('/client/resetPassword',auth.isLogout,clientController.loadResetPassword);
client_route.post('/client/resetPassword',clientController.resetPassword);

client_route.get('/client/updateProfile',auth.isClientLogin,clientController.loadUpdateProfile);
client_route.post('/client/updateProfile',clientController.updateProfile);
client_route.get('/client/pendingDeals',auth.isClientLogin,clientController.loadPendingDeals);
client_route.post('/client/pendingDeals',clientController.pendingDealsSearch);
client_route.get('/client/approvedDeals',auth.isClientLogin,clientController.loadApprovedDeals);
client_route.post('/client/approvedDeals',clientController.approvedDealsSearch);
client_route.post('/client/acceptRequest',clientController.acceptRequest);
client_route.post('/client/deleteRequest',clientController.deleteRequest);

client_route.get('/client/changePassword',auth.isClientLogin,clientController.loadChangePassword);
client_route.post('/client/changePassword',clientController.changePassword);
client_route.get('/client/logout',auth.isClientLogin,clientController.loadLogout);

module.exports = client_route