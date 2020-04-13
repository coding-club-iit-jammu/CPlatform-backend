const mongoose = require('mongoose');

const assignmentSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required:true
    },
    submissionDate:{
        type:Date,
        required:true
    },
    maximumMarks:{
        type: Number,
        required: true
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course'
    }
})

const Assignment = mongoose.model('Assignment', assignmentSchema);
module.exports = Assignment;