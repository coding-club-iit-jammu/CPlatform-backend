const express = require('express');
const path = require('path');
const multer  = require('multer')

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null,path.join(__dirname,'..','uploads'));
     },
    filename: function (req, file, cb) {
        cb(null, file.originalname.split('.')[0] + '-' + Date.now() + '.' +file.originalname.split('.')[1])
    }
});

var upload = multer({ storage : storage});
const isAuth = require('../middleware/is-auth');
const isInstructor = require('../middleware/is-instructor');
const getRole = require('../middleware/get-role');
const isNotStudent = require('../middleware/is-not-student');
const isStudent = require('../middleware/is-student');

const courseController = require('../controllers/course');
const assignmentController = require('../controllers/assignment');

const router = express.Router();

router.post('/add', isAuth, courseController.addCourse);
router.post('/join', isAuth, courseController.joinCourse);
router.post('/addPost', isAuth, upload.single('file'), getRole, courseController.addPost);
router.post('/addAssignment', isAuth, upload.single('file'), getRole,
                            isNotStudent, courseController.addAssignment);

router.post('/submitAssignment', isAuth, upload.single('file'), getRole,
                            isStudent, assignmentController.submitAssignment);

router.get('/getInfo', isAuth, getRole, courseController.getCourseInfo);
router.get('/getPosts', isAuth, getRole, courseController.getPosts);
router.get('/getTests', isAuth, getRole, courseController.getTests);

router.get('/getAssignments', isAuth, getRole, courseController.getAssignments);
router.get('/getAssignmentDoc', isAuth, getRole, assignmentController.getAssignmentDoc);
router.get('/getAssignmentSubmission', isAuth, getRole, isStudent, assignmentController.getAssignmentSubmission);

router.get('/getJoiningCodes', isAuth, getRole, isInstructor, courseController.getJoiningCodes);

module.exports = router;