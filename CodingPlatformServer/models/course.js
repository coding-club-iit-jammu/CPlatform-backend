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
    groups:[{
        groupId:{
            type: String,
            required:true
        },
        students:[{ 
            type: Schema.Types.ObjectId,
            ref:'User'
        }]
    }],
    joiningCode: {
        instructor: {
            type: String,
            required: true
        },
        teachingAssistant: {
            type: String,
            required: true
        },
        groups: [{
            groupId:{
                type: String,
                required: true
            },
            code:{
                type: String,
                required: true
            }
        }]
    },
    tests:[{ type: Schema.Types.ObjectId, ref:'Test'}],
    posts:[{ type: Schema.Types.ObjectId, ref:'Post'}],
    assignments:[{ type: Schema.Types.ObjectId, ref:'Assignment'}],
    questions:{
        mcq:[
            {
                type: Schema.Types.ObjectId, 
                ref:'MCQ'
            }
        ],
        trueFalse:[
            {
                type: Schema.Types.ObjectId,
                ref:'TrueFalseQuestion'
            }
        ],
        codingQuestion:[
            {
                type: Schema.Types.ObjectId,
                ref:'CodingQuestion'
            }
        ]
    },
    practiceQuestions:{
        mcq:[
            {
                type: Schema.Types.ObjectId, 
                ref:'MCQ'
            }
        ],
        trueFalse:[
            {
                type: Schema.Types.ObjectId,
                ref:'TrueFalseQuestion'
            }
        ],
        codingQuestion:[
            {
                type: Schema.Types.ObjectId,
                ref:'CodingQuestion'
            }
        ]
    },
    practiceRecord:[{
        type: Schema.Types.ObjectId,
        ref:'UserPracticeRecord'
    }]
  
  })

courseSchema.methods.addInstructor = function(userId){
    this.instructors.push(userId);
    return this.save()
}

courseSchema.methods.addTA = function(userId){
    this.teachingAssistants.push(userId);
    return this.save()
}

courseSchema.methods.addStudent = function(userId,groupId){
    this.groups[parseInt(groupId.substring(1))-1].students.push(userId);
    return this.save()
}

courseSchema.methods.addGroups = function(groupIds){
    groupIds.sort();
    for(let x of groupIds){
        this.groups.push({
            groupId: groupId,
            students:[]
        });
    }
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

courseSchema.methods.addQuestionToPractice = function(questionId,questionType){
    this.practiceQuestions[questionType].push(questionId);
    return this.save();
}

courseSchema.methods.addMCQ = function(mcqId){
    this.questions.mcq.push(mcqId);
    return this.save();
}

courseSchema.methods.addTrueFalse = function(mcqId){
    this.questions.trueFalse.push(mcqId);
    return this.save();
}

courseSchema.methods.addCodingQuestion = function(mcqId){
    this.questions.codingQuestion.push(mcqId);
    return this.save();
}

const Course = mongoose.model("Course",courseSchema);
  

module.exports = Course;