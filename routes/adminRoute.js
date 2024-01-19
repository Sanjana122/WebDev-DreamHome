const express = require('express');
const admin_route = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const config = require('../config/config');
const auth = require('../middlewares/auth');

admin_route.use(session({secret:config.sessionSecret,resave: true,saveUninitialized: true}));
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({extended:true}));
admin_route.set('view engine','ejs');
admin_route.set('views','./views/pages');

//importing public to use
admin_route.use('/public', express.static('public'));

const adminController = require('../controllers/adminController');

admin_route.post('/admin/signin',adminController.verifyLogin);

admin_route.get('/admin/viewClient',auth.isAdminLogin,adminController.loadViewClient);
admin_route.post('/admin/viewClient/search',auth.isAdminLogin,adminController.viewClientSearch);
admin_route.post('/admin/deleteClient',adminController.deleteClient);
admin_route.get('/admin/addClient',auth.isAdminLogin,adminController.loadAddClient);
admin_route.post('/admin/addClient/search',auth.isAdminLogin,adminController.addClientSearch);
admin_route.post('/admin/addClient',adminController.addClient);
admin_route.get('/admin/viewUser',auth.isAdminLogin,adminController.loadViewUser);
admin_route.post('/admin/viewUser/search',auth.isAdminLogin,adminController.viewUserSearch);
admin_route.post('/admin/viewFeedbacks',auth.isAdminLogin,adminController.viewFeedbacks);
admin_route.post('/admin/deleteUser',adminController.deleteUser);
admin_route.get('/admin/sendMail',auth.isAdminLogin,adminController.loadSendMail);
admin_route.post('/admin/sendMail',adminController.sendMail);
admin_route.get('/admin/changePassword',auth.isAdminLogin,adminController.loadChangePassword);
admin_route.post('/admin/changePassword',adminController.changePassword);
admin_route.get('/admin/logout',auth.isAdminLogin,adminController.loadLogout);

module.exports = admin_route