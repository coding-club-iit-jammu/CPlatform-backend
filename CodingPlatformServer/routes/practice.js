const express = require('express');
const router = express.Router();

const isAuth = require('../middleware/is-auth');
const getRole = require('../middleware/get-role');
const getSolvedQuestions = require('../middleware/get-solved-questions');
const practiceController = require('../controllers/practice');

router.get('/getMCQ',isAuth,getRole,getSolvedQuestions,practiceController.getMCQ);
router.get('/getTrueFalse',isAuth,getRole,getSolvedQuestions,practiceController.getTrueFalse);
router.get('/getCodingQuestion',isAuth,getRole,getSolvedQuestions,practiceController.getCodingQuestion);


module.exports = router;