const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const testRecordSchema = new Schema({
    userId:{
        type: Schema.Types.ObjectId,
        ref:'User'
    },
    revealMarks:{
        type: Boolean,
        default: false
    },
    testId:{
        type: Schema.Types.ObjectId,
        ref:'Test'
    },
    mcq:{
            submitted:{
                type:Boolean,
                default:false
            },
            problems:[{
                question:{
                    type:Schema.Types.ObjectId,
                    ref:'TestQuestionMCQ'
                },
                response:{
                    type:String,
                    default:""
                },
                securedMarks:{
                    type:Number,
                    default:0
                }
            }]
        },
    trueFalse:{
            submitted:{
                type:Boolean,
                default:false
            },
            problems:[{
                question:{
                    type:Schema.Types.ObjectId,
                    ref:'TestQuestionTrueFalse'
                },
                response:{
                    type:Boolean
                },
                securedMarks:{
                    type:Number,
                    default:0
                }
            }]
        },
    codingQuestion:{
        submitted:{
            type:Boolean,
            default:false
        },
        problems:[{
            question:{
                type:Schema.Types.ObjectId,
                ref:'TestQuestionMCQ'
            },
            response:{
                type:String,
                default:""
            },
            securedMarks:{
                type:Number,
                default:0
            }
        }]
    }
});

const UserTestRecord = mongoose.model('UserTestRecord',UserTestRecord);

module.exports = UserTestRecord;