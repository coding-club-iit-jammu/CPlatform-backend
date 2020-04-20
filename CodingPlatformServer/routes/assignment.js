const express = require('express');
const path = require('path');

const isAuth = require('../middleware/is-auth');
const isInstructor = require('../middleware/is-instructor');
const getRole = require('../middleware/get-role');
const isNotStudent = require('../middleware/is-not-student');
const isStudent = require('../middleware/is-student');

const assignmentController = require('../controllers/assignment');

const router = express.Router();

router.get('/getAllSubmissions',isAuth,getRole,isNotStudent,assignmentController.getAllAssignmentSubmissions);

router.post('/shiftDeadline', isAuth, getRole,
                            isInstructor, assignmentController.shiftDeadline);

module.exports = router;