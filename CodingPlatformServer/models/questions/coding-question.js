const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const codingSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required:true
    },
    sampleInput:{
        type: String,
        required: true
    },
    sampleOutput:{
        type: String,
        required: true
    },
    testcases:{
        type: String,
        required: true
    }
});

const CodingQuestion = mongoose.model('CodingQuestion', codingSchema);
module.exports = CodingQuestion;