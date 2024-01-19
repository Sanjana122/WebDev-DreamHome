const User = require('../models/userModel');
const Client = require('../models/clientModel');
const isLogin = async(req,res,next)=>{
    try{
        if(req.session.user_id){
            next();
        }
        else{
            res.redirect('/signin');
        }
    }catch(err){
        console.log(err.message);
    }
}

const isAdminLogin = async(req,res,next)=>{
    try{

        if(req.session.user_id){
            next();
        }
        else{
            res.redirect('/signin');
        }
    }catch(err){
        console.log(err.message);
    }
}

const isClientLogin = async(req,res,next)=>{
    try{
        if(req.session.user_id){
            next();
        }
        else{
            res.redirect('/signin');
        }
    }catch(err){
        console.log(err.message);
    }
}

const isLogout = async(req,res,next)=>{
    try{
        if(req.session.user_id){
            const userData = await User.findById({_id:req.session.user_id});
            if(userData){
                if(userData.is_admin==false){
                    res.redirect('/dashboard');
                }
                else{
                    res.redirect('/admin/viewClient');
                }
            }   
            else{
                const clientData = await Client.findById({_id:req.session.user_id});
                if(clientData)
                    res.redirect('/client/updateProfile');
                else
                    next();
            }
        }
        else
        next();

    }catch(err){
        console.log(err.message);
    }
}


module.exports = {
    isLogin,
    isLogout,
    isClientLogin,
    isAdminLogin
}