const mongoose = require('mongoose');
const Course = require('../models/course');
const Test = require('../models/test');
const UserTestRecord = require('../models/user-test-record');
const User = require('../models/user');
exports.getTestsTitles = async (req,res,next)=>{
    const courseId = req.courseId;
    const course = await Course.findById(courseId).select('tests _id').populate('tests',"_id testId title instructions groups.groupId groups.startTime groups.endTime");
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
                            },]
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
        console.log("User Test Record not created.");
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
        endTime: req.endTime
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
        res.status(200).json({message:"Section Submitted.",ended:true});
        return;
    }

    res.status(200).json({message:"Test Ended.",ended:true});

}

exports.submitQuestion = async (req,res,next) => {
    const isCorrect = req.isCorrect;
    const questionId = req.body.questionId;
    const response = req.body.answer;
    const questionType = req.body.questionType;
    const userTestRecordId = req.body.userTestRecordId;
    const userTestRecord = await UserTestRecord.findById(userTestRecordId).select(`${questionType} securedMarks`);
    let mcq = userTestRecord[questionType]['problems'].find(obj=>obj.question.toString() == questionId);
    if(!mcq){
        res.status(200).json({message:"Submission Unsuccessful, Try Again."});
        return;
    } 
    mcq.response = response;
    
    if(isCorrect){
        userTestRecord.securedMarks += mcq.marks - mcq.securedMarks;
        mcq.securedMarks = mcq.marks;
    } else {
        userTestRecord.securedMarks -= mcq.securedMarks;
        mcq.securedMarks = 0;
    }

    const result = await userTestRecord.save();
    if(!result){
        res.status(200).json({message:"Submission Unsuccessful, Try Again."});
        return;
    }
    res.status(200).json({message:'Submission Successful.'})
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
    
    res.status(200).json({endTime:new Date(grp.endTime).toLocaleString('en-In')});

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
                                model:'CodingQuestion'
                                // select:'-options.isCorrect'
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
                visited:(x.securedMarks == 0?false:true),
                submitted:(x.securedMarks == 0?false:true)
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
                visited:(x.securedMarks==0?false:true),
                submitted:(x.securedMarks==0?false:true)
            })
        }
        if(data.questions.length == 0){
            userTestRecord.codingQuestion.submitted = true;
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

        /*
            Add Code here.
        */
        if(data.questions.length == 0){
            userTestRecord.codingQuestion.submitted = true;
        } else {
            res.status(200).json(data);
            return;
        }
    }

    res.status(200).json({message:"No Questions Left. You can end the test.",ended:true}    );
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
    const userId = mongoose.Schema.Types.ObjectId(req.userId);

    const test = await Test.findById(test_id).select('revealMarks stats records').populate({
        path:'records',
        model:'UserTestRecord',
        match:{
            userId:userId
        }
    });
    if(!test){
        res.status(500).json({message:"Try Again"});
        return;
    }

    console.log(test);
    res.status(200).json(test);
}