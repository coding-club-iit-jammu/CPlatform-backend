const mongoose = require('mongoose');
const validator = require('validator');

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
    unique: true,
    lowercase: true,
    validate: (value) => {
      return validator.isEmail(value);
    }
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
                  },
                  tests:[
                    {
                      testId: {
                        type:Schema.Types.ObjectId,
                        ref:"Test"
                      },
                      record:{
                        type:Schema.Types.ObjectId,
                        ref:"UserTestRecord"
                      }
                    }
                  ]
                }]
  }
});

userSchema.methods.addTeachingCourse = function(courseId,code,title,practiceRecordId){
  this.courses.teaching.push({
    courseId : courseId,
    code: code,
    title:title,
    practice:{
      record:practiceRecordId,
      solvedQuestions:[]
    }
  });
  return this.save();
}

userSchema.methods.addTACourse = function(courseId,code,title,practiceRecordId){
  this.courses.teachingAssistant.push({
    courseId : courseId,
    code: code,
    title:title,
    practice:{
      record:practiceRecordId,
      solvedQuestions:[]
    }
  });
  return this.save();
}

userSchema.methods.addStudyingCourse = function(courseId,code,title,groupId,practiceRecordId){
  this.courses.studying.push({
    courseId : courseId,
    code: code,
    title:title,
    groupId: groupId,
    practice:{
      record:practiceRecordId,
      solvedQuestions:[]
    }
  });
  return this.save();
}

const User = mongoose.model('User', userSchema);

module.exports = User;