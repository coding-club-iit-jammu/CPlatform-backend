const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const testQuestionSchema = new Schema({
    question:{
        type: Schema.Types.ObjectId,
        ref: "CodingQuestion"
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

const TestQuestionCoding = mongoose.model('TestQuestionCoding',testQuestionSchema);
module.exports = TestQuestionCoding;