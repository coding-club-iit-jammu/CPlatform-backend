const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
    refreshToken:{
        type:String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref:'User'
    }
});

const Token = mongoose.model('Token',tokenSchema);
module.exports = Token;