const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.set('useFindAndModify', false);
const trueFalseSchema = new Schema({
    question:{
        type: String,
        required: true
    },
    answer:{
        type: Boolean,
        required: true
    }
})

const TrueFalseQuestion = mongoose.model('TrueFalseQuestion',trueFalseSchema);

module.exports = TrueFalseQuestion;