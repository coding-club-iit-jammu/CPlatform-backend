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

exports.getMCQ = async (req,res,next)=>{
    const courseId = req.courseId;
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
        for(let y of x['options']){
            delete y.isCorrect;
        }
    }
    res.status(200).json(course['practiceQuestions']['mcq']);
}

exports.getTrueFalse = async (req,res,next)=>{
    const courseId = req.courseId;
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
        delete x.answer;
    }
    res.status(200).json(course['practiceQuestions']['trueFalse']);
}

exports.getCodingQuestion = async (req,res,next)=>{
    const courseId = req.courseId;
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
    res.status(200).json(course['practiceQuestions']['codingQuestion']);
}