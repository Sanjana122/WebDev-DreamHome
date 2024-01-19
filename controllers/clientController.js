const User = require('../models/userModel');
const Client = require('../models/clientModel');
const ClientRequest = require('../models/clientRequestsModel');
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

const sendVerifyMail = async(name,email,user_id)=>{
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
            to:email,
            subject:'For Verification mail',
            html:'<p>Hii '+name+' please click here to <a href="http://127.0.0.1:3000/verify?id='+user_id+'"> Verify </a> your mail.</p>'
        }
        transporter.sendMail(mailOptions,function(error,info){
            if(error){
                console.log(error);
            }
            else{
                console.log("Email has been sent:-",info.response);
            }
        })

    } catch(error) {
        console.log(error.message);
    }
}

const loadclientRegistration = async(req,res)=>{
    try{
        res.render('clientRegistration');
    }catch(error){
        console.log(error.message);
    }
}

const insertClient = async(req,res)=>{
    try{
        const duplicate = await Client.findOne({ $or: [ { email: req.body.email }, { mobile: req.body.mobile } ] });
        if(duplicate){
            alert('client already registered\nGo to Signin')
            res.redirect("/clientRegistration");
        }
        else{
            const spassword = await securePassword(req.body.password);
            const client = new Client({
                name:req.body.name,
                email:req.body.email,
                mobile:req.body.mobile,
                password:spassword,
                rating:0,
                profession:req.body.profession,
                experience:req.body.experience,
                minBudget:0,
                is_verified:false
            });
            const clientData = await client.save();
            if(clientData){
                alert("Request sent to admin for Registration");
                res.redirect('/');
            }
            else{
                alert("Request failed");
                res.render('/clientRegistration');
            }  
        }
    } catch(err){
        console.log(err.message);
    }
}

const verifyLogin = async(req,res)=>{
    try{
        const email = req.body.email;
        const password = req.body.password;
        const clientData = await Client.findOne({email:email});

        if(clientData){
            const passwordMatch = await bcrypt.compare(password,clientData.password);
            if(passwordMatch ){
                if(clientData.is_verified == false){
                    alert("Entered client is not verified");
                    res.render('signin');
                }
                else{
                    req.session.user_id = clientData._id;
                    const clientInfo = await Client.findById({_id:req.session.user_id});
                    res.render('updateprofile',{client:clientInfo});
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

const verifyForget = async(req,res)=>{
    try{
        const email = req.body.email;
        const userData = await Client.findOne({email:email});
        if(userData){
            if(userData.is_verified == false){
                alert('Admin didnot accept your request');
                res.render('forget_password');
            }
            else{
                const randomString = randomstring.generate();
                const updatedData = await Client.updateOne({email:email},{$set:{token:randomString}});
                sendResetPasswordMail(userData.name,userData.email,randomString);
                alert("Please check your mail to reset the password");
                res.render('forget_password');
            }
        }
        else{
            alert("Client Email is incorrect");
            res.redirect('/forgetPassword');
        }
    }catch(error){
        console.log(error.message);
    }
}

const sendResetPasswordMail = async(name,email,token)=>{
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
            from:config.emailUser,
            to:email,
            subject:'For Reset Password',
            html:'<p>Hii '+name+' please click here to <a href="http://127.0.0.1:3000/client/resetPassword?token='+token+'"> Reset </a> your password.</p>'
        }
        transporter.sendMail(mailOptions,function(error,info){
            if(error){
                console.log(error);
            }
            else{
                console.log("Email has been sent:-",info.response);
            }
        })

    } catch(error){
        console.log(error.message);
    }
}

const loadResetPassword = async(req,res)=>{
    try{
        const token = req.query.token;
        const tokenData = await Client.findOne({token:token});
        if(tokenData){
            res.render('clientResetPassword',{user_id:tokenData._id});
        }
        else{
            alert("token is invalid");
            res.render('signin');
        }
    }catch(error){
        console.log(error.message);
    }
}

const resetPassword = async(req,res)=>{
    try{
        const password = req.body.password;
        const user_id = req.body.user_id;
        const confirm = req.body.confirm_password;
        if(password==confirm){
            const secure_password = await securePassword(password);
            const updatedData = await Client.findByIdAndUpdate({_id:user_id},{$set:{password:secure_password,token:''}});
            alert("Password Updated successfully\nSignin to view your profile");
            res.redirect('/signin');
        }
        else{
            alert('password and confirm password are not same');
        }
    }catch(error){
        console.log(error.message);
    }
}

const loadUpdateProfile = async(req,res)=>{
    try{
        try{
            const clientData = await Client.findById({_id:req.session.user_id});
            res.render('updateProfile',{client:clientData});
        }catch(error){
            console.log(error.message);
        }
    }catch(error){
        console.log(error.message);
    }
}

const updateProfile = async(req,res)=>{
    try{
        const clientData = await Client.findById({_id:req.session.user_id});
        if(clientData){
                const updatedData = await Client.findByIdAndUpdate({_id:req.body.user_id},{$set:{name:req.body.name,email:req.body.email,mobile:req.body.mobile,location:req.body.location,projects:req.body.projects,minBudget:req.body.minBudget,description:req.body.description}});
                alert("Profile updated successfully");
                const clientInfo = await Client.findById({_id:req.body.user_id});
                res.render('updateProfile',{client:clientInfo});
        }
    }catch(error){
        console.log(error.message);
    }
}

const loadPendingDeals = async(req,res)=>{
    try{
        try{
            const clientData = await Client.findById({_id:req.session.user_id});
            const userInfo = [];
            const requestdata = (await ClientRequest.aggregate([
                {$match: {client_id: clientData._id,is_accepted:false}},
                {
                    $lookup:{
                        from:'users',
                        localField:'user_id',
                        foreignField:'_id',
                        as:'user'
                    }
                },
                { $unwind: "$user" },
                {
                    $project: {
                        'user._id':1.0,
                        'user.name':1.0,
                        'user.email':1.0,
                        'user.mobile':1.0
                    }
                }
            ]).exec()).forEach((element)=>{
                userInfo.push(element.user);
            });

            res.render('pendingDeals',{client:clientData,userInfo,query:''});
        }catch(error){
            console.log(error.message);
        }
    }catch(error){
        console.log(error.message);
    }
}

const pendingDealsSearch = async(req,res)=>{
    try{
        const clientData = await Client.findById({_id:req.session.user_id});
        const userInfo = [];

        const requestdata = (await ClientRequest.aggregate([
            {$match: {client_id:clientData._id,is_accepted:false}},
            {
                $lookup:{
                    from:'users',
                    localField:'user_id',
                    foreignField:'_id',
                    as:'user'
                }
            },
            { $unwind: "$user" },
            {
                $project: {
                    'user._id':1.0,
                    'user.name':1.0,
                    'user.email':1.0,
                    'user.mobile':1.0
                }
            }
        ]).exec()).forEach((element)=>{
            userInfo.push(element.user);
        });
    
        const query = req.body.query;

        const userInf = userInfo.filter(item => item.name.includes(query) || item.email.includes(query));
        res.render('pendingDeals',{client:clientData,userInfo:userInf,query});
    }catch(error){
        console.log(error.message);
    }
}

const loadApprovedDeals = async(req,res)=>{
    try{
        try{
            const clientData = await Client.findById({_id:req.session.user_id});
            const userInfo = [];
            const requestdata = (await ClientRequest.aggregate([
                {$match: {client_id: clientData._id,is_accepted:true}},
                {
                    $lookup:{
                        from:'users',
                        localField:'user_id',
                        foreignField:'_id',
                        as:'user'
                    }
                },
                { $unwind: "$user" },
                {
                    $project: {
                        'user._id':1.0,
                        'user.name':1.0,
                        'user.email':1.0,
                        'user.mobile':1.0
                    }
                }
            ]).exec()).forEach((element)=>{
                userInfo.push(element.user);
            });

            res.render('approvedDeals',{client:clientData,userInfo,query:""});
        }catch(error){
            console.log(error.message);
        }
    }catch(error){
        console.log(error.message);
    }
}

const approvedDealsSearch = async(req,res)=>{
    try{
        const clientData = await Client.findById({_id:req.session.user_id});
        const userInfo = [];

        const requestdata = (await ClientRequest.aggregate([
            {$match: {client_id: clientData._id,is_accepted:true}},
            {
                $lookup:{
                    from:'users',
                    localField:'user_id',
                    foreignField:'_id',
                    as:'user'
                }
            },
            { $unwind: "$user" },
            {
                $project: {
                    'user._id':1.0,
                    'user.name':1.0,
                    'user.email':1.0,
                    'user.mobile':1.0
                }
            }
        ]).exec()).forEach((element)=>{
            userInfo.push(element.user);
        });
    
        const query = req.body.query; 

        const userInf = userInfo.filter(item => item.name.includes(query) || item.email.includes(query));
        res.render('approvedDeals',{client:clientData,userInfo:userInf,query});
    }catch(error){
        console.log(error.message);
    }
}

const acceptRequest = async(req,res)=>{
    try{
        const updateInfo = await ClientRequest.updateOne({user_id:req.body.user_id,client_id:req.body.client_id},{$set:{ is_accepted:true}});

        const userData = await User.findById({_id:req.body.user_id});
        const clientData = await Client.findById({_id:req.session.user_id});
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
                to:userData.email,
                subject:"Client Request accepted by "+clientData.name,
                html:'<h3>Message From Dream Home</h3><p>Hey '+userData.name+'</p><br><p>Your Request is accepted by the client<br>His Contact details are</p><p>Name   : '+clientData.name+'<br>Mobile Number   : '+clientData.mobile+'<br>email  : '+clientData.email+'</p>'
            }
            transporter.sendMail(mailOptions,function(error,info){
                if(error){
                    console.log(error);
                }
                else{
                    console.log("Email has been sent:-",info.response);
                }
            })
        }catch(error) {
            console.log(error.message);
        }
        alert("User Request is accepted");
        res.redirect('/client/pendingDeals');
    }catch(error){
        console.log(error.message);
    }
}

const deleteRequest = async(req,res)=>{
    try{
        const updateInfo = await ClientRequest.findOneAndDelete({user_id:req.body.user_id,client_id:req.body.client_id});
        if(updateInfo){
            alert("User Request is Deleted");
            res.redirect('/client/pendingDeals');
        }
    }catch(error){
        console.log(error.message);
    }
}

const loadChangePassword = async(req,res)=>{
    try{
        const clientData = await Client.findById({_id:req.session.user_id});
        res.render('clientChangePassword',{client:clientData});
    }catch(error){
        console.log(error.message);
    }
}

const changePassword = async(req,res)=>{
    try{
        const previous = req.body.previous;
        const user_id = req.body.client_id;
        const newPassword = req.body.new;
        const clientData = await Client.findById({_id:user_id});

        if(clientData){
            const passwordMatch = await bcrypt.compare(previous,clientData.password);
            if(passwordMatch){
                const spassword = await securePassword(newPassword);
                const updatedData = await Client.findByIdAndUpdate({_id:user_id},{$set:{password:spassword}});
                alert("Password Changed successfully");
                res.render('clientChangePassword',{client:updatedData});
            }
            else{
                alert('Incorrect Previous Password');
                res.render('clientChangePassword',{client:clientData});
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
        alert('Client logged out successfully');
        res.render('signin');
    }catch(error){
        console.log(error.message);
    }
}

module.exports = {
    loadclientRegistration,
    insertClient,
    verifyLogin,
    verifyForget,
    sendResetPasswordMail,
    loadResetPassword,
    resetPassword,
    loadUpdateProfile,
    updateProfile,
    loadPendingDeals,
    pendingDealsSearch,
    loadApprovedDeals,
    approvedDealsSearch,
    acceptRequest,
    deleteRequest,
    loadChangePassword,
    changePassword,
    loadLogout
}
