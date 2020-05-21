const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');

const Course = require('../../models/course');
const CodingQuestion = require('../../models/questions/coding-question');

const shiftFile = async (courseCode,currPath,cl)=>{
    const fileName = path.basename(currPath);
    let oldPath = currPath;
    let newPath = path.join(__dirname,'..','..','data',courseCode,'questions',cl).toString();
        
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

    return newPath;
}

exports.addCodingQuestion = async (req,res,next)=>{
    const courseId = req.courseId;
    const title = req.body.title;
    const description = req.body.description;
    const sampleInput = req.body.sampleInput;
    const sampleOutput = req.body.sampleOutput;

    
    const testcasesPath = await shiftFile(req.body.courseCode,req.files['testcases'][0].path,"testcases");
    const codingQuestion = new CodingQuestion({
        title: title,
        description: description,
        sampleInput: sampleInput,
        sampleOutput: sampleOutput,
        testcases: testcasesPath
    });
 
    if(req.files['header']){
        codingQuestion.header = await shiftFile(req.body.courseCode,req.files['header'][0].path,"header");
    }
    if (req.files['mainCode']) {
        codingQuestion.mainCode = await shiftFile(req.body.courseCode,req.files['mainCode'][0].path,"mainCode");
    }
    if(req.files['footer']){
        codingQuestion.footer = await shiftFile(req.body.courseCode,req.files['footer'][0].path,"footer");
    }

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

exports.editCodingQuestion = async (req,res,next)=>{
    
    const title = req.body.title;
    const description = req.body.description;
    const sampleInput = req.body.sampleInput;
    const sampleOutput = req.body.sampleOutput;
    const _id = req.body._id;

    let codingQuestion = await CodingQuestion.findById(_id);

    if(!codingQuestion){
        res.status(500).json({message:"Try Again."});
        return;
    }

    codingQuestion.title = title;
    codingQuestion.description = description;
    codingQuestion.sampleInput = sampleInput;
    codingQuestion.sampleOutput = sampleOutput;

    if(req.files['testcases']){
        let oldUrl = codingQuestion.testcases;
        codingQuestion.testcases = await shiftFile(req.body.courseCode, req.files['testcases'][0].path,"testcases");
        if (oldUrl) fs.unlink(oldUrl,(err)=>{
            console.log(err);
        });
    }

    if(req.files['header']){
        let oldUrl = codingQuestion.header;
        codingQuestion.header = await shiftFile(req.body.courseCode, req.files['header'][0].path,"header");
        if (oldUrl) fs.unlink(oldUrl,(err)=>{
            console.log(err);
        });
    }
    if (req.files['mainCode']) {
        let oldUrl = codingQuestion.mainCode;
        codingQuestion.mainCode = await shiftFile(req.body.courseCode,req.files['mainCode'][0].path,"mainCode");
        if (oldUrl) fs.unlink(oldUrl,(err)=>{
            console.log(err);
        })
    }
    if(req.files['footer']){
        let oldUrl = codingQuestion.footer;
        codingQuestion.footer = await shiftFile(req.body.courseCode, req.files['footer'][0].path,"footer");
        if (oldUrl) fs.unlink(oldUrl,(err)=>{
            console.log(err);
        });
    }

    const result = await codingQuestion.save();

    if(!result){
        res.status(500).json({message:"Try Again."});
        return;
    }

    res.status(202).json({message:'Question Editted.'});
}


exports.getCodingQuestions = async (req,res,next)=>{
    const courseId = req.courseId;

    const course = await Course.findById(courseId)
                        .select('questions.codingQuestion title')
                        .populate({
                            path:'questions.codingQuestion'
                        });
    if(!course){
        res.status(500).json({message:"Unable to get Coding Questions."})
        return;
    }
    res.status(200).json(course);
}

exports.getItem = async (req, res, next) => {
    const _id = req.query.codingQuestionId;
    const item = req.query.item;
    const codingQuestion = await CodingQuestion.findById(_id).select(item);

    if(!codingQuestion){
        res.status(404).json({message:"File Not Found."});
        return;
    }
    
    res.status(200).download(codingQuestion[item],(err)=>{
        if(err){
            console.log(err);
            res.status(404).json({message:'File not found.'});
            return;   
        }
    })
}

exports.deleteCoding = async (req,res,next)=>{
    const codingId = req.query.questionId;
    CodingQuestion.findByIdAndRemove(codingId).then((data)=>{
        console.log(data);
        if(data){
            if(data['testcases']){
                fs.unlink(data['testcases'],err=>{
                    ;
                })
            }
            if(data['header']){
                fs.unlink(data['testcases'],err=>{
                    ;
                })
            }
            if (data['mainCode']) {
                fs.unlink(data['mainCode']),err=>{
                    ;
                }
            }
            if(data['footer']){
                fs.unlink(data['testcases'],err=>{
                    ;
                })
            }
            res.status(204).json({message:"Deleted."});
            return;
        }
        res.status(500).json({message:"Try Again"});
    });
}