const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('../models/user');

const jwtConfig = require('../jwtConfig');

const accessTokenSecret = jwtConfig.accessTokenSecret;
const refreshTokenSecret = jwtConfig.refreshTokenSecret;

function getAccessToken(payload) {
    return jwt.sign(payload, accessTokenSecret, { expiresIn: '15min' });
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
    let result = await User.findOne({'email':req.body.email}).select('name email _id tokens password');
    
    if(result){
        const match = await bcrypt.compare(req.body.password,result.password);
        if(match){
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
        branch: branch
    });
    let check = await User.findOne({email:email});
    if(check){
        res.status(200).json({message:'User already registered.'});
        return;
    }
    user.save().then((result)=>{
        if(result){
            res.status(201).json({'added':true,message:"User Added Successfully."})
        } else {
            res.status(500).json({message:"Try Again"})
        }
        
    }).catch((error)=>{
        let msg = (error.message) ? error.message : "Error occured.";
        res.status(401).json({message: msg});
    })
}

exports.changePassword = async (req,res,next) =>{
    const email = req.body.email;
    const password = await bcrypt.hash(req.body.password,12);;
    User.findOne({email:email}).then(user => {
        if(!user){
            res.status(500).json({'message':"User Not Found"})
            return;
        }
        user.password = password;
        return user.save();
    }).then((result)=>{
        if(!result){
            res.status(500).json({'message':"Request Failed"})
        }
        res.status(200).json({'message':"Password Changed."})
    }).catch(()=>{
        res.status(401).json({message:'Error Occured.'});
    })
}