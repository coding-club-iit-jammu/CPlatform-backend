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
    let solvedQuestions = [];
    if(req.solvedQuestions){
        solvedQuestions = req.solvedQuestions.map(String);
    }
    let course = await Course.findById(courseId)
                        .select('practiceQuestions.mcq')
                        .populate({
                            path: 'practiceQuestions.mcq',
                            model:'MCQ'
                        });
    if(!course){
        res.status(500).json({message:"Try Again"});
        return;
    }
    course = course.toObject();
    for(let x of course['practiceQuestions']['mcq']){
        x.isSolved = solvedQuestions.includes(x['_id'].toString()); 

        for(let y of x['options']){
            delete y.isCorrect;
            y['response'] = false;
        }
    }
    res.status(200).json(course['practiceQuestions']['mcq']);
}

const matchQuestions = (solvedQuestions,questionId) => {
    for(let x of solvedQuestions){
        if(x.toString()==questionId.toString()){
            return true;
        }
    }
    return false;
}

exports.getTrueFalse = async (req,res,next)=>{
    const courseId = req.courseId;
    let solvedQuestions = [];
    if(req.solvedQuestions){
        solvedQuestions = req.solvedQuestions.map(String);
    }
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
        x.isSolved = matchQuestions(solvedQuestions,x['_id']);
        delete x.answer;
        x['response'] = "";
    }
    res.status(200).json(course['practiceQuestions']['trueFalse']);
}

extractContent = async (fileName) => {
    let serverPath = path.join(__dirname, '..'); // one directory back
    let filepath = path.join(serverPath, fileName);
    // console.log(filepath);
    return fs.readFileSync(filepath, 'utf-8');
}

exports.getCodingQuestion = async (req,res,next)=>{
    const courseId = req.courseId;
    let solvedQuestions = [];
    if(req.solvedQuestions){
        solvedQuestions = req.solvedQuestions.map(String);
    }
    
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
        x.isSolved = matchQuestions(solvedQuestions,x['_id']);
        delete x.testcases;
        // read the files to get the codes to fill in IDE     
        x.header = await extractContent(x.header);
        x.footer = await extractContent(x.footer);
        x.mainCode = await extractContent(x.mainCode);
    }
    res.status(200).json(course['practiceQuestions']['codingQuestion']);
}

exports.submitMCQ = async (req, res, next) => {
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

exports.submitCodingQuestion = async (req, res, next) => {
    console.log("SUBMITTING");
    const questionId = req.body.questionId;
    // fetch code
    const response = req.body.submitCode;

    // fetch the verdict: WA, AC, RE, TLE, Compilation Error
    // handled in is-answer-correct middleware
    const verdict = req.verdict;
    const date = new Date();
    const userRecordId = req.userRecordId;
    
    const userRecord = await UserPracticeRecord.findById(userRecordId);
    if(!userRecord){
        res.status(500).json({message:"Try Again"});
        return;
    }
    userRecord.score += 5;
    userRecord['questions']['codingQuestion'].push({
        question: questionId,
        response:response,
        isCorrect:true,
        date:date
    })
    
    const result = await userRecord.save();
    if(!result){
        res.status(500).json({message:"Try Again"});
    } else {
        res.status(200).json({message:"Correct Answer, 5 points added."});
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