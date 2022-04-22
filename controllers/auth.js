const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail');
const User = require('../models/user');
//const jwtConfig = require('../jwtConfig');
const accessTokenSecret = process.env.accessTokenSecret;
const refreshTokenSecret = process.env.refreshTokenSecret;
const front_end_URI = process.env.FRONTEND;

function getAccessToken(payload) {
    return jwt.sign(payload, accessTokenSecret, { expiresIn: '15min' });
}

function token_verf(user, token){
    var secret_new = user.password + "-" + user.lastReset;
    return jwt.verify(token, secret_new, (err, decodedUser) => {
        if (err) return false;
        else if (!decodedUser || !decodedUser._id) return false;
        else return true;
    });
}

const getRefreshToken = async (payload,user) => {
    const userRefreshTokens = user['tokens'];
    if (userRefreshTokens.length >= 5) {
     user['tokens'] = [];
    }
    const refreshToken = jwt.sign(payload, refreshTokenSecret, { expiresIn: '30d' });
    user['tokens'].push(refreshToken);
    const result = await user.save();
    if(!result){
        return null;
    }
    return refreshToken;
}

async function refreshToken(token) {
    const decodedToken = jwt.verify(token, refreshTokenSecret);
    const user = await User.findById(decodedToken.userId).select('_id email tokens name');
    if (!user) {
        throw new Error(`Access is forbidden`);
    } // get all user's refresh tokens from DB
    const allRefreshTokens = user['tokens'];
    if (!allRefreshTokens || !allRefreshTokens.length) {
        throw new Error(`There is no refresh token for the user with`);
    }
    const currentRefreshToken = allRefreshTokens.includes(token); 
    if (!currentRefreshToken) {
        throw new Error(`Refresh token is wrong`);
    }
    const payload = {
     userId : user.id,
     email: user.email,
     name: user.name
    };
    const newRefreshToken = getUpdatedRefreshToken(payload);
    const newAccessToken = getAccessToken(payload);
    user['tokens'] = [newRefreshToken];
    const result = await user.save();
    if(!result){
        throw new Error(`Try Again`);
    }
    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
    };
}

function getUpdatedRefreshToken(payload) {
    const newRefreshToken = jwt.sign(payload, refreshTokenSecret, { expiresIn: '30d' });
    return newRefreshToken;
}

exports.login = async (req,res,next) =>{
    let result = await User.findOne({'email':req.body.email}).select('name email isVerified _id tokens password');
    if(result){
        const match = await bcrypt.compare(req.body.password,result.password);
        if(match){
            if(result.isVerified){
                const payload = {
                    email: result.email,
                    name: result.name,
                    userId: result._id.toString()
                };
                const token = getAccessToken(payload);
                const refreshToken = await getRefreshToken(payload,result);
                if(refreshToken){
                    res.status(200).json({token:token,refreshToken:refreshToken,userId:result._id.toString(),message:"Login Successful"});
                } else {
                    res.status(200).json({message:"Login Unsuccessful."});
                }
            }
            else{
                res.status(200).json({message:"Please Verify your email id. Not received Verification Mail check spam folder once."})
            }
        } else {
                res.status(200).json({message:"Login Unsuccessful, Email or Password is wrong."})
        }
    } else {
        res.status(200).json({message:"Login Unsuccessful, Email or Password is wrong."})
    }
    
}

exports.refreshToken = async (req, res, next) => {
    const refreshTok = req.body.refreshToken;;
    if (!refreshTok) {
        return res.status(403).send('Access is forbidden');
    } 
    try {
        const newTokens = await refreshToken(refreshTok, res);
        res.status(200).json(newTokens);
    } catch (err) {
        const message = (err && err.message) || err;
        res.status(403).send(message);
    }
};

exports.createUser = async (req,res,next) =>{
    const name = req.body.name;
    const password = await bcrypt.hash(req.body.password,12);;
    const email = req.body.email;
    const branch = req.body.branch;
    const user = new User({
        name: name,
        email: email,
        password: password,
        branch: branch,
        isVerified: false,
        lastReset: Date.now()
    });
    let check = await User.findOne({email:email});
    if(check){
        res.status(200).json({message:'User already registered.'});
        return;
    }
    user.save().then((result)=>{
        if(result){
            var user_payload = {
                _id : user._id,
                email : user.email
            }
            var re_secret = user.password + '-' + user.lastReset;
            var verf_token = jwt.sign(user_payload, re_secret, { expiresIn: '30min' });
            var url = front_end_URI + "/verify/" + user._id +"/" + verf_token;
            var html_msg = "Hi " + user.name + "<br><br>Thanks for creating Account on Coding Platform . Pls click on the link below to verify your email.<br>" + url + "<br><br>Link will expire in 30 Minutes.<br><br><br>Regards<br>Team Coding Platform";
            const msg = {
                to: user_payload.email,
                from: 'cplatform@abhis.me',
                subject: 'Verify Account for Coding Platform',
                html: html_msg
            };
            sgMail.send(msg).then(() => {}, error => {
                console.error(error);
                if (error.response) {
                    console.error(error.response.body)
                }
            });
            res.status(201).json({'added':true,message:"An verification Email set to your email."})
        } else {
            res.status(500).json({message:"Try Again"})
        }
    }).catch((error)=>{
        let msg = (error.message) ? error.message : "Error occured.";
        res.status(401).json({message: msg});
    })
}

exports.verify = async (req,res,next) =>{
    const token = req.get('Verify-token')
    const id = req.get('User-ID')
    User.findOne({_id:id}).select('name email _id password lastReset').then(user => {
        if(!user) return res.status(200).json({message:"Invalid Token code : 1"}); 
        else if(token_verf(user, token)){
            user.isVerified = true;
            user.lastReset = Date.now();
            user.save();
            res.status(200).json({message:"Email Verified"}); 
        }
        else res.status(200).json({message:"Invalid Token code : 2"});
         
    }).catch((err)=>{
        res.status(200).json({message:"Invalid Token code : 3"});
    })
}

exports.changePassword = async (req,res,next) =>{
    const password = await bcrypt.hash(req.body.password,12);
    const token = req.get('Reset-token')
    const id = req.get('User-ID')
    User.findOne({_id:id}).select('name email _id password lastReset').then(user => {
        if(!user) return res.status(401).json({message:"Invalid Token code : 1"});  
        else if(token_verf(user, token)){
            user.password = password;
            user.isVerified = true;
            user.save() 
            return res.status(200).json({message:"Password Changed"});
        }
        else return res.status(401).json({message:"Invalid Token code : 2"});
    }).catch((err)=>{
        res.status(401).json({message:"Invalid Token code : 3"});
    })
}

exports.changePasswordEmail = async (req,res,next) =>{
    const email = req.body.email;
    User.findOne({email:email}).select('name email _id password lastReset').then(user => {
        if(!user){
            res.status(200).json({'message':"User Not Found"})
            return;
        }
        else{
            var curr_time = Date.now();
            if(curr_time - user.lastReset < 1000*60*30 ){
                res.status(200).json({'message':"Pls wait for 30 mins before requesting again"})
                return;
            }
            else{
                user.lastReset = curr_time;
                user.save()
                var user_payload = {
                    _id : user._id,
                    email : user.email
                }
                var re_secret = user.password + '-' + user.lastReset;
                var verf_token = jwt.sign(user_payload, re_secret, { expiresIn: '30min' });
                var url = front_end_URI + "/reset/" + user._id +"/" + verf_token;
                user_payload.url = url;
                user_payload.name = user.name;
                return user_payload;
            }
        }
    }).then((user_payload)=>{
        if(user_payload){
            var html_msg = "Hi " + user_payload.name + "<br><br>You requested to reset the password for your Coding Platform Account. Pls click on the link below to reset your password <br>" + user_payload.url + "<br><br>Regards<br>Team Coding Platform";
            const msg = {
                to: user_payload.email,
                from: 'cplatform@abhis.me',
                subject: 'Reset Password for Coding Platform',
                html: html_msg
            };
            sgMail.send(msg)
            return res.status(200).json({'message': "Email sent to register email Id. Email not found? Check spam folder."})
        }
    }).catch(()=>{
        res.status(401).json({message:'Error Occured.'});
    })
}
