const Post = require('../models/post');
const Course = require('../models/course');

exports.getResource = (req,res,next) => {
    const postId = req.query.postId;
    const courseId = req.courseId;

    Course.findById(courseId)
        .populate({
            path:'posts',
            model:'Post',
            match:{
                _id : postId
            }
        })
        .then((course)=>{
        if(!course){

            return;
        }
        
        const post = course['posts'][0];
        if(!post){
            res.status(404).json({message:'Post not found.'});
            return;
        }

        res.download(post.file,(error)=>{
            if(error){
                console.log(error);
                res.status(404).json({message:'Try Again.'});
                return;   
            }
        })

    });
}