const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const testQuestionSchema = new Schema({
    question:{
        type: Schema.Types.ObjectId,
        ref: "MCQ"
    },
    marks:{
        type: Number,
        default: 0
    },
    submissions:[{
        type: Schema.Types.ObjectId,
        ref:"QuestionSubmission",
        required: true
    }]
});

const TestQuestionMCQ = mongoose.model('TestQuestionMCQ',testQuestionSchema);
module.exports = TestQuestionMCQ;