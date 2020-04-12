const mongoose = require('mongoose');

const schema = mongoose.Schema;

const postSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required:true
    },
    file:[],
    by:{
        type:String,
        required:true
    },
    audience:[],
    date:{
        type:Date,
        required:true
    }
})

module.exports = mongoose.model("Post",courseSchema);