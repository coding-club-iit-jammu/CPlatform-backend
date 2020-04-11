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
    }
})