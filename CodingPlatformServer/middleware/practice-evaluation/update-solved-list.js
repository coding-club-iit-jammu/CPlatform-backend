const User = require('../../models/user');
const UserPracticeRecord = require('../../models/practice-record-user');
const Course = require('../../models/course');

module.exports = async (req,res,next)=>{
    const solvedQuestions = req.solvedQuestions;
    const questionId = req.body.questionId;
    const userId = req.userId;
    const courseType = req.courseType;
    const courseId = req.courseId;
    let isPreviouslySolved = solvedQuestions.includes(questionId.toString());
    req.isPreviouslySolved = isPreviouslySolved;
    if(!isPreviouslySolved){
        const user = await User.findById(userId).select('courses');
        if(!user){
            res.status(500).json({message:"Try Again"});
            return;
        }
        for(let studying of user['courses'][courseType]){
            if(studying.courseId.toString() == courseId){
                if(req.isCorrect){
                    studying['practice']['solvedQuestions'].push(questionId);
                }
                req.userRecordId = studying['practice']['record'];
                break;
            }        
        }
        const result = await user.save();
        if(!result){
            console.log("Couldn't push questionId in solved question list.");
            res.status(500).json({message:"Try Again."});
        } else {
            next();
        }
    } else {
        res.status(200).json({message:"Correct Answer."});
    }
}