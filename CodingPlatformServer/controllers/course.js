const fs = require('fs');
const path = require('path');

const mkdirp = require('mkdirp');

const Course = require('../models/course');
const User = require('../models/user');
const Post = require('../models/post');
const Assignment = require('../models/assignment');

exports.addCourse = (req,res,next) => {
    
    const title = req.body.title;
    const code = req.body.code;
    const instructorCode = req.body.instructorCode;
    const teachingAssistantCode = req.body.teachingAssistantCode;
    const studentCode = req.body.studentCode;
    
    let groupIds = [];
    for(let x of studentCode){
        groupIds.push({
            groupId:x.groupId,
            students:[]
        });
    }

    const course = new Course({
        title : title,
        code : code,
        joiningCode: {
            instructor: instructorCode,
            teachingAssistant: teachingAssistantCode,
            groups: studentCode 
        },
        groups: groupIds,
        instructors:[],
        teachingAssistants:[],
        practiceQuestions:{
            mcq:[],
            trueFalse:[],
            codingQuestion:[]
        }
    });
    
    course.save().then((result)=>{
        if(result){
        res.status(201).json({
            "message":"Course Added Successfully"
        })
        }
    }).catch((err)=>{
        console.log(err);
        res.status(500).json({
            "message":err
        })
    });
}

exports.joinCourse = (req,res,next) => {
    const code = req.body.code;
    const joiningCode = req.body.joiningCode;
    Course.findOne({code:code}).then((course)=>{
        if(!course){
            console.log("Course not found.");
            res.status(500).json({
                message:"Course Not Found."
            })
            return;
        }
        if(joiningCode == course.joiningCode.instructor){
            course.addInstructor(req.userId).then((result)=>{
                if(!result){
                    res.status(500).json({"message":"Joining Failed, Try Again"}); 
                    return;
                } else {
                    User.findById(req.userId).then( user =>{
                        user.addTeachingCourse(course._id,course.code,course.title).then( updated =>{
                            if(!updated){
                                res.status(500).json({"message":"Joining Failed, Try Again"});
                                return; 
                            } else {
                                res.status(202).json({"message":"Joined as Instructor"});  
                                return; 
                            }
                        })
                    })
                }
            }).catch((err)=>{
                res.status(500).json({"message":"Internal Server Error, Try Again"}); 
            })
        } else if(joiningCode == course.joiningCode.teachingAssistant) {
            course.addTA(req.userId).then((result)=>{
                if(!result){
                    res.status(500).json({"message":"Joining Failed, Try Again"}); 
                } else {
                    User.findById(req.userId).then( user =>{
                        user.addTACourse(course._id,course.code,course.title).then( updated =>{
                            if(!updated){
                                res.status(500).json({"message":"Joining Failed, Try Again"});         
                            } else {
                                res.status(202).json({"message":"Joined as TA"});   
                            }
                        })
                    })
                }
            }).catch((err)=>{
                res.status(500).json({"message":"Internal Server Error, Try Again"}); 
            })
        } else {
            for(let g of course.joiningCode.groups){
                if(g.code == joiningCode){
                    course.addStudent(req.userId, g.groupId).then((result)=>{
                        if(!result){
                            res.status(500).json({"message":"Joining Failed, Try Again"}); 
                        } else {
                            User.findById(req.userId).then( user =>{
                                user.addStudyingCourse(course._id,course.code,course.title,g.groupId).then( updated =>{
                                    if(!updated){
                                        res.status(500).json({"message":"Joining Failed, Try Again"}); 
                                    } else {
                                        res.status(202).json({"message":"Joined as Student"});   
                                    }
                                })
                            })  
                        }
                    }).catch((err)=>{
                        res.status(500).json({"message":"Internal Server Error, Try Again"}); 
                    })
                    return;     
                }
            }
            res.status(400).json({"message":"Wrong Code"}); 
        }
    }).catch((err)=>{
        res.status(500).json({"message":"Joining Failed, Try Again"}); 
    });
}

exports.getCourseInfo = (req,res,next) => {
    
    const courseId = req.courseId;

    Course.findById(courseId)
    .select('_id title instructors teachingAssistants groups')
    .populate('instructors','name email')
    .populate('teachingAssistants','name email')
    .then( course => {
        if(!course){
            res.status(404).json({message:"Course Not Found"});
            return;
        }
        let data = course.toObject();
        data['role'] = req.role;
        let grp = ["Instructors","TAs"];
        for(let g of data['groups']){
            grp.push(g.groupId);
        }
        data['groups'] = grp;

        res.status(200).json(data);
    })
}

exports.getPosts = (req,res,next) => {
    
    const courseId = req.courseId;
    // const groupId = req.groupId;
    Course.findById(courseId)
    .select('posts')
    .populate('posts')
    .then( course => {
        if(!course){
            res.status(404).json({message:"Course Not Found"});
            return;
        }
        let data = course.posts;
        let outData = [];
        for(let x of data){
            if((x.audience).includes(req.groupId) || (x.audience).includes(req.userEmail)){
                outData.push(x);
            }
        }
        res.status(200).json(outData);
    })
}

exports.getTests = (req,res,next) => {
    
    const courseId = req.courseId;

    Course.findById(courseId)
    .select('posts')
    .populate('posts','name email')
    .then( course => {
        if(!course){
            res.status(404).json({message:"Course Not Found"});
            return;
        }
        res.status(200).json(course);
    })
}

exports.getAssignments = (req,res,next) => {
    
    const courseId = req.courseId;
    const email = req.userEmail;

    if(req.role != 'student'){
        Course.findById(courseId)
        .select('assignments')
        .populate('assignments', '_id title description deadline marks file requiresSubmission')
        .then( course => {
            if(!course){
                res.status(404).json({message:"Course Not Found"});
                return;
            }
            res.status(200).json(course);
        })
    } else {
        Course.findById(courseId)
        .select('assignments')
        .populate({
            path: 'assignments',
            model: 'Assignment',
            select: 'title description deadline marks file submissions requiresSubmission',
            populate:{
                path:'submissions',
                model:'Submission'
            }
        })
        .populate({
            path: 'submissions',
            match: {email:email}
        })
        .then( course => {
            if(!course){
                res.status(404).json({message:"Course Not Found"});
                return;
            }
            let data = {'assignments':[]};
            let temp = course.assignments;
            let l = temp.length;
            for(let d = 0; d < l; d+=1){
                data['assignments'][d] = {
                    title : temp[d].title,
                    description : temp[d].description,
                    deadline : temp[d].deadline,
                    requiresSubmission : temp[d].requiresSubmission,
                    marks : temp[d].marks,
                    _id : temp[d]._id
                }
                
                if(temp[d]['submissions'].length == 0){
                    continue;
                } 
                
                if(!temp[d]['submissions'][0]['email']){
                    continue;
                }
                
                data['assignments'][d]['submissionTime'] = temp[d]['submissions'][0]['submissionTime'];
                data['assignments'][d]['submissionUrl'] = temp[d]['submissions'][0]['submissionUrl'];
                
                if(!temp[d]['submissions'][0]['obtainedMarks']){
                    continue;
                }

                data['assignments'][d]['obtainedMarks'] = temp[d]['submissions'][0]['obtainedMarks'];
            }

            res.status(200).json(data);
        })
    }
}


exports.getJoiningCodes = (req,res,next) => {
    
    const courseId = req.courseId;

    Course.findById(courseId)
    .select('joiningCode')
    .then( course => {

        if(!course){
            res.status(404).json({message:"Joining Code Not Found"});
            return;
        }
        res.status(200).json(course);
    })
}

exports.addPost = async (req,res,next) => {
    
    const courseId = req.courseId;
    const title = req.body.title;
    const description = req.body.description;
    const audience = req.body.audience +","+ req.userEmail;

    const name = req.userName;
    let post;
    if(!req.file){
        post = new Post({
            by: name,
            date: new Date().toLocaleString('en-In'),
            title: title,
            description: description,
            audience: audience
        });
    } else {
        const fileName = path.basename(req.file.path);
        let oldPath = req.file.path;
        let newPath = path.join(__dirname,'..','data',req.body.courseCode,'posts').toString();
        
        await mkdirp(newPath);
        newPath = path.join(newPath,fileName);

        let moved = true;
        await fs.renameSync(oldPath, newPath, function (err) {
            if (err) {
                moved = false;
                throw err
            }
        })

        if(!moved)
            newPath = oldPath;

        post = new Post({
            by: name,
            date: new Date().toLocaleString('en-In'),
            title: title,
            description: description,
            file: newPath,
            audience: audience
        });
    }

    post.save().then((post)=>{
        if(!post){
            console.log("Unable to Post it.");
            res.status(400).json({message: "Unable to Post it."});
            return;
        }

        Course.findById(courseId).then((course)=>{
            if(!course){
                console.log("Unable to Post it, Course not found");
                res.status(400).json({message: "Unable to Post it."});
                return; 
            }
            course.addPost(post._id).then((result)=>{
                if(!result){
                    console.log("Unable to Post it, problem occured while adding post.");
                    res.status(400).json({message: "Unable to Post it."});
                    return; 
                }
                console.log("Post Added");
                res.status(201).json({message:'Post Added'});
            })
        })
    })
    
}

exports.addAssignment = async (req,res,next) => {
    
    const courseId = req.courseId;
    const title = req.body.title;
    const description = req.body.description;
    const deadline = req.body.deadline;
    const marks = req.body.marks;
    const requiresSubmission = req.body.requiresSubmission;

    let assignment;

    if(req.file){

        const fileExt = path.parse(path.basename(req.file.path)).ext;
        let oldPath = req.file.path;
        let newPath = path.join(__dirname,'..','data',req.body.courseCode,title).toString();
        
        await mkdirp(newPath);
        newPath = path.join(newPath,title+fileExt);

        let moved = true;
        await fs.renameSync(oldPath, newPath, function (err) {
            if (err) {
                moved = false;
                throw err
            }
        })

        if(!moved)
            newPath = oldPath;

        assignment = new Assignment({
            title : title,
            description : description,
            deadline : deadline,
            file : newPath.toString(),
            marks : marks,
            requiresSubmission: requiresSubmission
        });
    } else {
        assignment = new Assignment({
            title : title,
            description : description,
            deadline : deadline,
            marks : marks,
            requiresSubmission : requiresSubmission
        });
    }
    
    assignment.save().then( async assignment => {
        if(!assignment){
            res.status(500).json({message: "Try Again"});
            return;
        }

        const course = await Course.findById(courseId);
        course.addAssignment(assignment._id).then((result)=>{
            if(!result){
                assignment.findByIdAndDelete(assignment._id).exec();
                res.status(500).json({message: "Try Again"});
                return;
            }

            
            res.status(201).json({message:'Assignment Added'});
        })
    })
}