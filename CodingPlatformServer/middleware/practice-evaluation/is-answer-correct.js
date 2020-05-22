const MCQ = require('../../models/questions/mcq');
const TrueFalse = require('../../models/questions/truefalsequestion');
const CodingQuestion = require('../../models/questions/coding-question');
const path = require('path');
const fs = require('fs');

module.exports = async (req,res,next)=>{
    const questionId = req.body.questionId;
    const questionType = req.body.questionType;
    if(questionType == 'mcq'){
        const resAnswer = req.body.answer;
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
        const resAnswer = req.body.answer;
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
    } else if (questionType == 'codingQuestion') {
        const submitCode = req.body.submitCode;
        // fetch the question
        const question = await CodingQuestion.findById(questionId);

        // need to fetch the test cases folder (already extracted when added question)
        const testcases = question.testcases;
        const serverPath = path.join(__dirname, "..", "..");
        // ASSUMING THAT THE FOLDER NAMES testCases WAS ZIPPED
        const testPath = path.join(serverPath, testcases, "testCases");

        let inputs = [];
        let outputs = [];
        let files = fs.readdirSync(testPath);
        await extractCases(files, testPath, inputs, outputs);

        // for each test case
        // need to use post-code API from ide/runner
        // decode and trim the stdout and validate with the expected output
        for (let caseNumber in inputs) {
            const input = inputs[caseNumber];
            const output = outputs[caseNumber];
            console.log(input);
            console.log(output);
        }
    }
}

extractCases = async (files, testPath, inputs, outputs) => {
    for (let file of files) {
        let content = fs.readFileSync(path.join(testPath, file), {encoding: 'utf8'});
        if (file[0] == 'i') { // input file
            inputs[file.substr(2, 2)] = content;
        } else if (file[0] == 'o') { // output file
            outputs[file.substr(3, 2)] = content;
        }
    }
}