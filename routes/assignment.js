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

const assignmentController = require('../controllers/assignment');

const router = express.Router();

router.get('/getAllSubmissions',isAuth, getRole, isNotStudent, assignmentController.getAllAssignmentSubmissions);

router.post('/shiftDeadline', isAuth, getRole, isInstructor, assignmentController.shiftDeadline);

router.post('/uploadMarks', isAuth, upload.single('file'), getRole, isNotStudent, assignmentController.uploadMarks);

module.exports = router;