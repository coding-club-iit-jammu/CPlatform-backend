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
    }
});

const TestQuestionCoding = mongoose.model('TestQuestionCoding',testQuestionSchema);
module.exports = TestQuestionCoding;