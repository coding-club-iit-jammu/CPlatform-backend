const express = require('express');
const router = express.Router();

const isAuth = require('../middleware/is-auth');
const getRole = require('../middleware/get-role');
const isNotStudent = require('../middleware/is-not-student');
const isStudent = require('../middleware/is-student');
const isTestEnrolled = require('../middleware/is-test-enrolled');
const isWithinDuration = require('../middleware/is-within-test-duration');
const testController = require('../controllers/test');

router.get('/getTitles',isAuth,getRole,testController.getTestsTitles);
router.post('/create',isAuth,getRole,isNotStudent,testController.createTest);
router.post('/addQuestion',isAuth,getRole,isNotStudent, testController.addQuestion);
router.post('/saveTestData',isAuth,getRole,isNotStudent,testController.saveTestData);
router.post('/startTest',isAuth,getRole,isNotStudent,testController.startTest);
router.post('/joinTest',isAuth,getRole,isStudent,isTestEnrolled,testController.joinTest);
router.post('/submitSection',isAuth,getRole,isStudent,testController.submitSection);
router.post('/endTest',isAuth,getRole,isStudent,testController.endTest);

router.get('/getTestData',isAuth,getRole,isNotStudent,testController.getTestData);
router.get('/getQuestions',isAuth,getRole,isStudent,testController.getQuestions);
module.exports = router;