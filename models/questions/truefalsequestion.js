const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const trueFalseSchema = new Schema({
    question:{
        type: String,
        required: true
    },
    answer:{
        type: Boolean,
        required: true
    },
    used:{
        type: Boolean,
        default: false
    }
})

const TrueFalseQuestion = mongoose.model('TrueFalseQuestion',trueFalseSchema);

module.exports = TrueFalseQuestion;