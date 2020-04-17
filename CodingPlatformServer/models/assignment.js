const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
    submissions:{}
})

//marks,submissionURL,date and time of submission | key will be email
assignmentSchema.methods.addSubmission = function(userEmail,data){
    this.submissions[userEmail] = {
        submissionUrl : data.submissionUrl,
        submissionTime :  new Date().toLocaleString('en-In')
    }
}

assignmentSchema.methods.putMarks = function(userEmail,marks){
    if(this.submissions[userEmail])
        this.submissions[userEmail].securedMarks = marks;
        // else throw some error.
}   

const Assignment = mongoose.model('Assignment', assignmentSchema);
module.exports = Assignment;