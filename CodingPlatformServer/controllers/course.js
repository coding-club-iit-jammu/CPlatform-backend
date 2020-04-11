const Course = require('../models/course');
const User = require('../models/user');

exports.addCourse = (req,res,next) => {
    console.log(req.body);
    const title = req.body.title;
    const code = req.body.code;
    const instructorCode = req.body.instructorCode;
    const teachingAssistantCode = req.body.teachingAssistantCode;
    const studentCode = req.body.studentCode;
    const course = new Course({
        title : title,
        code : code,
        joiningCode: {
            instructor: instructorCode,
            teachingAssistant: teachingAssistantCode,
            student: studentCode 
        }
    });
    course.save().then((result)=>{
        if(result){
        console.log(result);
        res.status(200).json({
            "message":"Course Added Successfully"
        })
        }
    }).catch((err)=>{
        console.log(err);
    });
}

exports.joinCourse = (req,res,next) => {
    console.log(req.body);
    const code = req.body.code;
    const joiningCode = req.body.joiningCode;
    Course.findOne({code:code}).then((course)=>{
        if(!course){
            res.status(500).json({
                message:"Course Not Found."
            })
        }
        if(joiningCode == course.joiningCode.instructor){
            course.addInstructor(req.userId).then((result)=>{
                if(!result){
                    res.status(200).json({"message":"Joining Failed, Try Again"}); 
                } else {
                    User.findById(req.userId).then( user =>{
                        user.addTeachingCourse(course._id,course.code,course.title).then( updated =>{
                            if(!updated){
                                res.status(200).json({"message":"Joining Failed, Try Again"}); 
                            } else {
                                res.status(200).json({"message":"Joined as Instructor"});   
                            }
                        })
                    })
                }
            }).catch((err)=>{
                console.log(err);
            })
        } else if(joiningCode == course.joiningCode.teachingAssistant) {
            course.addTA(req.userId).then((result)=>{
                if(!result){
                    res.status(200).json({"message":"Joining Failed, Try Again"}); 
                } else {
                    User.findById(req.userId).then( user =>{
                        user.addTACourse(course._id,course.code,course.title).then( updated =>{
                            if(!updated){
                                res.status(200).json({"message":"Joining Failed, Try Again"});         
                            } else {
                                res.status(200).json({"message":"Joined as TA"});   
                            }
                        })
                    })
                }
            }).catch((err)=>{
                console.log(err);
            })
        } else if(joiningCode == course.joiningCode.student) {
            course.addStudent(req.userId).then((result)=>{
                if(!result){
                    res.status(200).json({"message":"Joining Failed, Try Again"}); 
                } else {
                    User.findById(req.userId).then( user =>{
                        user.addStudyingCourse(course._id,course.code,course.title).then( updated =>{
                            if(!updated){
                                res.status(200).json({"message":"Joining Failed, Try Again"}); 
                            } else {
                                res.status(200).json({"message":"Joined as Student"});   
                            }
                        })
                    })  
                }
            }).catch((err)=>{
                console.log(err);
            })
        } else {
            console.log("Wrong Code.");
            res.status(200).json({"message":"Wrong Code"}); 
        }
    }).catch((err)=>{
        console.log(err);
        res.status(200).json({"message":"Joining Failed, Try Again"}); 
    });
}