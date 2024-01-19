const User = require('../models/userModel');
const Client = require('../models/clientModel');
const House = require('../models/HouseSell');
const Land = require('../models/LandSell');
const Feedback = require('../models/feedbackModel');
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

const loadRegister = async(req,res)=>{
    try{
        res.render('signup');
    }catch(error){
        console.log(error.message);
    }
}

const insertUser = async(req,res)=>{
    try{
        if(req.body.password==req.body.confirm_password)
        {
            const duplicate = await User.findOne({ $or: [ { email: req.body.email }, { mobile: req.body.mobile } ] });
            if(duplicate){
                alert('User already registered\nGo to Signin')
                res.redirect("/signup");
            }
            else{
                const spassword = await securePassword(req.body.password);
                const user = new User({
                    name:req.body.name,
                    email:req.body.email,
                    mobile:req.body.mobile,
                    password:spassword,
                    is_admin:false,
                    is_verified:false
                });
                const userData = await user.save();
                if(userData){
                    sendVerifyMail(req.body.name,req.body.email,userData._id);
                    alert("signup done successfully please verify your email");
                    res.render('signin');
                }
                else{
                    alert("signup failed");
                    res.render('signup');
                }  
            }
        }
        else{
            alert("password and confirm password doesnot match");
        }
    } catch(err){
        console.log(err.message);
    }
}

const verifyMail = async(req,res)=>{
    try{
        const updateInfo = await User.updateOne({_id:req.query.id},{$set:{ is_verified:true}});
        alert("User is verified\nLogin to view dashboard");
        res.redirect('/signin');
    }catch(error){
        console.log(error.message);
    }
}

const loadLogin = async(req,res)=>{
    try{
        res.render('signin');
    } catch(error){
        console.log(error.message);
    }
}

const verifyLogin = async(req,res)=>{
    try{
        const email=req.body.email;
        const password=req.body.password;
        const userData = await User.findOne({email:email});

        if(userData){
            const passwordMatch = await bcrypt.compare(password,userData.password);
            if(passwordMatch){
                if(userData.is_verified == false){
                    sendVerifyMail(req.body.name,req.body.email,userData._id);
                    alert("Please verify your email");
                    res.render('signin');
                }
                else{
                    req.session.user_id = userData._id;
                    const userInfo = await User.findById({_id:req.session.user_id});
                    res.redirect('/dashboard/house_buy');
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

const loadForget = async(req,res)=>{
    try{
        res.render('forget_password');
    }catch(error){
        console.log(error.message);
    }
}

const verifyForget = async(req,res)=>{
    try{
        const email = req.body.email;
        const userData = await User.findOne({email:email});
        if(userData){
            if(userData.is_verified == false){
                alert('Please Verify your email');
                res.render('forget_password');
            }
            else{
                const randomString = randomstring.generate();
                const updatedData = await User.updateOne({email:email},{$set:{token:randomString}});
                sendResetPasswordMail(userData.name,userData.email,randomString);
                alert("Please check your mail to reset the password");
                res.render('forget_password');
            }
        }
        else{
            alert("User Email is incorrect");
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
            html:'<p>Hii '+name+' please click here to <a href="http://127.0.0.1:3000/resetPassword?token='+token+'"> Reset </a> your password.</p>'
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
        const tokenData = await User.findOne({token:token});
        if(tokenData){
            res.render('reset_password',{user_id:tokenData._id});
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
            const updatedData = await User.findByIdAndUpdate({_id:user_id},{$set:{password:secure_password,token:''}});
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

//logged in user methods

const house_sell = async(req,res)=>{
    try{
        const userData = await User.findById({_id:req.session.user_id});
        res.render('house_sell',{user:userData});
    }catch(error){
        console.log(error.message);
    }
}

const  houseSell= async(req,res)=>{
    const user = new House({
        user_id:req.body.user_id,
       property: req.body.property,
       status: req.body.status,
       no_rooms: req.body.no_rooms,
       no_bath: req.body.mo_bath,
       balcony: req.body.balcony,
       parking: req.body.parking ,
       city: req.body.city,
       building: req.body.building,
       local: req.body.local,
       flat: req.body.flat,
       floor: req.body.floor,
       price: req.body.price,
       area: req.body.area,
       Description: req.body.desc
    });
    const userData = await user.save();
    if(userData) {
        alert("Sell Completed")
    }
}


const land_sell = async(req,res)=>{
    try{
        const userData = await User.findById({_id:req.session.user_id});
        res.render('land_sell',{user:userData});
    }catch(error){
        console.log(error.message);
    }
}

const  LandSell= async(req,res)=>{
    const user = new Land({
        user_id:req.body.user_id,
       City: req.body.city,
       Locality: req.body.locality,
       Area: req.body.area,
       Price: req.body.price,
       Description: req.body.desc
    });
    const userData = await user.save();
    if(userData) {
        alert("Sell Completed")
    }
}

const loadHouse = async(req,res)=>{
    try{
        const userData = await User.findById({_id:req.session.user_id});
        const HouseInfo = [];
        const houseData = (await House.find().sort({_id:1})).forEach((House)=>{
            HouseInfo.push(House);
        });
        res.render('house_buy',{user:userData,HouseInfo});
    }catch(error){
        console.log(error.message);
    }
}

const houseFilters = async(req,res)=>{
    try{
        const userData = await User.findById({_id:req.session.user_id});
        const HouseInfo = [];
        const HouseData = (await House.find().sort({_id:1})).forEach((House)=>{
            HouseInfo.push(House);
        });
        console.log(HouseInfo);
        const HouseInf = HouseInfo.filter((item) => req.body.no_rooms.includes(item.no_rooms) && req.body.property.includes(item.property) && req.body.balcony.includes(item.balcony) && req.body.status.includes(item.status)&& req.body.city.includes(item.city));
        res.render('house_buy',{user:userData,HouseInfo:HouseInf});
    }catch(error){
        console.log(error.message);
    }
}

const loadLand= async(req,res)=>{
    try{
        const userData = await User.findById({_id:req.session.user_id});
        const LandInfo = [];
        const landData = (await Land.find().sort({_id:1})).forEach((Land)=>{
            LandInfo.push(Land);
        });
        res.render('land_buy',{user:userData,LandInfo});
    }catch(error){
        console.log(error.message);
    }
}

const LandFilters = async(req,res)=>{
    try{
        const userData = await User.findById({_id:req.session.user_id});
        const LandInfo = [];
        const LandData = (await Land.find().sort({_id:1})).forEach((Land)=>{
            LandInfo.push(Land);
        });
        const LandInf = LandInfo.filter((item) => item.area>=req.body.area && item.price>=req.body.price && req.body.city.includes(item.city));
        res.render('land_buy',{user:userData,LandInfo:LandInf});
    }catch(error){
        console.log(error.message);
    }
}

const loadArchitects = async(req,res)=>{
    try{
        const userData = await User.findById({_id:req.session.user_id});
        const clientInfo = [];
        const clientData = (await Client.find().sort({name:1})).forEach((client)=>{
            if(client.is_verified==true && client.profession=='Architect')
            clientInfo.push(client);
        });
        res.render('architects',{user:userData,clientInfo});
    }catch(error){
        console.log(error.message);
    }
}

const architectsFilters = async(req,res)=>{
    try{
        const userData = await User.findById({_id:req.session.user_id});
        const clientInfo = [];
        const clientData = (await Client.find().sort({name:1})).forEach((client)=>{
            if(client.is_verified==true && client.profession=='Architect')
            clientInfo.push(client);
        });
        const minexperience = req.body.minexperience; 

        const clientInf = clientInfo.filter(item => item.experience>=minexperience && item.minBudget>=req.body.minBudget);
        res.render('architects',{user:userData,clientInfo:clientInf});
    }catch(error){
        console.log(error.message);
    }
}

const loadContractors = async(req,res)=>{
    try{
        const userData = await User.findById({_id:req.session.user_id});
        const clientInfo = [];
        const clientData = (await Client.find().sort({name:1})).forEach((client)=>{
            if(client.is_verified==true && client.profession=='Contractor')
            clientInfo.push(client);
        });
        res.render('contractors',{user:userData,clientInfo});
    }catch(error){
        console.log(error.message);
    }
}

const contractorsFilters = async(req,res)=>{
    try{
        const userData = await User.findById({_id:req.session.user_id});
        const clientInfo = [];
        const clientData = (await Client.find().sort({name:1})).forEach((client)=>{
            if(client.is_verified==true && client.profession=='Contractor')
            clientInfo.push(client);
        });
        const minexperience = req.body.minexperience; 
        
        const clientInf = clientInfo.filter(item => item.experience>=minexperience && item.minBudget>=req.body.minBudget && req.body.location.includes(item.location));
        res.render('contractors',{user:userData,clientInfo:clientInf});
    }catch(error){
        console.log(error.message);
    }
}

const loadDesigners = async(req,res)=>{
    try{
        const userData = await User.findById({_id:req.session.user_id});
        const clientInfo = [];
        const clientData = (await Client.find().sort({name:1})).forEach((client)=>{
            if(client.is_verified==true && client.profession=='Interior Designer')
            clientInfo.push(client);
        });
        res.render('designers',{user:userData,clientInfo});
    }catch(error){
        console.log(error.message);
    }
}

const designersFilters = async(req,res)=>{
    try{
        const userData = await User.findById({_id:req.session.user_id});
        const clientInfo = [];
        const clientData = (await Client.find().sort({name:1})).forEach((client)=>{
            if(client.is_verified==true && client.profession=='Interior Designer')
            clientInfo.push(client);
        });
        const minexperience = req.body.minexperience; 

        const clientInf = clientInfo.filter(item => item.experience>=minexperience && item.minBudget>=req.body.minBudget && req.body.location.includes(item.location));
        res.render('designers',{user:userData,clientInfo:clientInf});
    }catch(error){
        console.log(error.message);
    }
}

const requestClient = async(req,res)=>{
    try{
            const duplicate = await ClientRequest.findOne({client_id:req.body.client_id,user_id:req.body.user_id});
            if(duplicate){
                alert('Request sent previously');
                res.redirect("/dashboard/architects");
            }
            else{
                const request = new ClientRequest({
                    user_id:req.body.user_id,
                    client_id:req.body.client_id
                });
                const userData = await request.save();
                if(userData){
                    alert('Request Sent for client successfully');
                }
                else{
                    alert("Request not sent");
                }
                res.redirect('/dashboard/architects');
            }
        }
    catch(err){
        console.log(err.message);
    }
}

const loadSendFeedback = async(req,res)=>{
    try{
        const request = await ClientRequest.findOne({client_id:req.body.client_id,user_id:req.body.user_id});
        if(request)
        {
            if(request.is_accepted==true)
            {
                const duplicate = await Feedback.findOne({client_id:req.body.client_id,user_id:req.body.user_id});
                if(duplicate){
                    alert('Feedback sent previously');
                    res.redirect("/dashboard/architects");
                }
                else{
                    const user = await User.findById({_id:req.body.user_id});
                    const client = await Client.findById({_id:req.body.client_id});
                    res.render("feedback",{user,client});
                }
            }
            else{
                alert("cannot give feedback to this client\nrequest is not accepted yet");
                res.redirect("/dashboard/architects");
            }
        }
        else
        {
            alert("Client request not sent");
            res.redirect("/dashboard/architects");
        }
    }catch(error){
        console.log(error.message);
    }
}

const sendFeedback = async(req,res)=>{
    try{
                const feedback = new Feedback({
                    user_id:req.body.user_id,
                    client_id:req.body.client_id,
                    rating:req.body.rating,
                    feedback:req.body.feedback,
                    complaints:req.body.complaints
                });
                const userData = await feedback.save();
                if(userData){
                    alert('Feedback sent to admin successfully');
                    res.redirect('/dashboard/architects');
                }
                else{
                    alert("Feedback not sent");
                    res.redirect('/dashboard/architects');
                }
    }catch(error){
        console.log(error.message);
    }
}

const viewProfile = async(req,res)=>{
    try{
        const userData = await User.findById({_id:req.body.user_id});
        const client = await Client.findById({_id:req.body.client_id});
        res.render("profile",{user:userData,client});
    }
    catch(err){
        console.log(err.message);
    }
}

const loadDeals = async(req,res)=>{
    try{
        const userData = await User.findById({_id:req.session.user_id});
        const HouseInfo = [];
        const houseData = (await House.find({user_id:userData._id}).sort({_id:1})).forEach((House)=>{
            HouseInfo.push(House);
        });
        const LandInfo = [];
        const landData = (await Land.find({user_id:userData._id}).sort({_id:1})).forEach((Land)=>{
            LandInfo.push(Land);
        });
        res.render('deals',{user:userData,HouseInfo,LandInfo});
    }catch(error){
        console.log(error.message);
    }
}

const loadChangePassword = async(req,res)=>{
    try{
        const userData = await User.findById({_id:req.session.user_id});
        res.render('change_password',{user:userData});
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
                res.render('change_password',{user:updatedData});
            }
            else{
                alert('Incorrect Previous Password');
                res.render('change_password',{user:userData});
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
        alert('User logged out successfully');
        res.render('signin');
    }catch(error){
        console.log(error.message);
    }
}

module.exports={
    loadRegister,
    insertUser,
    sendVerifyMail,
    verifyMail,
    loadLogin,
    verifyLogin,
    house_sell,
    houseSell,
    land_sell,
    LandSell,
    loadHouse,
    houseFilters,
    loadLand,
    LandFilters,
    loadArchitects,
    architectsFilters,
    loadContractors,
    contractorsFilters,
    loadDesigners,
    designersFilters,
    requestClient,
    viewProfile,
    loadSendFeedback,
    sendFeedback,
    loadDeals,
    loadForget,
    verifyForget,
    sendResetPasswordMail,
    loadResetPassword,
    resetPassword,
    loadChangePassword,
    changePassword,
    loadLogout,
}