const Test = require('../models/test');
const User = require('../models/user');
const Course = require('../models/course');
const UserTestRecord = require('../models/user-test-record');

const findGrp = (userId,groups)=>{
    for(let group of groups){
        if(group['students'].includes(userId)){
            return group['groupId'];
        }
    }
}

const getRange = (temp) => {
    if(temp >= 90 ){
        return '90-100';
    } else if(temp >= 70){
        return '70-89';
    } else if(temp >= 50){
        return '50-69';
    } else if(temp >= 30){
        return '30-49';
    } else {
        return '0-30';
    }
} 

exports.getMarksSpread = async (req,res,next)=>{
    const testId = req.query.testId;
    const courseCode = req.query.courseCode;

    const course = await Course.findOne({code:courseCode}).select('groups');
    if(!course){
        res.status(500);
        return;
    }

    let groups = course['groups'].toObject();

    const testRecords = await Test.findOne({testId:testId}).select('records marks stats')
                                .populate([{
                                    path:'records',
                                    model:'UserTestRecord',
                                    select:'securedMarks userId'
                                },{
                                    path:'stats.minMarks.students',
                                    model:'User',
                                    select:'name'
                                },
                                {
                                    path:'stats.maxMarks.students',
                                    model:'User',
                                    select:'name'
                                }]);

    if(!testRecords){
        res.status(500);
        return;
    }                   
    
    let totalMarks = testRecords.marks;

    let marks = {
        all:{
            "90-100":0, //Above 90%
            "70-89":0, //Above 70%
            "50-69":0, //Above 50 %
            "30-49":0, //Above 30%
            "0-29":0 //Below 30%
        }
    }

    // for(let x of groups){
    //     marks[x['groupId']] = {
    //         "90-100":0, //Above 90%
    //         "70-89":0, //Above 70%
    //         "50-69":0, //Above 50 %
    //         "30-49":0, //Above 30%
    //         "0-29":0 //Below 30%
    //     };
    //     x['students'] = x['students'].map(String);
    // }

    for(let x of testRecords['records']){
        let temp = Math.ceil((x['securedMarks']/totalMarks)*100);
        // let grp = findGrp(x['userId'].toString(),groups);
        let f = getRange(temp);
        marks.all[f]++;
        // marks[grp][f]++;
    }

    let stats = {
        minMarks: testRecords['stats']['minMarks']['marks'],
        maxMarks: testRecords['stats']['maxMarks']['marks'],
        avgMarks: testRecords['stats']['avgMarks'],
        minStudents: testRecords['stats']['minMarks']['students'],
        maxStudents: testRecords['stats']['maxMarks']['students']
    }
    res.status(200).json({marks:marks,stats:stats});
}
    
exports.getQuestionWiseStats = async (req,res,next)=>{
    const testId = req.query.testId;

    const testRecords = await Test.findOne({testId:testId}).select('records marks')
                                .populate({
                                    path:'records',
                                    model:'UserTestRecord',
                                    select:'mcq trueFalse codingQuestion userId',
                                    populate:[{
                                      path: 'mcq.problems.question',
                                      model:'MCQ',
                                      select:'question'   
                                    },{
                                        path: 'trueFalse.problems.question',
                                        model:'TrueFalseQuestion',
                                        select:'question'   
                                      },{
                                        path: 'codingQuestion.problems.question',
                                        model:'CodingQuestion',
                                        select:'title'   
                                      }]
                                });

    if(!testRecords){
        res.status(500);
        return;
    }                   
    
    let data = {
        mcq:{},
        trueFalse:{},
        codingQuestion:{}

    }

    let flag = true;
    for(let record of testRecords['records']){
        if(record['mcq']){
            for(let problem of record['mcq']['problems']){
                if(flag){
                    data.mcq[problem['question']['_id']] = {
                        right:0,wrong:0,question:problem['question']['question']
                    };
                }
                if(problem['securedMarks'] == problem['marks']){
                    data.mcq[problem['question']['_id']].right++;
                } else {
                    data.mcq[problem['question']['_id']].wrong++;
                }
            }
        }

        if(record['trueFalse']){
            for(let problem of record['trueFalse']['problems']){
                if(flag){
                    data.trueFalse[problem['question']['_id']] = {
                        right:0,wrong:0,question:problem['question']['question']
                    };
                }
                if(problem['securedMarks'] == problem['marks']){
                    data.trueFalse[problem['question']['_id']].right++;
                } else {
                    data.trueFalse[problem['question']['_id']].wrong++;
                }
            }
        }

        if(record['codingQuestion']){
            for(let problem of record['codingQuestion']['problems']){
                if(flag){
                    data.codingQuestion[problem['question']['_id']] = {
                        right:0,wrong:0,question:problem['question']['title']
                    };
                }
                if(problem['securedMarks'] == problem['marks']){
                    data.codingQuestion[problem['question']['_id']].right++;
                } else {
                    data.codingQuestion[problem['question']['_id']].wrong++;
                }
            }
        }
        flag = false;
    }

    res.status(200).json(data);
}