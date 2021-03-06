const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const testRecordSchema = new Schema({
    userId:{
        type: Schema.Types.ObjectId,
        ref:'User'
    },
    testId:{
        type: Schema.Types.ObjectId,
        ref:'Test'
    },
    ended:{
        type:Boolean,
        default:false
    },
    securedMarks:{
        type: Number,
        default: 0
    },
    mcq:{
            submitted:{
                type:Boolean,
                default:false
            },
            problems:[{
                question:{
                    type:Schema.Types.ObjectId,
                    ref:'MCQ'
                },
                marks:{
                    type:Number,
                    default:0
                },
                response:{
                    type:String,
                    default:""
                },
                securedMarks:{
                    type:Number,
                    default:0
                },
                submitted:{
                    type: Boolean,
                    default: false
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
                    ref:'TrueFalseQuestion'
                },
                marks:{
                    type:Number,
                    default:0
                },
                response:{
                    type:Boolean
                },
                securedMarks:{
                    type:Number,
                    default:0
                },
                submitted:{
                    type: Boolean,
                    default: false
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
                ref:'CodingQuestion'
            },
            marks:{
                type:Number,
                default:0
            },
            response:{
                type:String,
                default:""
            },
            securedMarks:{
                type:Number,
                default:0
            },
            visited:{
                type:Boolean,
                default:false
            },
            submitted:{
                type: Boolean,
                default: false
            }
        }]
    }
});

const UserTestRecord = mongoose.model('UserTestRecord',testRecordSchema);

module.exports = UserTestRecord;