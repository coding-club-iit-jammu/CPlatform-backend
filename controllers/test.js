const mongoose = require('mongoose');
const Course = require('../models/course');
const Test = require('../models/test');
const UserTestRecord = require('../models/user-test-record');
const User = require('../models/user');
const MCQ = require('../models/questions/mcq');
const TrueFalse = require('../models/questions/truefalsequestion');
const CodingQuestion = require('../models/questions/coding-question');
const fs = require('fs');
const path = require('path');

exports.getTestsTitles = async (req,res,next)=>{
    const courseId = req.courseId;
    const course = await Course.findById(courseId).select('tests _id').populate('tests',"_id testId title instructions startTest revealMarks groups.groupId groups.startTime groups.endTime");
    if(!course){
        res.json(500).json({message:'Try Again'});
        return;
    }
    let data = course.toObject();
    data['groupId'] = req.groupId;
    res.status(200).json(data);
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
        groups:course['groups'],
        records:[],
        startTest:false,
        revealMarks:false,
        stats:{
            minMarks:{
                marks:0,
                students:[]
            },
            maxMarks:{
                marks:0,
                students:[]
            },
            avgMarks:0
        }
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
    if(test.startTest){
        res.status(200).json({message:"Can\'t question to this test."});
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

    if(questionType == 'mcq'){
        const mcq = await MCQ.findById(questionId).select('used');
        if(mcq){
            mcq.used = true;
            await mcq.save();
            return;
        }
    }

    if(questionType == 'trueFalse'){
        const trueFalse = await TrueFalse.findById(questionId).select('used');
        if(trueFalse){
            trueFalse.used = true;
            await trueFalse.save();
            return;
        }
    }

    if(questionType == 'codingQuestion'){
        const codingQuestion = await CodingQuestion.findById(questionId).select('used');
        if(codingQuestion){
            codingQuestion.used = true;
            await codingQuestion.save();
            return;
        }
    }
    return;
}

exports.getTestData = async (req,res,next) => {
    const testCode = req.query.testId;

    const test = await Test.findOne({testId:testCode}).select('-records')
                            .populate(
                            [{
                                path: 'questions.mcq.question',
                                model:'MCQ',
                                select:'question _id'
                            },
                            {
                                path: 'questions.trueFalse.question',
                                select:'question _id',
                                model:'TrueFalseQuestion'
                            }
                            ,{
                                path: 'questions.codingQuestion.question',
                                select:'title _id',
                                model:'CodingQuestion'
                            },
                            {
                                path:'stats.minMarks.students',
                                select:'name',
                                model:'User'
                            },
                            {
                                path:'stats.maxMarks.students',
                                select:'name',
                                model:'User'
                            }]
                            );
    if(!test){
        res.status(500).json({message:"Try Again"});
        return;
    }
    res.status(200).json(test);

}

exports.saveTestData = async (req,res,next)=>{
    const _id = req.body._id;
    const testData = req.body;
    const test = await Test.findById(_id);

    if(!test){
        res.status(500).json({message:"Try Again."});
        return;
    }

    test.title = testData['title'];
    test.instructions = testData['instructions'];

    
    
    for(let x of testData['groups']){
        
        let d1 = new Date(x['startTime'].slice(0,10)+" "+x['startTime'].slice(11));
        let d2 = new Date(x['endTime'].slice(0,10)+" "+x['endTime'].slice(11));
        
        if(!test.startTest){
            x['startTime'] = new Date(d1);
        }
        x['endTime'] = new Date(d2);
        
    }

    test.groups = testData['groups'];
    
    let mcq = [];
    let testMarks = 0;
    for(let x of testData['mcq']){
        testMarks += x['marks'];
        mcq.push({
            question:x['question'],
            marks:x['marks']
        });
    }

    let trueFalse = [];
    for(let x of testData['trueFalse']){
        testMarks += x['marks'];
        trueFalse.push({
            question:x['question'],
            marks:x['marks']
        });
    }

    let codingQuestion = [];
    for(let x of testData['codingQuestion']){
        testMarks += x['marks'];
        codingQuestion.push({
            question:x['question'],
            marks:x['marks']
        });
    }

    if(!test.startTest){
        test.questions.mcq = mcq;
        test.questions.trueFalse = trueFalse;
        test.questions.codingQuestion = codingQuestion;
        test.marks = testMarks;
    }
    const result = await test.save();

    if(!result){
        res.status(500).json({message:"Couldn't save."})
        return;
    }

    res.status(200).json({message:"Saved."})
}

exports.startTest = async (req,res,next)=>{
    const _id = req.body._id;

    const test = await Test.findById(_id).select('startTest');
    if(!test){
        res.status(500).json({message:"Couldn't start test."})
        return;
    }

    test.startTest = true;

    const result = await test.save();
    if(!result){
        res.status(500).json({message:"Couldn't save."})
        return;
    }
    res.status(200).json({message:"Test Started."});
}

exports.joinTest = async (req,res,next) => {
    
    const testId = req.body.testId;
    const userId = req.userId;
    const courseId = req.courseId;

    const test = req.test;
    
    if(!test.startTest){
        res.status(500).json({message:"Contact instructor to start the test."})
        return;
    }


    let mcqs = test['questions']['mcq'];
    for(let x of mcqs){
        x['response'] = '';
        x['securedMarks'] = 0;
    }
    let trueFalses = test['questions']['trueFalse'];
    for(let x of trueFalses){
        x['response'] = '';
        x['securedMarks'] = 0;
    }
    let codingQuestions = test['questions']['codingQuestion'];
    for(let x of codingQuestions){
        x['response'] = '';
        x['securedMarks'] = 0;
    }
    const userTestRecord = new UserTestRecord({
        userId:userId,
        testId:test._id,
        mcq:{
            submitted:false,
            problems:mcqs
        },
        trueFalse:{
            submitted:false,
            problems:trueFalses
        },
        codingQuestion:{
            submitted:false,
            problems:codingQuestions
        }

    });

    const result = await userTestRecord.save();
    if(!result){
        res.status(500).json({message:"User Test Record not created."})
        return;
    }
    test['records'].push(result._id);
    const resutl1 = await test.save();
    if(!resutl1){
        res.status(500).json({message:"User Test Record not created."})
        return;
    }
    const user = await User.findById(userId);
    if(!user){
        res.status(500).json({message:"Failed."})
        return;
    }

    let findCourse = (user['courses']['studying']).find(obj => obj.courseId.toString() == courseId);
    findCourse.tests.push({
        testId:test._id,
        record:result._id
    });
    
    const result2 = await user.save();
    if(!result2){
        console.log("User Test Record failed to be added to User.");
        res.status(500).json({message:"User Test Record not created."})
        return;
    }

    res.status(200).json({
        message:"Starting Test.",
        userTestRecord:result._id,
        test_id:test._id,
        endTime: req.endTime,
        instructions: test.instructions
    });

}

exports.endTest = async (req,res,next) => {
    const userTestRecordId = req.body.userTestRecordId;
    const userId = req.userId;

    const userTestRecord = await UserTestRecord.findById(userTestRecordId);   

    if(!userTestRecord){
        res.status(500).json({message:"Try Again"});
    }

    if(userTestRecord.userId.toString()!=userId){
        res.status(400).json({message:"Try Again"});
        return;
    }

    userTestRecord.ended = true;

    const result = await userTestRecord.save();
    if(!result){
        res.status(500).json({message:"Try Again"});
        return;
    }

    res.status(200).json({message:"Test Ended."});
}

exports.submitSection = async (req,res,next)=>{
    const userTestRecordId = req.body.userTestRecordId;
    const userId = req.userId;

    const userTestRecord = await UserTestRecord.findById(userTestRecordId);

    if(!userTestRecord){
        res.status(500).json({message:"Try Again"});
        return;
    }

    if(userTestRecord.userId.toString()!=userId){
        res.status(400).json({message:"Try Again"});
        return;
    }

    if(!userTestRecord.trueFalse.submitted){
        userTestRecord.trueFalse.submitted = true;

        const result = await userTestRecord.save();
        if(!result){
            res.status(500).json({message:"Try Again"});
            return;
        }
        res.status(200).json({message:"Section Submitted.",ended:false});
        return;
    }

    if(!userTestRecord.mcq.submitted){
        userTestRecord.mcq.submitted = true;
        const result = await userTestRecord.save();
        if(!result){
            res.status(500).json({message:"Try Again"});
            return;
        }
        res.status(200).json({message:"Section Submitted.",ended:false});
        return;
    }

    if(!userTestRecord.codingQuestion.submitted){
        userTestRecord.codingQuestion.submitted = true;
        const result = await userTestRecord.save();
        if(!result){
            res.status(500).json({message:"Try Again"});
            return;
        }
        // res.status(200).json({message:"Section Submitted.",ended:true});
        // return;
    }

    res.status(200).json({message:"Test Ended.",ended:true});

}

exports.submitQuestion = async (req,res,next) => {
    const isCorrect = req.isCorrect;
    const questionId = req.body.questionId;
    const questionType = req.body.questionType;
    const response = (questionType == "codingQuestion") ? req.body.submitCode: req.body.answer;
    const userTestRecordId = req.body.userTestRecordId;
    const userTestRecord = await UserTestRecord.findById(userTestRecordId).select(`${questionType} securedMarks`);
    let ques = userTestRecord[questionType]['problems'].find(obj=>obj.question.toString() == questionId); // question
    if(!ques){
        res.status(200).json({message:"Submission Unsuccessful, Try Again."});
        return;
    } 
    ques.response = response;
    
    if(userTestRecord[questionType]['submitted'] == true){
        res.status(200).json({message:'Section Already Submitted, Submission would\'t count.'})
        return;
    }

    if(isCorrect){
        userTestRecord.securedMarks += ques.marks - ques.securedMarks;
        ques.securedMarks = ques.marks;
    } else {
        userTestRecord.securedMarks -= ques.securedMarks;
        ques.securedMarks = 0;
    }
    ques.submitted = true;

    const result = await userTestRecord.save();
    if(!result){
        res.status(200).json({message:"Submission Unsuccessful, Try Again."});
        return;
    }
    // show verdict for coding questions in the test!
    let msg = (questionType == "codingQuestion") ? req.verdict : "Submission Successful";
    res.status(200).json({message: msg});
}

exports.getEndTime = async (req,res,next) => {
    const groupId = req.groupId;
    const test_Id = req.query.test_id;

    const test = await Test.findById(test_Id);

    if(!test){
        res.status(500).json({message:'Try Again'});
        return;
    }

    let grp = test['groups'].find(obj => obj.groupId == groupId);
    
    if(!grp){
        res.status(500).json({message:'Try Again'});
        return;
    }
    
    res.status(200).json({endTime: grp.endTime});

}

exports.getInstructions = async (req,res,next) => {
    const testId = req.query.testId;

    const test = await Test.findOne({testId:testId}).select('instructions');

    if(!test){
        res.status(500).json({message:'Try Again'});
        return;
    }
    res.status(200).json({instructions: test['instructions']});

}

// to read the code files for fetching header, footer and main code
extractContent = async (fileName) => {
    if (fileName == null) {
        return "";
    }
    let serverPath = path.join(__dirname, '..'); // one directory back
    let filepath = path.join(serverPath, fileName);
    try {
        return fs.readFileSync(filepath, 'utf-8');
    } catch (err) {
        return "";
    }
}
exports.getQuestions = async (req,res,next) => {
    const userTestRecordId = req.query.userTestRecordId;
    //Order->1.TrueFalse,2.MCQ,3.CodingQuestions
    const userId = req.userId;
    const groupId = req.groupId;

    

    const userTestRecord = await UserTestRecord.findById(userTestRecordId)
                            .select('-mcq.problems.securedMarks -trueFalse.problems.securedMarks -codingQuestion.problems.securedMarks')
                            .populate([{
                                path:'mcq.problems.question',
                                model:'MCQ',
                                select:'-options.isCorrect'
                            },{
                                path:'trueFalse.problems.question',
                                model:'TrueFalseQuestion',
                                select:'-answer'
                            },{
                                path:'codingQuestion.problems.question',
                                model:'CodingQuestion',
                                select:'-testcases'
                            }])
    
    if(!userTestRecord){
        res.status(500).json({message:"Try Again"});
        return;
    }

    if(userTestRecord.ended){
        res.status(200).json({message:"Test Already Ended.",ended:true});
    }

    if(userTestRecord.userId.toString()!=userId){
        res.status(400).json({message:"Try Again"});
        return;
    }

    if(!userTestRecord.trueFalse.submitted){
        // send true false questions
        let data = {
            questionType:'trueFalse',
            questions:[]
        };
        for(let x of userTestRecord.trueFalse.problems){
            data['questions'].push({
                question:x.question.question,
                questionId:x.question._id,
                response:x.response?x.response:false,
                marks:x.marks,
                visited:x.submitted,
                submitted:x.submitted
            })
        }
        if(data.questions.length == 0){
            userTestRecord.trueFalse.submitted = true;
        } else {
            res.status(200).json(data);
            return;
        }
    }

    if(!userTestRecord.mcq.submitted){
        // Send MCQ Questions
        let data = {
            questionType:'mcq',
            questions:[]
        };
        for(let x of userTestRecord.mcq.problems){
            
            let opts = [];
            let Options = x.question.options.toObject();
            for(let y of Options){
                y['response'] = false;
                opts.push(y);
            }
            
            let splitResponse = x.response.split(',');
            for(let i = 0; i<splitResponse.length;i++){
                if(splitResponse[i].trim()=='')
                    continue;
                opts[parseInt(splitResponse[i])-1].response = true; 
            }
            data['questions'].push({
                question:x.question.question,
                questionId:x.question._id,
                options:opts,
                response:x.response,
                marks:x.marks,
                visited:x.submitted,
                submitted:x.submitted
            })
        }
        if(data.questions.length == 0){
            userTestRecord.mcq.submitted = true;
        } else {
            res.status(200).json(data);
            return;
        }
    }

    if(!userTestRecord.codingQuestion.submitted){
        // Send Coding Questions
        let data = {
            questionType:'codingQuestion',
            questions:[]
        };

        for (let q of userTestRecord.codingQuestion.problems) {
        	
            data['questions'].push({
                title: q.question.title,
                questionId: q.question._id,
                description: q.question.description,
                sampleInput: q.question.sampleInput,
                sampleOutput: q.question.sampleOutput,
                headerCode: await extractContent(q.question.header),
                mainCode: await extractContent(q.question.mainCode),
                footerCode: await extractContent(q.question.footer),
                response: q.response,
                marks: q.marks,
                visited: q.submitted,
                submitted: q.submitted
            })
        }
        
        if(data.questions.length == 0){
            userTestRecord.codingQuestion.submitted = true;
        } else {
            res.status(200).json(data);
            return;
        }
    }

    res.status(200).json({message:"No Questions Left. You can end the test.",ended:true});
}

exports.revealMarks = async (req,res,next) => {
    const test_id = req.body._id;
    const test = await Test.findById(test_id).select('testId _id revealMarks records marks')
                        .populate({
                            path:'records',
                            model:'UserTestRecord',
                            select:'securedMarks userId'
                        });
    if(!test){
        res.status(500).json({message:"Try Again"});
        return;
    }

    if(test.revealMarks == true){
        res.status(200).json({message:"Marks already published."});
    }

    test.revealMarks = true;

    let maxMarks = 0, maxMarksStu = [];

    let minMarks = test.marks, minMarksStu = [];
    let avgMarks = 0.0;

    for(let x of test['records']){
        if(x.securedMarks > maxMarks){
            maxMarks = x.securedMarks;
            maxMarksStu = [x.userId];
        } else if(x.securedMarks == maxMarks){
            maxMarksStu.push(x.userId);
        }

        avgMarks+=x.securedMarks;

        if(x.securedMarks < minMarks){
            minMarks = x.securedMarks;
            minMarksStu = [x.userId];
        } else if(x.securedMarks == minMarks){
            minMarksStu.push(x.userId);
        }
    }

    avgMarks/=test['records'].length;

    test.stats = {
        "maxMarks":{
            marks: maxMarks,
            students:maxMarksStu
        },
        'minMarks':{
            marks: minMarks,
            students:minMarksStu
        },
        'avgMarks': avgMarks
    }


    const result = await test.save();
    
    if(!result){
        res.status(500).json({message:"Try Again"});
        return;
    }

    res.status(200).json({
        message:"Marks Published."
    });
}


exports.checkRevealMarks = async (req,res,next) => {
    const testId = req.query.testId;
    const test = await Test.findOne({testId:testId}).select('testId _id revealMarks');
    if(!test){
        res.status(500).json({message:"Try Again"});
        return;
    }

    res.status(200).json({
        test_id: test._id,
        revealMarks: test.revealMarks
    });
}

exports.getUserTestRecord = async (req,res,next) => {
    const test_id = req.query.test_id;
    const userId = mongoose.Types.ObjectId(req.userId);

    const test = await Test.findById(test_id).select('revealMarks stats records').populate({
        path:'records',
        model:'UserTestRecord',
        match:{
            userId:userId
        },
        populate:[{
            path:'mcq.problems.question',
            select:'question',
            model:'MCQ'
        },{
            path:'trueFalse.problems.question',
            select:'question',
            model:'TrueFalseQuestion'
        },{
            path:'codingQuestion.problems.question',
            select:'title',
            model:'CodingQuestion'
        }]
    });
    if(!test){
        res.status(500).json({message:"Try Again"});
        return;
    }

    let stats = {
        minMarks : test['stats']['minMarks']['marks'],
        maxMarks : test['stats']['maxMarks']['marks'],
        avgMarks : test['stats']['avgMarks']
    }

    if(test['records']){
        res.status(200).json({
            stats:stats,
            userTestRecord: test['records'][0]
        });
    } else {
        res.status(500);
    }

}

exports.getLeaderboard = async (req, res, next) => {
    const test_id = req.query.test_id;
    const testRecords = await Test.findById(test_id).select('records')
                                .populate({
                                    path:'records',
                                    model:'UserTestRecord',
                                    select:'securedMarks userId mcq trueFalse codingQuestion',
                                    populate:{
                                        path:'userId',
                                        model:'User',
                                        select:'name email'
                                    }
                                });
    
    let entries = [];
    let mcq = [];
    let trueFalse = [];
    let codingQuestion = [];
    let flag = false;
    for(let x of testRecords['records']){
        
        let data = {
            name:x['userId']['name'],
            email: x['userId']['email'],
            marks:x['securedMarks']
        };
        
        let counter = 1;
        if(x['mcq'] && x['mcq']['problems'].length >0){
            for(let q of x['mcq']['problems']){
                data[`M${counter}`] = q['securedMarks']
                if(!flag)
                    mcq.push(`M${counter}`);
                counter++;
            }
            counter = 1;
        }
        if(x['trueFalse'] && x['trueFalse']['problems'].length >0){
            for(let q of x['trueFalse']['problems']){
                data[`T${counter}`] = q['securedMarks']
                if(!flag)
                    trueFalse.push(`T${counter}`);
                counter++;
            }
            counter = 1;
        }
        if(x['codingQuestion'] && x['codingQuestion']['problems'].length >0){
            for(let q of x['codingQuestion']['problems']){
                data[`C${counter}`] = q['securedMarks']
                if(!flag)
                    codingQuestion.push(`C${counter}`);
            }
            counter = 1;
        }
        entries.push(data);
        flag = true;
    }

    entries.sort((a,b)=>{
        return b.marks-a.marks;
    })


    if (entries[0]) 
        entries[0]['rank'] = 1;
    for (var i = 1; i < entries.length; i++) {
        if (entries[i].securedMarks === entries[i-1].securedMarks) {
            entries[i].rank = entries[i-1].rank;
        } else {
            entries[i].rank = i + 1;
        }
    }

    if (entries.length == 0) {
        res.status(500).json({message: "No entries in leaderboard"});
    } else {    
        res.status(200).json({entries: entries,mcq:mcq,trueFalse:trueFalse,codingQuestion:codingQuestion});
    }
}