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
        res.status(201).json({
            "message":"Course Added Successfully"
        })
        }
    }).catch((err)=>{
        console.log(err);
    });
}

exports.joinCourse = (req,res,next) => {
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
        } else if(joiningCode == course.joiningCode.student) {
            course.addStudent(req.userId).then((result)=>{
                if(!result){
                    res.status(500).json({"message":"Joining Failed, Try Again"}); 
                } else {
                    User.findById(req.userId).then( user =>{
                        user.addStudyingCourse(course._id,course.code,course.title).then( updated =>{
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
        } else {
            res.status(400).json({"message":"Wrong Code"}); 
        }
    }).catch((err)=>{
        res.status(500).json({"message":"Joining Failed, Try Again"}); 
    });
}

exports.getCourseInfo = (req,res,next) => {
    
    const courseId = req.courseId;

    Course.findById(courseId)
    .select('_id title instructors teachingAssistants posts')
    .populate('instructors','name email')
    .populate('teachingAssistants','name email')
    .populate('posts')
    .then( course => {
        if(!course){
            res.status(404).json({message:"Course Not Found"});
            return;
        }
        let data = course.toObject();
        data['role'] = req.role;
        res.status(200).json(data);
    })
}

exports.getPosts = (req,res,next) => {
    
    const courseId = req.courseId;

    Course.findById(courseId)
    .select('posts')
    .populate('posts')
    .then( course => {
        if(!course){
            res.status(404).json({message:"Course Not Found"});
            return;
        }
        res.status(200).json(course);
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

    Course.findById(courseId)
    .select('assignments')
    .populate('assignments')
    .then( course => {
        if(!course){
            res.status(404).json({message:"Course Not Found"});
            return;
        }
        res.status(200).json(course);
    })
}

exports.getAssignmentDoc = (req, res, next) => {
    const assignmentId = req.query.assignmentId;

    Assignment.findById(assignmentId).then((assignment)=>{
        if(!assignment){
            res.status(404).json({message:'Assignment not found.'});
            return;
        }
        
        console.log(assignment);

        res.download(assignment.file,(err)=>{
            if(err){
                console.log(err);
                res.status(404).json({message:'File not found.'});
                return;   
            }
        })

    })
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

    const name = req.userName;

    const post = new Post({
        by: name,
        date: new Date().toLocaleString('en-In'),
        title: title,
        description: description
    });

    post.save().then((post)=>{
        if(!post){
            console.log("Unable to Post it.");
            res.status(400).json({message: "Unable to Post it."});
            return;
        }

        Course.findById(courseId).then((course)=>{
            if(!course){
                Post.findByIdAndDelete(post._id).exec();
                console.log("Unable to Post it, Course not found");
                res.status(400).json({message: "Unable to Post it."});
                return; 
            }
            course.addPost(post._id).then((result)=>{
                if(!result){
                    Post.findByIdAndDelete(post._id).exec();
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

    console.log(req.body);
    
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
            else{
                console.log('Successfully renamed - AKA moved!')
            }
        })

        if(!moved)
            newPath = oldPath;

        console.log(newPath);
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
    console.log(assignment);
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