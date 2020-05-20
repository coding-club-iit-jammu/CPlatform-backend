const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TestQuestionCoding = require('./questions/test-questions/test-question-coding');
const TestQuestionTrueFalse = require('./questions/test-questions/test-question-truefalse');
const TestQuestionMCQ = require('./questions/test-questions/test-question-mcq');

const testSchema = new Schema({
    testId:{
        type: String,
        required: true,
        unique:true
    },
    title:{
        type: String,
        required: true
    },
    instructions:{
        type: String,
        required: true
    },
    groups:[{
        groupId:{
            type: String,
            required: true
        },
        startTime:{
            type: Date
        },
        endTime:{
            type: Date
        }
    }],
    questions:{
        mcq:[{
            type: Schema.Types.ObjectId,
            ref: "TestQuestionMCQ"
        }],
        trueFalse:[{
            type: Schema.Types.ObjectId,
            ref: "TestQuestionTrueFalse"
        }],
        codingQuestion:[{
            type: Schema.Types.ObjectId,
            ref: "TestQuestionCoding"
        }]
    },
    records:[
        {
            type:Schema.Types.ObjectId,
            ref:"UserTestRecord"
        }
    ]
});


testSchema.methods.addQuestion = async (id,questionType)=>{
    this.questions[questionType].push(id);
    return this.save();
}

testSchema.methods.addUserRecord = async (id) => {
    this.records.push(id);
    return this.save();
}

const Test = mongoose.model('Test',testSchema);
module.exports = Test;