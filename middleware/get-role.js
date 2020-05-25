const Course = require('../models/course');

module.exports = async (req, res, next) => {
    
    const userId = req.userId;
    let courseCode;
    if(["GET","DELETE"].includes(req.method)){
        courseCode = req.query.courseCode;
    } else if(req.method == 'POST'){
        courseCode = req.body.courseCode;
    }

    const course = await Course.findOne({code : courseCode});
    
    if(!course){
        res.status(404).json({message:"Course not found."});
        return;
    }

    let enrol = course.instructors.includes(userId);
    let enrolled = false;
    if(enrol){
        req.courseId = course._id;
        req.role = 'instructor';
        req.groupId = "Instructors";
        enrolled = true;
        next();
    }

    for(let g of course.groups){
        enrol = g.students.includes(userId);
        if(enrol){
            req.courseId = course._id;
            req.role = 'student';
            req.groupId = g.groupId;
            enrolled = true;
            next();
        }

    }
    
    enrol = course.teachingAssistants.includes(userId);
    if(enrol){
        req.courseId = course._id;
        req.role = 'teachingAssistant';
        req.groupId = "TAs";
        enrolled = true;
        next();
    }

    if(!enrolled){
        res.status(404).json({message:"Unauthorized Access."});
        return;
    }    


}