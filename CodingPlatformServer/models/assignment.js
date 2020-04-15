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
    deadline:{
        type:Date,
        required:true
    },
    maximumMarks:{
        type: Number,
        required: true
    },
    fileUrl:{
        type: String
    }
})

const Assignment = mongoose.model('Assignment', assignmentSchema);
module.exports = Assignment;