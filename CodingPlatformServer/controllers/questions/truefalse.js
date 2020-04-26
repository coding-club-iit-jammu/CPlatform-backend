const TrueFalseQuestion = require('../../models/questions/truefalsequestion');
const Course = require('../../models/course');

exports.addTrueFalse = async (req,res,next) => {
    const question = req.body.question;
    const answer = req.body.answer;
    const courseId = req.courseId;

    const truefalse = new TrueFalseQuestion({
        question : question,
        answer: answer
    })

    const tf = await truefalse.save();
    if(!tf){
        res.status(500).json({message:"Try Again."});
        return;
    }

    const course = await Course.findById(courseId);

    if(!course){
        res.status(400).json({message:"Unable to get access to course."});
        return;
    }

    const result = await course.addTrueFalse(tf._id);
    
    if(!result){
        res.status(500).json({message:"Try Again."});
        return;
    }

    res.status(201).json({message:"True False Question Added."});
} 

exports.getTrueFalse = async (req, res, next) => {
    const courseId = req.courseId;

    const course = await Course.findById(courseId)
                        .select('questions.trueFalse')
                        .populate({
                            path:'questions.trueFalse'
                        });
    if(!course){
        res.status(500).json({message:"Unable to get True False Questions."})
        return;
    }
    console.log(course);
    res.status(200).json(course);
}