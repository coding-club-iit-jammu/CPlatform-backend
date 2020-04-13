const express = require('express');

const isAuth = require('../middleware/is-auth');
const isEnrol = require('../middleware/is-enrol');
const isInstructor = require('../middleware/is-instructor');
const verifyRole = require('../middleware/verify-role');

const courseController = require('../controllers/course');

const router = express.Router();

router.post('/add', isAuth, courseController.addCourse);
router.post('/join', isAuth, courseController.joinCourse);
router.post('/addPost', isAuth, isEnrol, courseController.addPost);

router.get('/getInfo', isAuth, verifyRole, courseController.getCourseInfo);
router.get('/getPosts', isAuth, isEnrol, courseController.getPosts);
router.get('/getTests', isAuth, verifyRole, courseController.getTests);
router.get('/getAssignments', isAuth, verifyRole, courseController.getAssignments);
router.get('/getJoiningCodes', isAuth, isInstructor, courseController.getJoiningCodes);

module.exports = router;