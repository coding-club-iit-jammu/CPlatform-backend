const Course = require('../models/course');

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
        }
        x['response'] = "";
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

exports.getCodingQuestion = async (req,res,next)=>{
    const courseId = req.courseId;
    const solvedQuestions = req.solvedQuestions;
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