const Course = require('../models/course');

exports.addPracticeQuestion = async (req,res,next)=>{
    const courseId = req.courseId;
    const questionType = req.body.questionType;
    const questionId = req.body.questionId;

    const course = await Course.findById(courseId).select('practiceQuestions');
    if(!course){
        res.status(500).json({message:"Try Again"});
        return;
    }

    const result = await course.addQuestionToPractice(questionId,questionType);
    if(!result){
        res.status(500).json({message:"Try Again"});
        return;
    }

    res.status(200).json({message:"Question added to Practice"});
}