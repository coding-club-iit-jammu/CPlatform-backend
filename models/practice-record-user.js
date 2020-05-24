const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userRecordSchema = new Schema({
    score:{
        type: Number,
        default:0
    },
    userId:{
        type: Schema.Types.ObjectId,
        ref:'User'
    },
    questions:{
        mcq:[{
            question:{
                type: Schema.Types.ObjectId,
                ref:"MCQ"
            },
            response:{
                type:String,
                required: true
            },
            isCorrect:{
                type:Boolean,
                required: true
            },
            date:{
                type: Date,
                required: true
            }
        }],
        trueFalse:[{
            question:{
                type: Schema.Types.ObjectId,
                ref:"TrueFalse"
            },
            response:{
                type:Boolean,
                required: true
            },
            isCorrect:{
                type:Boolean,
                required: true
            },
            date:{
                type: Date,
                required: true
            }
        }],
        codingQuestion:[{
            question:{
                type: Schema.Types.ObjectId,
                ref:"CodingQuestion"
            },
            response:{
                type:String,
                required: true
            },
            isCorrect:{
                type:Boolean,
                required: true
            },
            date:{
                type: Date,
                required: true
            }
        }]
    }
})

const UserPracticeRecord = mongoose.model("UserPracticeRecord",userRecordSchema);

module.exports = UserPracticeRecord;