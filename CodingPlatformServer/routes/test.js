const express = require('express');
const router = express.Router();

const isAuth = require('../middleware/is-auth');
const getRole = require('../middleware/get-role');
const isNotStudent = require('../middleware/is-not-student');

const testController = require('../controllers/test');

router.get('/getTitles',isAuth,getRole,testController.getTestsTitles);
router.post('/create',isAuth,getRole,isNotStudent,testController.createTest);
router.post('/addQuestion',isAuth,getRole,isNotStudent, testController.addQuestion);
router.post('/saveTestData',isAuth,getRole,isNotStudent,testController.saveTestData);

router.get('/getTestData',isAuth,getRole,isNotStudent,testController.getTestData);
module.exports = router;