const Course = require('../models/course');

module.exports = async (req, res, next) => {
    
    const userId = req.userId;
    let courseCode;
    if(req.method == 'GET'){
        courseCode = req.query.courseCode;
    } else if(req.method == 'POST'){
        courseCode = req.body.courseCode;
    }

    const course = await Course.findOne({code : courseCode});

    if(!course){
        res.status(400).json({message:"Course not found."});
        return;
    }

    let enrol = course.instructors.includes(userId);
    let enrolled = false;
    if(enrol){
        req.courseId = course._id;
        req.role = 'instructor';
        enrolled = true;
        next();
    }

    enrol = course.students.includes(userId);
    if(enrol){
        req.courseId = course._id;
        req.role = 'student';
        enrolled = true;
        next();
    }

    enrol = course.teachingAssistants.includes(userId);
    if(enrol){
        req.courseId = course._id;
        req.role = 'teachingAssistant';
        enrolled = true;
        next();
    }

    if(!enrolled){
        res.status(401).json({message:"Unauthorized Access."});
        return;
    }    


}