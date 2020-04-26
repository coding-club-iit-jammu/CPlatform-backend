const MCQ = require('../../models/questions/mcq');
const Course = require('../../models/course');
const MCQOption = require('../../models/questions/mcq-option');

//POST mcq/add
exports.addMCQ = async (req,res,next) => {
    const question = req.body.question;
    const options = req.body.options;
    const courseId = req.courseId;

    const mcq_question = new MCQ({
        question: question
    });

    const mcq = await mcq_question.save();
    if(!mcq){
        res.status(500).json({message:'Couldn\'t save MCQ'});
        console.log('Couldn\'t save MCQ')
        return;
    }
    let mcqResult = await mcq.addOptions(options);
    console.log(mcqResult);
    if(!mcqResult){
        console.log('Couldn\'t add Options');
        return;
    }
    Course.findById(courseId).then((course)=>{
        if(!course){
            res.status(500).json({message:'Couldn\'t find Course'});
            return;
        }
        return course.addMCQ(mcq._id);
    }).then((cour)=>{
        if(!cour){
            res.status(400).json({message:'Unable to save MCQ'});
            return;
        }
        res.status(201).json({message:'Saved MCQ'});
    })
}

exports.getMCQ = (req,res,next)=>{
    const courseId = req.courseId;
    
    Course.findById(courseId).select('questions').populate({
        path: 'questions.mcq',
        populate:{
            path:'options'
        }
    }).then((course)=>{
        if(!course){
            res.status(500).json({message:"Unable to get True False Questions."})
            return;
        }
        res.status(200).json(course);
    })
}

exports.editMCQ = (req,res,next) => {
    const id = req.body.mcqId;
    const question = req.body.question;
    const options = req.body.options;
}