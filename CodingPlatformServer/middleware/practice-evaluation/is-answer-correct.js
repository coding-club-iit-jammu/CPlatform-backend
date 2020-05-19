const MCQ = require('../../models/questions/mcq');
const TrueFalse = require('../../models/questions/truefalsequestion');
const CodingQuestion = require('../../models/questions/coding-question');

module.exports = async (req,res,next)=>{
    const questionId = req.body.questionId;
    const questionType = req.body.questionType;
    const resAnswer = req.body.answer;
    if(questionType == 'mcq'){
        const question = await MCQ.findById(questionId);
        if(!question){
            res.status(500).json({message:"Try Again."});
            return;
        }
        let answer = [];
        for(let x of question['options']){
            if(x.isCorrect){
                answer.push(x.code);
            }
        }

        answer = (answer.sort()).toString();
        if(answer == resAnswer){
            console.log("answer is correct");
            req.isCorrect = true;
        } else {
            req.isCorrect = false;
            console.log("Wrong answer");
            res.status(200).json({message:"Wrong Answer"});
        }
        next();
    } else if(questionType == 'trueFalse'){
        const question = await TrueFalse.findById(questionId);
        if(!question){
            res.status(500).json({message:"Try Again."});
            return;
        }
        if(resAnswer == question.answer.toString()){
            req.isCorrect = true;
            next();
        } else {
            console.log("Wrong Answer");
            req.isCorrect = false;
            res.status(200).json({message:"Wrong Answer."});
            return;
        }
    }
}