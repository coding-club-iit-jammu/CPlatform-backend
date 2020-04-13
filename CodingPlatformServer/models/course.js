const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const courseSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    code:{
        type: String,
        required:true,
        unique: true
    },
    instructors:[{ type: Schema.Types.ObjectId, ref:'User'}],
    teachingAssistants:[{ type: Schema.Types.ObjectId, ref:'User'}],
    students:[{ type: Schema.Types.ObjectId, ref:'User'}],
    joiningCode: {
        instructor: {
            type: String,
            required: true
        },
        teachingAssistant: {
            type: String,
            required: true
        },
        student: {
            type: String,
            required: true
        }
    },
    tests:[{ type: Schema.Types.ObjectId, ref:'Test'}],
    posts:[{ type: Schema.Types.ObjectId, ref:'Post'}],
    assignments:[{ type: Schema.Types.ObjectId, ref:'Assignment'}]
  
  })

courseSchema.methods.addInstructor = function(userId){
    this.instructors.push(userId);
    return this.save()
}

courseSchema.methods.addTA = function(userId){
    this.teachingAssistants.push(userId);
    return this.save()
}

courseSchema.methods.addStudent = function(userId){
    this.students.push(userId);
    return this.save()
}

courseSchema.methods.addPost = function(postId){
    this.posts.push(postId);
    return this.save()
}

courseSchema.methods.addTest = function(testId){
    this.tests.push(testId);
    return this.save()
}

courseSchema.methods.addAssignment = function(assignmentId){
    this.assignments.push(assignmentId)
    return this.save()
}

const Course = mongoose.model("Course",courseSchema);
  

module.exports = Course;