const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const submissionSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    userId:{
        type: Schema.Types.ObjectId,
        ref: 'User',
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
        type: Number,
        default: 0
    }

});

const Submission = mongoose.model('Submission', submissionSchema);
module.exports = Submission;