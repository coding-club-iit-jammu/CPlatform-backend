const express = require('express');
const router = express.Router();

const isAuth = require('../../middleware/is-auth');
const getRole = require('../../middleware/get-role');
const isNotStudent = require('../../middleware/is-not-student');

const mcqController = require('../../controllers/questions/mcq');

router.get('/getMCQ', isAuth, getRole, isNotStudent, mcqController.getMCQ);

router.post('/add', isAuth, getRole, isNotStudent, mcqController.addMCQ);

module.exports = router;