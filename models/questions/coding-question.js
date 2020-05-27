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
    },
    header:{
        type: String,
        required: false
    },
    mainCode:{
        type: String,
        required: false
    },
    footer:{
        type: String,
        required: false
    },
    used:{
        type: Boolean,
        default: false
    }
});

const CodingQuestion = mongoose.model('CodingQuestion', codingSchema);
module.exports = CodingQuestion;