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
        type: Date,
        required:true
    },
    file:{
        type: String
    },
    audience:{
        type:String,
        required:true
    }
})

postSchema.methods.addAudience = (aud)=>{
    this.audience.push(aud);
    return this.save();
}

module.exports = mongoose.model("Post",postSchema);