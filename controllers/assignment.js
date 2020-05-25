const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const child_process = require('child_process');

const Assignment = require('../models/assignment');
const Course = require('../models/course');
const Submission = require('../models/submission');

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

exports.getAllAssignmentSubmissions = (req,res,next) => {

    const assignmentId = req.query.assignmentId;
    const courseCode = req.query.courseCode;

    Assignment.findById(assignmentId).select('title').then(async assignment=>{
        if(!assignment){
            res.status(400).json({message:'Try Again.'});
        }

        const pathA = path.join(__dirname,'..','data',courseCode,assignment.title);

        child_process.execSync(`zip -r ${assignmentId} *`, {
            cwd: pathA
        });

        res.download(pathA + `/${assignmentId}.zip`,(err)=>{
            if(!err){
                fs.unlink(pathA+`/${assignmentId}.zip`,()=>{
                    ;
                });
            }
        });

    })

}

exports.uploadMarks = async (req,res,next) => {
    try {

        const assignmentId = req.body.assignmentId;
        
        const data = fs.readFileSync(req.file.path, 'UTF-8');
        const lines = data.split('\n');
        
        let dictData = {};

        lines.forEach((line) => {
            const d = line.split(',');
            let email = d[0];
            let marks = d[1];

            dictData[email] = marks;
        });

        const assignment = await Assignment.findById(assignmentId);

        if(!assignment){
            res.status(500).json({message:'Try Again.'});
            return;
        }

        const submissions = assignment.submissions;
        submissions.forEach(submissionId =>{
            
            Submission.findById(submissionId).then(async (submission)=>{
                if(!dictData[submission.email]){
                    return;
                }
                submission['obtainedMarks'] = dictData[submission.email];
                return submission.save();
            })
        })
        
        res.status(200).json({message:'Marks Uploaded.'});

        fs.unlink(req.file.path,()=>{
            console.log("CSV Deleted.");
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Try Again."})
    }
}

exports.submitAssignment = async (req,res,next) => {
    const assignmentId = req.body.assignmentId;
    const email = req.userEmail;

    let assignment = await Assignment.findById(assignmentId)
                    .populate({ path:'submissions',
                                model:'Submission',
                                match: {
                                    email : email
                                }
                    });

    if(!assignment){
        res.status(404).json({message:"Try Again"});
    }

    let currentTime = new Date();

    if(new Date(assignment.deadline) < currentTime) {
        res.status(200).json({message:"Deadline Passed. Contact Instructor."})
        return;
    }

    if(assignment['submissions'].length > 0){
        if(!req.file){
            res.status(400).json({message:"Try Again"});
            return;
        }
        
        const id = assignment['submissions'][0]['_id'];
        let oldSubmission = await Submission.findById(id);

        if(!oldSubmission){
            res.status(404).json({message:"Try Again"});
            return;
        }

        const oldUrl = oldSubmission['submissionUrl'];
        const fileName = path.basename(req.file.path);
        let oldPath = req.file.path;
        let newPath = path.join(__dirname,'..','data',req.body.courseCode,assignment.title,email).toString();
        
        await mkdirp(newPath);
        newPath = path.join(newPath,fileName);

        let moved = true;
        await fs.renameSync(oldPath, newPath, function (err) {
            if (err) {
                moved = false;
            }
        })

        if(!moved)
            newPath = oldPath;
        
        oldSubmission.submissionTime = new Date();
        oldSubmission.submissionUrl = newPath;

        let result = await oldSubmission.save();
        
        if(!result){
            res.status(404).json({message:"Try Again"});
            return;
        }

        fs.unlinkSync(oldUrl, function (err) {
            if (err) {
                console.log(`Unable to delete file ${oldUrl}`);
            }
            console.log('File deleted!');
        }); 

        res.status(201).json({message:'Assignment Submitted.'});

    } else {
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
}

exports.shiftDeadline = (req,res,next) => {
    const assignmentId = req.body.assignmentId;
    let newDeadline = req.body.newDeadline;
    
    newDeadline = new Date(newDeadline);
    Assignment.findById(assignmentId).then(assignment => {
        if(!assignment){
            res.status(404).json({'message':'Try Again.'});
            return;
        }

        assignment.deadline = newDeadline;
        assignment.save().then((result)=>{
            if(!result){
                res.status(500).json({'message':'Try Again.'});
                return;
            }
            res.status(202).json({'message':'Deadline Shifted Successfully.'});
        })
    })
}