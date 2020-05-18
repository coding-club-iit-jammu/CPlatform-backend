const User = require('../models/user');

module.exports = async (req, res, next) => {
    
    let flag = "";
    if(req.role == "student"){
        flag = "studying";
    } else if(req.role == "teachingAssistant"){
        flag = "teachingAssistant";
    } else if(req.role == "instructor"){
        flag = "teaching";
    } else {
        res.status(500).json({message:"Try Again."});
        return;
    }

    const userId = req.userId;
    const courseId = req.courseId;

    let userData = await User.findById(userId).select('courses');
    if(!userData){
        res.status(500).json({message:"Try Again"});
        return;
    }

    let outData = [];
    userData = userData.toObject();

    for(let studying of userData['courses'][flag]){
        if(studying.courseId.toString() == courseId){
            if(studying['practice']['solvedQuestions']){
                outData = studying['practice']['solvedQuestions'];
            }
            req.solvedQuestions = outData;
            next();
            return;
        }        
    }
    res.status(500).json({message:"Try Again."});
}
