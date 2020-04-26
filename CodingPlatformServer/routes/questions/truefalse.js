const express = require('express');
const router = express.Router();

const isAuth = require('../../middleware/is-auth');
const getRole = require('../../middleware/get-role');
const isNotStudent = require('../../middleware/is-not-student');

const trueFalseController = require('../../controllers/questions/truefalse');

router.get('/getTrueFalse', isAuth, getRole, isNotStudent, trueFalseController.getTrueFalse);
router.post('/add', isAuth, getRole, isNotStudent, trueFalseController.addTrueFalse);

module.exports = router;