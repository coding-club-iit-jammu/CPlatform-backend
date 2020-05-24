const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Submission = require('../models/submission');

const assignmentSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required:true
    },
    requiresSubmission:{
        type: Boolean,
        required: true
    },
    deadline:{
        type:Date,
        required:true
    },
    marks:{
        type: Number,
        required: true
    },
    file:{
        type: String
    },
    submissions:[{
        type: Schema.Types.ObjectId,
        ref: 'Submission'
    }]
})

assignmentSchema.methods.addSubmission = function(userEmail,submissionUrl){
    const submission = new Submission({
        submissionUrl : submissionUrl,
        submissionTime :  new Date(),
        email : userEmail
    })
    return submission.save().then((result)=>{
        if(!result){
            res.status(500).json({message:"Network Error"});
            return;
        }
        this.submissions.push(result._id);
        return this.save();
    })
}

assignmentSchema.methods.putMarks = function(userEmail,marks){
    // if(this.submissions[userEmail]){
    //     this.submissions[userEmail].securedMarks = marks;
    // }// else throw some error.
    // return this.save();
}   

const Assignment = mongoose.model('Assignment', assignmentSchema);
module.exports = Assignment;