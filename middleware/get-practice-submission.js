const User = require('../models/user');
const UserPracticeRecord = require('../models/practice-record-user');
const Course = require('../models/course');
const CodingQuestion = require('../models/questions/coding-question');
const path = require('path');
const fs = require('fs');

module.exports = async(req,res,next)=>{
	 const questionId = req.query.questionId;
    const userId = req.userId;
    const courseId = req.courseId;

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
    
    req.courseType = flag;
    const courseType = flag;
    const user = await User.findById(userId).select('courses');
    if(!user){
        res.status(500).json({message:"Try Again"});
        return;
    }
    let isPreviouslySolved = false;
    let solvedQuestions = [];
    for(let studying of user['courses'][courseType]){
        if(studying.courseId.toString() == courseId){
            solvedQuestions = studying['practice']['solvedQuestions'];
            solvedQuestions = solvedQuestions.map(String);
            req.solvedQuestions = solvedQuestions;
            isPreviouslySolved = solvedQuestions.includes(questionId.toString());
            req.userRecordId = studying['practice']['record'];
            if(!isPreviouslySolved){
            	
               res.status(500).json({message:'no submission found'})
            }

            else
            {            	
            	req.userRecordId = studying['practice']['record'];
            	next();
            }
            break;
        }        
    }
    
    
}