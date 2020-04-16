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
const isEnrol = require('../middleware/is-enrol');
const isInstructor = require('../middleware/is-instructor');
const verifyRole = require('../middleware/verify-role');

const courseController = require('../controllers/course');

const router = express.Router();

router.post('/add', isAuth, courseController.addCourse);
router.post('/join', isAuth, courseController.joinCourse);
router.post('/addPost', isAuth, isEnrol, courseController.addPost);
router.post('/addAssignment', isAuth, upload.single('file'), isInstructor, courseController.addAssignment);

router.get('/getInfo', isAuth, verifyRole, courseController.getCourseInfo);
router.get('/getPosts', isAuth, isEnrol, courseController.getPosts);
router.get('/getTests', isAuth, verifyRole, courseController.getTests);
router.get('/getAssignments', isAuth, verifyRole, courseController.getAssignments);
router.get('/getJoiningCodes', isAuth, isInstructor, courseController.getJoiningCodes);

module.exports = router;