const User = require('../models/userModel');
const Client = require('../models/clientModel');
const Feedback = require('../models/feedbackModel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const alert = require('alert');
const config = require('../config/config');
const randomstring = require('randomstring');

const securePassword = async(password)=>{
    try{
        const passwordHash = await bcrypt.hash(password,10);
        return passwordHash;
    }catch(error){
        console.log(error.message);
    }
}

const verifyLogin = async(req,res)=>{
    try{
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({email:email});

        if(userData){
            const passwordMatch = await bcrypt.compare(password,userData.password);
            if(passwordMatch ){
                if(userData.is_admin == false){
                    alert("Entered user is not admin");
                    res.render('signin');
                }
                else{
                    req.session.user_id = userData._id;
                    const userInfo = await User.findById({_id:req.session.user_id});
                    res.redirect("/admin/viewClient");
                }
            }
            else{
                alert('Incorrect Password');
                res.render('signin');
            }
        }
        else{
            alert("Email is not registered");
            res.render('signin');
        }


    }catch(error){
        console.log(error.message);
    }
}

const loadViewClient = async(req,res)=>{
    try{
        const userData = await User.findById({_id:req.session.user_id});
        const clientInfo = [];
        const clientData = (await Client.find().sort({name:1})).forEach((client)=>{
            if(client.is_verified==true)
                clientInfo.push(client);
        });
        res.render('viewclient',{user:userData,clientInfo,query:""});
    }catch(error){
        console.log(error.message);
    }
}

const viewClientSearch = async(req,res)=>{
    try{
        const userData = await User.findById({_id:req.session.user_id});
        const clientInfo = [];
        const clientData = (await Client.find().sort({name:1})).forEach((client)=>{
            if(client.is_verified==true)
                clientInfo.push(client);
        });
    
        const query = req.body.query;

        const userInf = clientInfo.filter(item => item.name.includes(query) || item.email.includes(query));
        res.render('viewclient',{user:userData,clientInfo:userInf,query});
    }catch(error){
        console.log(error.message);
    }
}

const viewFeedbacks = async(req,res)=>{
    try{
        const user = await User.findById({_id:req.session.user_id});
        const feedbackInfo = [];
        const feedbacks = (await Feedback.find({client_id:req.body.client_id}).sort({rating:1})).forEach((feedback)=>{
            feedbackInfo.push(feedback);
        });
        if(feedbackInfo){
            const feedbackInf=[];
            const promises = feedbackInfo.map(async (feedback) => {
                console.log(feedback);
                const userData = await User.findById(feedback.user_id); // Await the promise
                console.log(userData);
                let obj = {
                  name: userData.name,
                  email:userData.email,
                  rating: feedback.rating,
                  feedback: feedback.feedback,
                  complaints: feedback.complaints
                };
                feedbackInf.push(obj);
              });
              await Promise.all(promises);
            res.render('viewFeedbacks',{user,feedbackInfo:feedbackInf});
        }
        else{
            alert("no feedbacks there for this client");
            res.redirect("/admin/viewClient");
        }
    }catch(error){
        console.log(error.message);
    }
}

const deleteClient = async(req,res)=>{
    try{
        const userData = await User.findById({_id:req.session.user_id});
        const updatedData = await Client.findByIdAndDelete({_id:req.body.client_id});
        if(updatedData){
            alert('Client Deleted Successfully\nsend a mail to let them know');
            res.render("sendMailForm",{user:userData,name:updatedData.name,email:updatedData.email,subject:"Account has been removed from Dream Home"});
        }
        else{
            alert("Deletion failed");
            res.redirect('/admin/viewClient');
        }            
    }catch(error){
        console.log(error.message);
    }
}

const loadAddClient = async(req,res)=>{
    try{
        const userData = await User.findById({_id:req.session.user_id});
        const clientInfo = [];
        const clientData = (await Client.find().sort({name:1})).forEach((client)=>{
            if(client.is_verified==false)
                clientInfo.push(client);
        });
        res.render('addClient',{user:userData,clientInfo,query:''});
    }catch(error){
        console.log(error.message);
    }
}

const addClientSearch = async(req,res)=>{
    try{
        const userData = await User.findById({_id:req.session.user_id});
        const clientInfo = [];
        const clientData = (await Client.find().sort({name:1})).forEach((client)=>{
            if(client.is_verified==false)
                clientInfo.push(client);
        });
        const query = req.body.query; 

        const userInf = clientInfo.filter(item => item.name.includes(query) || item.email.includes(query));
        res.render('addClient',{user:userData,clientInfo:userInf,query});
    }catch(error){
        console.log(error.message);
    }
}

const addClient = async(req,res)=>{
    try{
        const userData = await User.findById({_id:req.session.user_id});
        const updatedData = await Client.findByIdAndUpdate({_id:req.body.client_id},{$set:{ is_verified:true}});
        if(updatedData){
            alert('Client Added Successfully\nsend a mail to them know');
            res.render("sendMailForm",{user:userData,name:updatedData.name,email:updatedData.email,subject:"Account Verified to work with Dream Home"});
        }
        else{
            alert("Client Add failed");
            res.redirect('/admin/addClient');
        }            
    }catch(error){
        console.log(error.message);
    }
}

const loadViewUser = async(req,res)=>{
    try{
        const userData = await User.findById({_id:req.session.user_id});
        const userInfo = [];
        const clientData = (await User.find().sort({name:1})).forEach((user)=>{
            if(user.is_verified==true && user.is_admin==false)
                userInfo.push(user);
        });
        res.render('viewUser',{user:userData,userInfo,query:""});
    }catch(error){
        console.log(error.message);
    }
}

const viewUserSearch = async(req,res)=>{
    try{
        const userData = await User.findById({_id:req.session.user_id});
        const userInfo = [];

        const clientData = (await User.find().sort({name:1})).forEach((user)=>{
            if(user.is_verified==true && user.is_admin==false)
                userInfo.push(user);
        });
    
        const query = req.body.query; 

        const userInf = userInfo.filter(item => item.name.includes(query) || item.email.includes(query));
        res.render('viewUser',{user:userData,userInfo:userInf,query});
    }catch(error){
        console.log(error.message);
    }
}

const deleteUser = async(req,res)=>{
    try{
        const userData = await User.findById({_id:req.session.user_id});
        const updatedData = await User.findByIdAndDelete({_id:req.body.user_id});
        res.render
        if(updatedData){
            alert('User Deleted Successfully\nsend a mail to let them know');
            res.render("sendMailForm",{user:userData,name:updatedData.name,email:updatedData.email,subject:"Account has been removed from Dream Home"});
        }
        else{
            alert("Deletion failed");
            res.redirect('/admin/viewUser');
        }            
    }catch(error){
        console.log(error.message);
    }
}

const loadSendMail = async (req,res)=>{
    try{
        const userData = await User.findById({_id:req.session.user_id});
        res.render("sendMailForm",{user:userData,name:"",email:"",subject:""});
    }catch(error){
        console.log(error.message);
    }
}

const sendMail = async(req,res)=>{
    try{
        const transporter=nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:465,
            secure:true,
            auth:{
                user:config.emailUser,
                pass:config.emailPassword
            }
        });
        const mailOptions = {
            from:'magantimeghana10@gmail.com',
            to:req.body.email,
            subject:req.body.subject,
            html:'<h3>Message From Dream Home</h3><p>Hey '+req.body.name+'</p><br><p>'+req.body.reason+'</p>'
        }
        transporter.sendMail(mailOptions,function(error,info){
            if(error){
                console.log(error);
            }
            else{
                console.log("Email has been sent:-",info.response);
            }
        })
        alert("Mail has been sent successfully");
        res.redirect("/admin/viewClient");
    }catch(error) {
        console.log(error.message);
    }
}

const loadChangePassword = async(req,res)=>{
    try{
        const userData = await User.findById({_id:req.session.user_id});
        res.render('adminChangePassword',{user:userData});
    }catch(error){
        console.log(error.message);
    }
}

const changePassword = async(req,res)=>{
    try{
        const previous = req.body.previous;
        const user_id = req.body.user_id;
        const newPassword = req.body.new;
        const userData = await User.findById({_id:user_id});

        if(userData){
            const passwordMatch = await bcrypt.compare(previous,userData.password);
            if(passwordMatch){
                const spassword = await securePassword(newPassword);
                const updatedData = await User.findByIdAndUpdate({_id:user_id},{$set:{password:spassword}});
                alert("Password Changed successfully");
                res.render('adminChangePassword',{user:updatedData});
            }
            else{
                alert('Incorrect Previous Password');
                res.render('adminChangePassword',{user:userData});
            }
        }
        else{
            alert("Email is not registered");
            res.render('signin');
        }

    }catch(error){
        console.log(error.message);
    }
}

const loadLogout = async(req,res)=>{
    try{
        req.session.destroy();
        alert('Admin logged out successfully');
        res.render('signin');
    }catch(error){
        console.log(error.message);
    }
}

module.exports = {
    verifyLogin,
    loadViewClient,
    viewClientSearch,
    deleteClient,
    loadAddClient,
    addClientSearch,
    addClient,
    loadViewUser,
    viewUserSearch,
    viewFeedbacks,
    deleteUser,
    loadSendMail,
    sendMail,
    loadChangePassword,
    changePassword,
    loadLogout
}