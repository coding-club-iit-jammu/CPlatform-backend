const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');

const Course = require('../../models/course');
const CodingQuestion = require('../../models/questions/coding-question');

exports.addCodingQuestion = async (req,res,next)=>{
    
    const courseId = req.courseId;
    const title = req.body.title;
    const description = req.body.description;
    const sampleInput = req.body.sampleInput;
    const sampleOutput = req.body.sampleOutput;

    const fileName = path.basename(req.file.path);
    let oldPath = req.file.path;
    let newPath = path.join(__dirname,'..','..','data',req.body.courseCode,'questions','testcases').toString();
        
    await mkdirp(newPath);
    newPath = path.join(newPath,fileName);

    let moved = true;
    await fs.renameSync(oldPath, newPath, function (err) {
        if (err) {
            moved = false;
            throw err
        }
    })

    if(!moved)
        newPath = oldPath;

    const codingQuestion = new CodingQuestion({
        title: title,
        description: description,
        sampleInput: sampleInput,
        sampleOutput: sampleOutput,
        testcases: newPath
    });

    codingQuestion.save().then((cq)=>{
        if(!cq){
            console.log("Unable to Save Question.");
            res.status(400).json({message: "Unable to Save Question."});
            return;
        }

        Course.findById(courseId).then((course)=>{
            if(!course){
                console.log(`Unable to Save Question, course ${courseId} not found`);
                res.status(400).json({message: "Unable to Save Question."});
                return; 
            }
            course.addCodingQuestion(cq._id).then((result)=>{
                if(!result){
                    console.log("Unable to Save it, problem occured while adding in Course.");
                    res.status(400).json({message: "Unable to Save it."});
                    return; 
                }
                console.log("Question Added");
                res.status(201).json({message:'Question Added'});
            })
        })
    })
}

exports.getCodingQuestions = async (req,res,next)=>{
    const courseId = req.courseId;

    const course = await Course.findById(courseId)
                        .select('questions.codingQuestion')
                        .populate({
                            path:'questions.codingQuestion'
                        });
    if(!course){
        res.status(500).json({message:"Unable to get Coding Questions."})
        return;
    }
    console.log(course);
    res.status(200).json(course);
}