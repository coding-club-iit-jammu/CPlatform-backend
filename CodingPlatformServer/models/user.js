const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
      type: String,
      required: true
  },
  branch: {
      type: String,
      required: true
  },
  courses: {
      teaching: [{
                  courseId:
                    { 
                      type: Schema.Types.ObjectId, 
                      ref:'Course'
                    },
                  code:
                    { 
                      type: String
                    },
                  title:
                  { 
                    type: String
                  },
                  practice:
                  {
                    record:{
                    type:Schema.Types.ObjectId,
                    ref:"UserPracticeRecord"
                    },
                    solvedQuestions:[{
                      type:Schema.Types.ObjectId
                    }]
                  }
                }],
      teachingAssistant: [{
                            courseId:
                              { 
                                type: Schema.Types.ObjectId, 
                                ref:'Course'
                              },
                            code:
                              { 
                                type: String
                              },
                            title:
                            { 
                              type: String
                            },
                            practice:
                            {
                              record:{
                              type:Schema.Types.ObjectId,
                              ref:"UserPracticeRecord"
                              },
                              solvedQuestions:[{
                                type:Schema.Types.ObjectId
                              }]
                            }
                          }],
      studying: [{
                  courseId:
                    { 
                      type: Schema.Types.ObjectId, 
                      ref:'Course'
                    },
                  code:
                    { 
                      type: String,
                      required: true
                    },
                  title:
                    { 
                      type: String,
                      required: true
                    },
                  groupId:
                    {
                      type: String,
                      required: true
                    },
                  practice:
                  {
                    record:{
                    type:Schema.Types.ObjectId,
                    ref:"UserPracticeRecord"
                    },
                    solvedQuestions:[{
                      type:Schema.Types.ObjectId
                    }]
                  }
                }]
  }
});

userSchema.methods.addTeachingCourse = function(courseId,code,title){
  this.courses.teaching.push({
    courseId : courseId,
    code: code,
    title:title
  });
  return this.save();
}

userSchema.methods.addTACourse = function(courseId,code,title){
  this.courses.teachingAssistant.push({
    courseId : courseId,
    code: code,
    title:title
  });
  return this.save();
}

userSchema.methods.addStudyingCourse = function(courseId,code,title,groupId){
  this.courses.studying.push({
    courseId : courseId,
    code: code,
    title:title,
    groupId: groupId
  });
  return this.save();
}

const User = mongoose.model('User', userSchema);

module.exports = User;