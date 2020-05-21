const express = require('express');
const router = express.Router();

const isAuth = require('../middleware/is-auth');
const getRole = require('../middleware/get-role');
const getSolvedQuestions = require('../middleware/get-solved-questions');
const isAnswerCorrect = require('../middleware/practice-evaluation/is-answer-correct');
const updateSolvedList = require('../middleware/practice-evaluation/update-solved-list');
const practiceController = require('../controllers/practice');

router.get('/getMCQ',isAuth,getRole,getSolvedQuestions,practiceController.getMCQ);
router.get('/getTrueFalse',isAuth,getRole,getSolvedQuestions,practiceController.getTrueFalse);
router.get('/getCodingQuestion',isAuth,getRole,practiceController.getCodingQuestion);

router.post('/submitMCQ',isAuth,getRole,isAnswerCorrect,updateSolvedList,practiceController.submitMCQ);
router.post('/submitTrueFalse',isAuth,getRole,isAnswerCorrect,updateSolvedList,practiceController.submitTrueFalse);
router.get('/leaderboard',isAuth,getRole,practiceController.getLeaderboard);
module.exports = router;