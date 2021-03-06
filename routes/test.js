const express = require('express');
const router = express.Router();

const isAuth = require('../middleware/is-auth');
const getRole = require('../middleware/get-role');
const isNotStudent = require('../middleware/is-not-student');
const isStudent = require('../middleware/is-student');
const isTestEnrolled = require('../middleware/is-test-enrolled');
const isWithinDuration = require('../middleware/is-within-test-duration');
const pastTestCompletion = require('../middleware/test-evaluation/past-test-completion');

const isAnswerCorrect = require('../middleware/test-evaluation/is-answer-correct');
const testController = require('../controllers/test');
const statsController = require('../controllers/test-statistics');

router.get('/getTitles',isAuth,getRole,testController.getTestsTitles);
router.post('/create',isAuth,getRole,isNotStudent,testController.createTest);
router.post('/addQuestion',isAuth,getRole,isNotStudent, testController.addQuestion);
router.post('/saveTestData',isAuth,getRole,isNotStudent,testController.saveTestData);
router.post('/startTest',isAuth,getRole,isNotStudent,testController.startTest);
router.post('/revealMarks',isAuth,getRole,isNotStudent,pastTestCompletion,testController.revealMarks);
router.post('/joinTest',isAuth,getRole,isStudent,isTestEnrolled,testController.joinTest);
router.post('/submitSection',isAuth,getRole,isStudent,isWithinDuration,testController.submitSection);
router.post('/submitQuestion',isAuth,getRole,isStudent,isWithinDuration,isAnswerCorrect,testController.submitQuestion);
router.post('/endTest',isAuth,getRole,isStudent,isWithinDuration,testController.endTest);

router.get('/getTestData',isAuth,getRole,isNotStudent,testController.getTestData);
router.get('/getQuestions',isAuth,getRole,isStudent,isWithinDuration,testController.getQuestions);
router.get('/getEndTime',isAuth,getRole,isStudent,isWithinDuration,testController.getEndTime);
router.get('/getInstructions',isAuth,getRole,isStudent,testController.getInstructions);
router.get('/getUserTestRecord',isAuth,getRole,isStudent,testController.getUserTestRecord);
router.get('/checkRevealMarks',isAuth,getRole,testController.checkRevealMarks);

router.get('/leaderboard',isAuth,getRole,isNotStudent,testController.getLeaderboard);
router.get('/getSpread',isAuth,getRole,isNotStudent,statsController.getMarksSpread);
router.get('/getQuestionWiseStats',isAuth,getRole,isNotStudent,statsController.getQuestionWiseStats);

module.exports = router;