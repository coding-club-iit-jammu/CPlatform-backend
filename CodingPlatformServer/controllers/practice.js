const Course = require('../models/course');
const User = require('../models/user');
const UserPracticeRecord = require('../models/practice-record-user');
const fs = require('fs');
const path = require('path');

exports.addPracticeQuestion = async (req,res,next)=>{
    const courseId = req.courseId;
    const questionType = req.body.questionType;
    const questionId = req.body.questionId;

    let course = await Course.findById(courseId).select('practiceQuestions');
    if(!course){
        res.status(500).json({message:"Try Again"});
        return;
    }
    let temp = course;
    temp = temp.toObject();
    temp = temp['practiceQuestions'][questionType].toString();
    if(temp.includes(questionId)){
        res.status(200).json({message:"Question already added to Practice"});
        return;
    }
    const result = await course.addQuestionToPractice(questionId,questionType);
    if(!result){
        res.status(500).json({message:"Try Again"});
        return;
    }

    res.status(200).json({message:"Question added to Practice"});
}

exports.getMCQ = async (req,res,next)=>{
    const courseId = req.courseId;
    const solvedQuestions = req.solvedQuestions;
    let course = await Course.findById(courseId)
                        .select('practiceQuestions.mcq')
                        .populate({
                            path: 'practiceQuestions.mcq'
                        });
    if(!course){
        res.status(500).json({message:"Try Again"});
        return;
    }
    course = course.toObject();
    for(let x of course['practiceQuestions']['mcq']){
        x.isSolved = solvedQuestions.includes(x._id.toString()); 
        for(let y of x['options']){
            delete y.isCorrect;
            y['response'] = false;
        }
    }
    res.status(200).json(course['practiceQuestions']['mcq']);
}

exports.getTrueFalse = async (req,res,next)=>{
    const courseId = req.courseId;
    const solvedQuestions = req.solvedQuestions;
    let course = await Course.findById(courseId)
                        .select('practiceQuestions.trueFalse')
                        .populate({
                            path: 'practiceQuestions.trueFalse'
                        });
    if(!course){
        res.status(500).json({message:"Try Again"});
        return;
    }
    course = course.toObject();
    for(let x of course['practiceQuestions']['trueFalse']){
        x.isSolved = solvedQuestions.includes(x._id.toString()); 
        delete x.answer;
        x['response'] = "";
    }
    res.status(200).json(course['practiceQuestions']['trueFalse']);
}

extractContent = async (fileName) => {
    let serverPath = path.join(__dirname, '..'); // one directory back
    let filepath = path.join(serverPath, fileName);
    console.log(filepath);
    return fs.readFileSync(filepath, 'utf-8');
}

exports.getCodingQuestion = async (req,res,next)=>{
    const courseId = req.courseId;
    // const solvedQuestions = req.solvedQuestions;
    let course = await Course.findById(courseId)
                        .select('practiceQuestions.codingQuestion')
                        .populate({
                            path: 'practiceQuestions.codingQuestion'
                        });
    if(!course){
        res.status(500).json({message:"Try Again"});
        return;
    }
    course = course.toObject();
    for (let x of course['practiceQuestions']['codingQuestion']) {
        delete x.testcases;
        // read the files to get the codes to fill in IDE     
        x.header = await extractContent(x.header);
        x.footer = await extractContent(x.footer);
        x.mainCode = await extractContent(x.mainCode);
    }
    res.status(200).json(course['practiceQuestions']['codingQuestion']);
}

exports.submitMCQ = async (req, res, next) => {
    console.log("SUBMITTING");
    const questionId = req.body.questionId;
    const response = req.body.answer;
    const isCorrect = req.isCorrect;
    const d = new Date().toLocaleString('en-In');
    const userRecordId = req.userRecordId;
    
    const userRecord = await UserPracticeRecord.findById(userRecordId);
    if(!userRecord){
        res.status(500).json({message:"Try Again"});
        return;
    }
    console.log(userRecord);
    userRecord.score += 3;
    userRecord['questions']['mcq'].push({
        question: questionId,
        response:response,
        isCorrect:isCorrect,
        date:d
    })
    
    const result = await userRecord.save();
    if(!result){
        res.status(500).json({message:"Try Again"});
    } else {
        res.status(200).json({message:"Correct Answer, 3 points added."});
    }
    
}

exports.submitTrueFalse = async (req, res, next) => {
    console.log("SUBMITTING");
    const questionId = req.body.questionId;
    const response = req.body.answer;
    const isCorrect = req.isCorrect;
    const d = new Date().toLocaleString('en-In');
    const userRecordId = req.userRecordId;
    
    const userRecord = await UserPracticeRecord.findById(userRecordId);
    if(!userRecord){
        res.status(500).json({message:"Try Again"});
        return;
    }
    userRecord.score += 1;
    userRecord['questions']['trueFalse'].push({
        question: questionId,
        response:response,
        isCorrect:isCorrect,
        date:d
    })
    
    const result = await userRecord.save();
    if(!result){
        res.status(500).json({message:"Try Again"});
    } else {
        res.status(200).json({message:"Correct Answer, 1 points added."});
    }
    
}

getEntries = async (courseRecords) => {
    let entries = [];
    for (const practiceRecord of courseRecords['practiceRecord']) {
        const userPracticeRecord = await UserPracticeRecord.findById(practiceRecord);
        const score = userPracticeRecord['score'];
        const userId = userPracticeRecord['userId'];
        const userRecord = await User.findById(userId);
        const userName = userRecord['name'];
        entries.push({'name': userName, 'score': score});
        // console.log(`name: ${userName} score: ${score}`);
    }
    return entries;
}

exports.getLeaderboard = async (req, res, next) => {
    // console.log("Getting leaderboard");
    const courseId = req.courseId;

    // find all practice records for this course
    const courseRecords = await Course.findById(courseId).select('practiceRecord');
    
    let entries = await getEntries(courseRecords);
    
    if (entries.length == 0) {
        res.status(500).json({message: "No entries in leaderboard"});
    } else {
        res.status(200).json({message: entries});
    }
}