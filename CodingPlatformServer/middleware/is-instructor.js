const Course = require('../models/course');

module.exports = (req,res,next) => {
    
    const courseId = req.query.courseId;
    const userId = req.userId;
    
    Course.findById(courseId).select('instructors').then( course => {
        if(!course){
            res.status(400).json({message:"Course not found."});
        }
        let isInstructor = course.instructors.includes(userId);
        if(!isInstructor){
            res.status(401).json({message:"Unauthorized Access."});
        }
        req.courseId = course._id;
        next();
    })
}