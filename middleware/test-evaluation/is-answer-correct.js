const MCQ = require('../../models/questions/mcq');
const TrueFalse = require('../../models/questions/truefalsequestion');
const CodingQuestion = require('../../models/questions/coding-question');
const path = require('path');
const fs = require('fs');
const fields = "stdout,time,memory,compile_output,stderr,token,message,status";
const runner = require('../../controllers/ide/runner');
const RequestHandler = require("../../util/judge0-request-handler/request-handler");

const universalBtoa = str => {
    try {
      return btoa(str);
    } catch (err) {
      return Buffer.from(str).toString('base64');
    }
};
  
const universalAtob = b64Encoded => {
    try {
      return atob(b64Encoded);
    } catch (err) {
      return Buffer.from(b64Encoded, 'base64').toString();
    }
};
  
// Reference: https://github.com/judge0/ide/blob/master/js/ide.js
function encode(str) {
    return universalBtoa(unescape(encodeURIComponent(str || "")));
  }
  
function decode(bytes) {
    var escaped = escape(universalAtob(bytes || ""));
    try {
        return decodeURIComponent(escaped);
    } catch {
        return unescape(escaped);
    }
}

module.exports = async (req,res,next)=>{
    const questionId = req.body.questionId;
    const questionType = req.body.questionType;
    if(questionType == 'mcq'){
        const resAnswer = req.body.answer;
        const question = await MCQ.findById(questionId);
        if(!question){
            console.log('Question not found.');
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
        console.log(`Question MCQ, Answer=${answer}, My answer=${resAnswer}`);
        if(answer == resAnswer){
            req.isCorrect = true;
        } else {
            req.isCorrect = false;
        }
        next();
        return;
    } else if(questionType == 'trueFalse'){
        const resAnswer = req.body.answer;
        const question = await TrueFalse.findById(questionId);
        if(!question){
            console.log('Question not found TF.');
            res.status(500).json({message:"Try Again."});
            return;
        }
        console.log(`Question TrueFalse, Answer=${question.answer}, My answer=${resAnswer}`);
        if(resAnswer == question.answer){
            req.isCorrect = true;
        } else {
            req.isCorrect = false;
        }
        next();
        return;
    } else if (questionType == 'codingQuestion') {
        const langId = req.body.langId;
        const langVersion = req.body.langVersion;
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
        let data = {
            lang : langId,
            version : langVersion,
            program : encode(submitCode),
            fields : fields,
            input : ""
        }

        // validate the request data
        if (!runner.validatePostRun(data)) {
            res.status(500).json({message:"Invalid body parameters"});
            return;
        }

        // get language id
        let languageId = runner.getLangId(langId, langVersion);
        
        let caseId = 0;
        let passed = 0;
        for (let caseNumber in inputs) {
            const input = inputs[caseNumber];
            const output = outputs[caseNumber];
            // update the input for the request
            data.input = encode(input);
            let response = await runner.runTestCase(languageId, data);
            let actualOutput = decode(response.stdout);
            console.log(`Input: ${input}, Expected Output: ${output}, Actual Output: ${actualOutput}`);

            if (response.status.id == 5) {
                req.verdict = `TLE on Test Case ${caseId}`;
                // res.status(500).json({message: req.verdict});
                next();
                return;
            } else if (response.status.id == 6) {
                req.verdict = `Compilation Error on Test Case ${caseId}`;
                // res.status(500).json({message: req.verdict});
                next();
                return;
            } else if (response.status.id >= 7 && response.status.id <= 12) {
                req.verdict = `Runtime Error on Test Case ${caseId}`;
                // res.status(500).json({message: req.verdict});
                next();
                return;
            } else if (response.status.id >= 13) {
                req.verdict = `Internal Error on Test Case ${caseId}`;
                // res.status(500).json({message: req.verdict});
                next();
                return;
            }

            let check = await compareOutputs(output, actualOutput);
            if (check == false) {
                req.verdict = `Wrong Answer on Test Case ${caseId}`;
                // res.status(500).json({message: req.verdict});
                next();
                return;
            } else {
                ++passed;
            }
            ++caseId;
        }

        if (passed == caseId) {
            // all test cases passed
            req.verdict = "ACCEPTED!";
            // res.status(500).json({message: req.verdict});
            // res.status(200).json({message:"ACCEPTED!"});
            // return;
            req.isCorrect = true;
            next();
        }
    }
}

compareOutputs = async (actual, expected) => {
    return actual.trim() == expected.trim();
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