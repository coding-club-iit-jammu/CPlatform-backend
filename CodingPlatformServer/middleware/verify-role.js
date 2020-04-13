const Course = require('../models/course');

module.exports = (req,res,next) => {
    const userId = req.userId;
    let role,code;
    
    if(req.method == 'GET'){
        role = req.query.role;
        code = req.query.code;
    } else if(req.method == 'POST') {
        role = req.body.role;
        code = req.body.code;
    }
    
    Course.findOne({code:code}).then( course => {
        if(!course){
            res.status(400).json({message:"Course not found."});
            return;
        }

        if(role=='instructor'){
            let enrol = course.instructors.includes(userId);
            if(!enrol){
                res.status(401).json({message:"Unauthorized Access."});
                return;
            }
            req.courseId = course._id;
            next();
        } else if(role=='teachingAssistant') {
            let enrol = course.teachingAssistants.includes(userId);
            if(!enrol){
                res.status(401).json({message:"Unauthorized Access."});
                return;
            }
            req.courseId = course._id;
            next();
        } else if(role=='student') {
            let enrol = course.students.includes(userId);
            if(!enrol){
                res.status(401).json({message:"Unauthorized Access."});
                return;
            }
            req.courseId = course._id;
            next();
        } else {
            res.status(400).json({message:"Wrong Role"});
        }
    })
}