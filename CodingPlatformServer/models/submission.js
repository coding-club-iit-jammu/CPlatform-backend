const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const submissionSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    submissionUrl: {
        type: String,
        required: true
    },
    submissionTime: {
        type: Date,
        required: true
    },
    obtainedMarks: {
        type: Number
    }

});

const Submission = mongoose.model('Submission', submissionSchema);
module.exports = Submission;