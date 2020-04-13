const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required:true
    },
    by:{
        type: String,
        required : true
    },
    date:{
        type:Date,
        required:true
    }
})

module.exports = mongoose.model("Post",postSchema);