const Course = require('../models/course');
const Test = require('../models/test');

const TestQuestionCoding = require('../models/questions/test-questions/test-question-coding');
const TestQuestionTrueFalse = require('../models/questions/test-questions/test-question-truefalse');
const TestQuestionMCQ = require('../models/questions/test-questions/test-question-mcq');

exports.getTestsTitles = async (req,res,next)=>{
    const courseId = req.courseId;
    const course = await Course.findById(courseId).select('tests _id').populate('tests',"_id testId title instructions");
    if(!course){
        res.json(500).json({message:'Try Again'});
        return;
    }
    res.status(200).json(course);
}


exports.createTest = async (req,res,next)=>{
    const courseId = req.courseId;
    const title = req.body.title;
    const instructions = req.body.instructions;

    let testId = req.body.courseCode + "T";

    let course = await Course.findById(courseId).select('tests groups.groupId');
    if(!course){
        res.status(500).json({message:"Try Again"})
        return;
    }
    let l = course['tests'].length + 1;
    testId+= l;


    const test = new Test({
        testId: testId,
        title: title,
        instructions: instructions,
        groups:course['groups']
    })

    const result = await test.save();
    if(!result){
        res.status(500).json({message:"Try Again"})
        return;
    }

    const rt = await course.addTest(result._id);
    if(!rt){
        res.status(500).json({message:"Try Again"})
        return;
    }

    res.status(201).json({message:"Test Created"});
}

exports.addQuestion = async (req, res, next)=>{
    const testId = req.body.testId;
    const questionId = req.body.questionId;
    const questionType = req.body.questionType;

    const test = await Test.findById(testId);
    if(!test){
        res.status(500).json({message:"Try Again"});
        return;
    }
    
    test['questions'][questionType].push({
        question: questionId,
        marks: 0   
    });
    const result = await test.save();
    if(!result){
        res.status(500).json({message:"Try Again"});
        return;
    }

    res.status(200).json({message:`Question Added to Test ${test.title}`});
    return;
}

exports.getTestData = async (req,res,next) => {
    const testCode = req.query.testId;

    const test = await Test.findOne({testId:testCode}).select('-records')
                            .populate(
                            [{
                                path: 'questions.mcq.question',
                                model:'MCQ',
                                select:'question'
                            },
                            {
                                path: 'questions.trueFalse.question',
                                select:'question',
                                model:'TrueFalseQuestion'
                            }
                            ,{
                                path: 'questions.codingQuestion.question',
                                select:'title',
                                model:'CodingQuestion'
                            }]
                            );
    if(!test){
        res.status(500).json({message:"Try Again"});
        return;
    }
    res.status(200).json(test);

}