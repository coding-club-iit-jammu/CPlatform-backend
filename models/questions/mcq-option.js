const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const optionSchema = new Schema({
    code:{
        type: String,
        required: true
    },
    option:{
        type: String,
        required: true
    },
    isCorrect:{
        type: Boolean,
        required: true,
        default: false
    }
});

const MCQOption = mongoose.model("MCQOption",optionSchema);

module.exports = MCQOption;