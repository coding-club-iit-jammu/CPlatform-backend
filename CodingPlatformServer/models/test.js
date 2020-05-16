const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const testSchema = new Schema({
    testId:{
        type: String,
        required: true
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
            type: Date,
            required: true
        },
        endTime:{
            type: Date,
            required: true
        }
    }],
    questions:{
        mcq:[{
            question:{
                type: Schema.Types.ObjectId,
                ref: "Question"
            },
            marks:{
                type: Number,
                required: true
            }
        }],
        trueFalse:[{
            question:{
                type: Schema.Types.ObjectId,
                ref: "Question"
            },
            marks:{
                type: Number,
                required: true
            }
        }],
        codingQuestion:[{
            question:{
                type: Schema.Types.ObjectId,
                ref: "Question"
            },
            marks:{
                type: Number,
                required: true
            }
        }]
    }
})