const Course = require('../models/course');

module.exports = (req,res,next) => {
    
    let courseId;

    console.log(req);
    // console.log(req);

    if(req.method == 'POST'){
        courseId = req.body.courseId;
    } else if(req.method == 'GET'){
        courseId = req.query.courseId;
    }
    const userId = req.userId;
    
    console.log(courseId);

    Course.findById(courseId).select('instructors').then( course => {
        console.log(course);
        if(!course){
            res.status(400).json({message:"Course not found."});
            return;
        }
        let isInstructor = course.instructors.includes(userId);
        if(!isInstructor){
            res.status(401).json({message:"Unauthorized Access."});
        }
        req.courseId = course._id;
        next();
    })
}