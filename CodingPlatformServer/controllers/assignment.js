const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');

const Assignment = require('../models/assignment');
const Course = require('../models/course');

exports.getAssignmentDoc = (req, res, next) => {
    const assignmentId = req.query.assignmentId;

    Assignment.findById(assignmentId).then((assignment)=>{
        if(!assignment){
            res.status(404).json({message:'Assignment not found.'});
            return;
        }
        
        res.download(assignment.file,(err)=>{
            if(err){
                console.log(err);
                res.status(404).json({message:'File not found.'});
                return;   
            }
        })

    })
}

exports.getAssignmentSubmission = (req,res,next) => {
    const assignmentId = req.query.assignmentId;
    const email = req.userEmail;

    Assignment.findById(assignmentId).populate({
        path: 'submissions',
        match: {
            email : email
        }
    }).then((assignment)=>{
        if(!assignment['submissions'][0]['submissionUrl']){
            res.status(404).json({message:'File not found.'});
            return;
        }

        res.download(assignment['submissions'][0]['submissionUrl'],(err)=>{
            if(err){
                console.log(err);
                res.status(404).json({message:'File not found.'});
                return;   
            }
        })

    })
}

exports.submitAssignment = async (req,res,next) => {
    const assignmentId = req.body.assignmentId;
    const email = req.userEmail;

    let assignment = await Assignment.findById(assignmentId);

    if(!assignment){
        res.status(404).json({message:"Try Again"});
    }

    if(req.file){

        const fileName = path.basename(req.file.path);
        let oldPath = req.file.path;
        let newPath = path.join(__dirname,'..','data',req.body.courseCode,assignment.title,email).toString();
        
        await mkdirp(newPath);
        newPath = path.join(newPath,fileName);

        let moved = true;
        await fs.renameSync(oldPath, newPath, function (err) {
            if (err) {
                moved = false;
                // throw err
            }
        })

        if(!moved)
            newPath = oldPath;

        assignment.addSubmission(email,newPath).then((result)=>{
            res.status(201).json(result);
        });
    } else {
        res.status(400).json({message:"Try Again"});
    }
    
}
