const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const Course = require('../models/course');
const User = require('../models/user');


exports.login = (req,res,next) =>{
    User.findOne({'email':req.body.email}).then((result)=>{
        if(result){
            bcrypt.compare(req.body.password,result.password,).then(match=>{
                if(match){
                    const token = jwt.sign(
                                    {
                                        email:result.email,
                                        name: result.name,
                                        userId:result._id.toString()
                                    },
                                    "ThisIsASecretKeyPratikParmarASDFGHJKLZXCVBNMQWERTYUIOP",
                                    {expiresIn: '2h'});
                    res.status(200).json({token:token,userId:result._id.toString(),message:"Login Successful"});
                    
                } else {
                    console.log(err);
                    res.status(200).json({message:"Login Unsuccessful, Email or Password is wrong."})
                }
            })
        } else {
            res.status(200).json({message:"Login Unsuccessful, Email or Password is wrong."})
        }
    });
    
}

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
    user.save().then((result)=>{
        if(result){
            console.log("User Added Successfully.");
            res.json({'added':true,message:"User Added Successfully."})
        } else {
            console.log("Error occured while adding user.");
            res.json({'added':false,message:"Try Again"})
        }
        
    }).catch(()=>{
        res.status(401).json({message:'Error Occured.'});
    })
}

exports.changePassword = async (req,res,next) =>{
    const email = req.body.email;
    const password = await bcrypt.hash(req.body.password,12);;
    User.findOne({email:email}).then(user => {
        if(!user){
            res.status(500).json({'message':"User Not Found"})
        }
        user.password = password;
        return user.save();
    }).then((result)=>{
        if(!result){
            res.status(500).json({'message':"User Not Added"})
        }
        res.status(200).json({'message':"User Added"})
    }).catch(()=>{
        res.status(401).json({message:'Error Occured.'});
    })
}