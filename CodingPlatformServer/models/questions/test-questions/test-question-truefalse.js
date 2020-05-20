const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const testQuestionSchema = new Schema({
    question:{
        type: Schema.Types.ObjectId,
        ref: "TrueFalse"
    },
    marks:{
        type: Number,
        default: 0
    }
});

const TestQuestionTrueFalse = mongoose.model('TestQuestionTrueFalse',testQuestionSchema);
module.exports = TestQuestionTrueFalse;