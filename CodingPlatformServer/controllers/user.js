const User = require('../models/user');

exports.getUserData = (req,res,next) =>{
    const userId = req.userId;
    User.findOne({_id: userId}).select('name email courses _id branch').then((user)=>{
        console.log(user);
        res.json(user);
    })
}