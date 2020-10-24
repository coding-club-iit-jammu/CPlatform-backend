const Course = require('../models/course');
const User = require('../models/user');
const UserPracticeRecord = require('../models/practice-record-user');
const MCQ = require('../models/questions/mcq');
const TrueFalse = require('../models/questions/truefalsequestion');
const CodingQuestion = require('../models/questions/coding-question');

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

    if(questionType == 'mcq'){
        const mcq = await MCQ.findById(questionId).select('used');
        if(mcq){
            mcq.used = true;
            await mcq.save();
            return;
        }
    }

    if(questionType == 'trueFalse'){
        const mcq = await TrueFalse.findById(questionId).select('used');
        if(mcq){
            mcq.used = true;
            await mcq.save();
            return;
        }
    }

    if(questionType == 'codingQuestion'){
        const mcq = await CodingQuestion.findById(questionId).select('used');
        if(mcq){
            mcq.used = true;
            await mcq.save();
            return;
        }
    }

}

exports.getMCQ = async (req,res,next)=>{
    const courseId = req.courseId;
    let solvedQuestions = [];
    if(req.solvedQuestions){
        solvedQuestions = req.solvedQuestions.map(String);
    }
    let course = await Course.findById(courseId)
                        .select('practiceQuestions.mcq title')
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
    let data = {
        role : req.role,
        title : course.title,
        mcq : course['practiceQuestions']['mcq']
    }
    res.status(200).json(data);
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
                        .select('practiceQuestions.trueFalse title')
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
    let data = {
        role : req.role,
        title : course.title,
        trueFalse : course['practiceQuestions']['trueFalse']
    }
    res.status(200).json(data);
}

extractContent = async (fileName) => {
    if (fileName == null) {
        return "";
    }
    let serverPath = path.join(__dirname, '..'); // one directory back
    let filepath = path.join(serverPath, fileName);
    try {
        return fs.readFileSync(filepath, 'utf-8');
    } catch (err) {
        return "";
    }
}

exports.getCodingQuestion = async (req,res,next)=>{
    const courseId = req.courseId;
    let solvedQuestions = [];
    if(req.solvedQuestions){
        solvedQuestions = req.solvedQuestions.map(String);
    }
    
    let course = await Course.findById(courseId)
                        .select('practiceQuestions.codingQuestion title')
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
        if (x.header) x.header = await extractContent(x.header);
        if (x.footer) x.footer = await extractContent(x.footer);
        if (x.mainCode) x.mainCode = await extractContent(x.mainCode);
    }
    let data = {
        role : req.role,
        title : course.title,
        codingQuestion : course['practiceQuestions']['codingQuestion']
    }
    res.status(200).json(data);
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
    const courseId = req.courseId;
    const courseRecords = await Course.findById(courseId).select('practiceRecord')
                                .populate({
                                    path:'practiceRecord',
                                    model:'UserPracticeRecord',
                                    select:'score userId',
                                    populate:{
                                        path:'userId',
                                        model:'User',
                                        select:'name'
                                    }
                                });
    
    let entries = [];
    let userEntry = {};
    for(let x of courseRecords['practiceRecord']){
        
        entries.push({
            name:x['userId']['name'],
            score:x['score'],
            id:x['userId']['_id'].toString()
        });
    }                        
    entries.sort((a,b)=>{
        return b.score-a.score;
    })


    if (entries[0]) 
        entries[0]['rank'] = 1;
    for (var i = 1; i < entries.length; i++) {
        if (entries[i].score === entries[i-1].score) {
            entries[i].rank = entries[i-1].rank;
        } else {
            entries[i].rank = i + 1;
        }
    }

    for(let x of entries){
        if(x.id == req.userId){
            userEntry = x;
            break;
        }
    }

    if (entries.length == 0) {
        res.status(500).json({message: "No entries in leaderboard"});
    } else {
        res.status(200).json({message: entries,userEntry:userEntry});
    }
}

exports.getPrevsubmission = async(req,res,next) => {   
    
    // const submittinguserId = req.userId;
    
    // const userRecord = await UserPracticeRecord.find({userId:submittinguserId});
    // if(!userRecord){
    //     res.status(500).json({message:"Try Again"});
    //     return;
    // }
    // else
    // {
    //     res.json({
    //         status: 200,
    //         data: userRecord
    //     })
    // }
    
  
    const questionId = req.query.questionId;
    // fetch code
  

    // fetch the verdict: WA, AC, RE, TLE, Compilation Error
    // handled in is-answer-correct middleware
    
    
    const userRecordId = req.userRecordId;
    
    const userRecord = await UserPracticeRecord.findById(userRecordId);
    if(!userRecord){
        res.status(500).json({message:"Try Again"});
        
    } 
    else {
        console.log(userRecord)
        res.status(200).json({data: userRecord})
    }
    
}