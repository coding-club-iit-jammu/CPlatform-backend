const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSubmissionSchema = new Schema({
    userId:{
        type: Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    response:{
        type: String,
        required: true
    },
    obtainedMarks:{
        type: Number,
        required: true
    }
});

const QuestionSubmission = mongoose.model("QuestionSubmission",questionSubmissionSchema);

module.exports = QuestionSubmission;