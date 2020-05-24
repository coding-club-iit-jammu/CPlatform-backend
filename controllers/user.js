const User = require('../models/user');

exports.getUserData = (req,res,next) =>{
    const userId = req.userId;
    User.findOne({_id: userId}).select('name email courses _id branch').then((user)=>{
        if(!user){
            res.status(400).json({message:'User not Found'});
            return;
        }
        res.status(200).json(user);
    })
}