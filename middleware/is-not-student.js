const Course = require('../models/course');

module.exports = (req,res,next) => {
    if(req.role != 'student'){
        next();
    } else {
        res.status(404).json({message:"Access Forbidden."});
        return; 
    }
}