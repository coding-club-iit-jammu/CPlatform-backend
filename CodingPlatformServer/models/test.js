const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const testSchema = new Schema({
    testId:{
        type: String,
        required: true,
        unique:true
    },
    revealMarks:{
        type: Boolean,
        default: false
    },
    title:{
        type: String,
        required: true
    },
    instructions:{
        type: String,
        required: true
    },
    startTest:{
        type: Boolean,
        default: false
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
        },
        password:{
            type: String
        }
    }],
    questions:{
        mcq:[{
            question:{
                type: Schema.Types.ObjectId,
                ref:"MCQ"
            },
            marks:{
                type: Number,
                default:0
            }
        }],
        trueFalse:[{
            question:{
                type: Schema.Types.ObjectId,
                ref:"TrueFalseQuestion"
            },
            marks:{
                type: Number,
                default:0
            }
        }],
        codingQuestion:[{
            question:{
                type: Schema.Types.ObjectId,
                ref:"CodingQuestion"
            },
            marks:{
                type: Number,
                default:0
            }
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
    this.questions[questionType].push({
        question:id,
        marks:0
    });
    return this.save();
}

testSchema.methods.addUserRecord = async (id) => {
    this.records.push(id);
    return this.save();
}

const Test = mongoose.model('Test',testSchema);
module.exports = Test;