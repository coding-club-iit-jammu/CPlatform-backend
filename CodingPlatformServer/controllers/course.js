const Course = require('../models/course');
const User = require('../models/user');
const Post = require('../models/post');
const Assignment = require('../models/assignment');

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

exports.getCourseInfo = (req,res,next) => {
    
    const courseId = req.courseId;
    console.log(courseId);

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
        res.status(200).json(course);
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
    const by = req.userId;
    const title = req.body.title;
    const description = req.body.description;

    let name;

    await User.findById(by).then((user)=>{
        if(!user){
            res.status(400).json({message:'Bad request.'})
        }
        name = user.name;
    })
    const post = new Post({
        by: name,
        date: new Date().toLocaleString('en-In'),
        title: title,
        description: description
    });

    post.save().then((post)=>{
        if(!post){
            res.status(400).json({message: "Unable to Post it."});
            return;
        }

        Course.findById(courseId).then((course)=>{
            if(!course){
                Post.findByIdAndDelete(post._id).exec();
            }
            course.addPost(post._id).then((result)=>{
                if(!result){
                    Post.findByIdAndDelete(post._id).exec();
                }
                res.status(200).json({message:'Post Added'});
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
    
    let assignment;
    
    console.log(req.body);

    if(req.file){
        assignment = new Assignment({
            title : title,
            description : description,
            deadline : deadline,
            file : req.file.path,
            marks : marks
        });
    } else {
        assignment = new Assignment({
            title : title,
            description : description,
            deadline : deadline,
            marks : marks
        });
    }

    assignment.save().then( async assignment => {
        if(!assignment){
            res.status(500).json({message: "Try Again"});
        }

        const course = await Course.findById(courseId);
        course.addAssignment(assignment._id).then((result)=>{
            if(!result){
                assignment.findByIdAndDelete(assignment._id).exec();
            }
            res.status(201).json({message:'Assignment Added'});
        })
    })
}