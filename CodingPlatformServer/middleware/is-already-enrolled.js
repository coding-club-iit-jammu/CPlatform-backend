const User = require('../models/user');
module.exports = async (req,res,next) => {
    const userId = req.userId;
    const code = req.body.code;
    let user = await User.findById(userId).select('courses');
    if(!user){
        res.status(500).json({message:"User not found."});
    }
    user = user.toObject();
    let teaching = (user['courses']['teaching']).find(obj => obj.code == code);
    let teachingAssistant = (user['courses']['teachingAssistant']).find(obj => obj.code == code);
    let studying = (user['courses']['studying']).find(obj => obj.code == code);

    if(teaching){
        res.status(200).json({message:"Already Enrolled as Instructor"})
        return;
    }
    if(teachingAssistant){
        res.status(200).json({message:"Already Enrolled as TA"})
        return;
    }
    if(studying){
        res.status(200).json({message:"Already Enrolled as Student"})
        return;
    }

    next();
}