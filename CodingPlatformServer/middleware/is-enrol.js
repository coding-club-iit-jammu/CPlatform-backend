const Course = require('../models/course');

module.exports = (req,res,next) => {
    const userId = req.userId;
    let code;
    if(req.method == 'GET'){
        code = req.query.courseId;
    } else if (req.method == 'POST'){
        code = req.body.courseId;
    } else {

    }

    Course.findById(code).then( course => {
        if(!course){
            res.status(400).json({message:"Course not found."});
            return;
        }

        let enrol = course.instructors.includes(userId) 
                    || course.teachingAssistants.includes(userId) 
                    || course.students.includes(userId) ;
        if(!enrol){
            res.status(401).json({message:"Unauthorized Access."});
            return;
        }
        req.courseId = course._id;
        next();
    })
}