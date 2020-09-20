const MCQ = require('../../models/questions/mcq');
const TrueFalse = require('../../models/questions/truefalsequestion');
const CodingQuestion = require('../../models/questions/coding-question');
const path = require('path');
const fs = require('fs');
const fields = "stdout,time,memory,compile_output,stderr,token,message,status";
const runner = require('../../controllers/ide/runner');
const RequestHandler = require("../../util/judge0-request-handler/request-handler");
const { response } = require('express');

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

async function run_parallel(languageId , data, inputs){
    let resp = [];
    for(let casenum in inputs){
        data.input = encode(inputs[casenum]);
        resp[casenum] = runner.runTestCase(languageId, data);
    }
    for(let casenum in inputs){
        await Promise.resolve(resp[casenum]).then(function(resp_sing){
            resp[casenum] = resp_sing; 
        });
    }
    return resp;
}

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
            return;
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
        const langId = req.body.langId;
        const langVersion = req.body.langVersion;
        let submitCode = req.body.submitCode;
        const headerPresent = req.body.headerExists;
        // if language is C++, remove all lines starting with # and header exists, remove lines
        // starting with # so as to disable all external library includes

        if (langId == "cpp14" && headerPresent) {
            // remove libary includes in the main code
            let lines = submitCode.split('\n');
            let count = 0;
            let resCode = "";
            // skip initial include files
            for (let i = 0; i < lines.length; ++i) {
                if (lines[i][0] == '#') {
                    resCode += (lines[i] + '\n');
                    continue;
                } else {
                    count = i;
                    break;
                }
            }
            // remove additional include files
            let remainingLines = lines.splice(count);
            let badCode = false;
            let filtered = remainingLines.filter( (line) => {
                for (let i = 0; i < line.length; ++i) {
                    if (line[i] != ' ' && line[i] != '#') { // any other char in beginning
                        return true;
                    } else if (line[i] == '#') {
                        if (line[i + 1] == 'i') { // #include
                            badCode = true;
                            return false;
                        }
                        return true;
                    }
                }
            })
            resCode += filtered.join('\n');
            // console.log(resCode);
            if (badCode) {
                res.status(500).json({message:"NOT ALLOWED WITH OTHER HEADER FILES INCLUDED!"});
                return;
            }
        }

        // fetch the question
        const question = await CodingQuestion.findById(questionId);

        // need to fetch the test cases folder (already extracted when added question)
        const testcases = question.testcases;
        const serverPath = path.join(__dirname, "..", "..");
        // ASSUMING THAT THE FOLDER NAMES testCases WAS ZIPPED
        const testPath = path.join(serverPath, testcases, "testCases");

        let inputs = [];
        let outputs = [];
        try {
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
            //console.log("started",Date.now())
            let runner_resp = await run_parallel(languageId , data, inputs)
            //console.log("done",Date.now())
            for (let caseNumber in outputs) {
                //const input = inputs[caseNumber];
                const output = outputs[caseNumber];
                // update the input for the request
                //data.input = encode(input);
                //console.log("before starting",Date.now())
                //let response = await runner.runTestCase(languageId, data);
                //console.log("after starting",Date.now())
                let response = runner_resp[caseNumber];
                let actualOutput = decode(response.stdout);
                // console.log(`Input: ${input}, Expected Output: ${output}, Actual Output: ${actualOutput}`);

                if (response.status.id == 5) {
                    req.verdict = `TLE on Test Case ${caseId}`;
                    res.status(500).json({message: req.verdict});
                    return;
                } else if (response.status.id == 6) {
                    req.verdict = `Compilation Error on Test Case ${caseId}`;
                    res.status(500).json({message: req.verdict});
                    return;
                } else if (response.status.id >= 7 && response.status.id <= 12) {
                    req.verdict = `Runtime Error on Test Case ${caseId}`;
                    res.status(500).json({message: req.verdict});
                    return;
                } else if (response.status.id >= 13) {
                    req.verdict = `Internal Error on Test Case ${caseId}`;
                    res.status(500).json({message: req.verdict});
                    return;
                }

                let check = await compareOutputs(actualOutput, output);
                if (check == false) {
                    req.verdict = `Wrong Answer on Test Case ${caseId}`;
                    res.status(500).json({message: req.verdict});
                    return;
                } else {
                    ++passed;
                }
                ++caseId;
            }
            if (passed == caseId) {
                // all test cases passed
                req.verdict = "ACCEPTED!";
                req.isCorrect = true;
                // res.status(500).json({message: req.verdict});
                // res.status(200).json({message:"ACCEPTED!"});
                // return;
                next();
            }
        } catch (err) {
            res.status(500).json({message: "There is some bug at our side!"});
        }
    }
}

compareOutputs = async (actual, expected) => {
    // remove line breaks: https://www.textfixer.com/tutorials/javascript-line-breaks.php
    // replace line breaks with space and trim at the end
    actual = actual.replace(/(\r\n|\n|\r)/gm," ").trim();
    expected = expected.replace(/(\r\n|\n|\r)/gm," ").trim();
    // console.log(actual);
    // console.log(expected);
    return actual == expected;
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