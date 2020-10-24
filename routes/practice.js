const express = require('express');
const router = express.Router();

const isAuth = require('../middleware/is-auth');
const getRole = require('../middleware/get-role');
const getSolvedQuestions = require('../middleware/get-solved-questions');
const isAnswerCorrect = require('../middleware/practice-evaluation/is-answer-correct');
const updateSolvedList = require('../middleware/practice-evaluation/update-solved-list');
const practiceController = require('../controllers/practice');
const getPracticeSubmission = require('../middleware/get-practice-submission');

router.get('/getMCQ',isAuth,getRole,getSolvedQuestions,practiceController.getMCQ);
router.get('/getTrueFalse',isAuth,getRole,getSolvedQuestions,practiceController.getTrueFalse);
router.get('/getCodingQuestion',isAuth,getRole,getSolvedQuestions,practiceController.getCodingQuestion);

router.post('/submitMCQ',isAuth,getRole,isAnswerCorrect,updateSolvedList,practiceController.submitMCQ);
router.post('/submitTrueFalse',isAuth,getRole,isAnswerCorrect,updateSolvedList,practiceController.submitTrueFalse);
router.post('/submitCodingQuestion',isAuth,getRole,isAnswerCorrect,updateSolvedList,practiceController.submitCodingQuestion);
router.get('/leaderboard',isAuth,getRole,practiceController.getLeaderboard);
router.get('/getprevsubmission',isAuth,getRole,getPracticeSubmission,practiceController.getPrevsubmission);
module.exports = router;