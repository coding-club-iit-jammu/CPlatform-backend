const path = require('path');
const express = require('express');
const router = express.Router();

const isAuth = require('../../middleware/is-auth');
const getRole = require('../../middleware/get-role');
const isNotStudent = require('../../middleware/is-not-student');

const multer  = require('multer')

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null,path.join(__dirname,'..','..','uploads'));
     },
    filename: function (req, file, cb) {
        cb(null, file.originalname.split('.')[0] + '-' + Date.now() + '.' +file.originalname.split('.')[1])
    }
});

var upload = multer({ storage : storage});

const codingController = require('../../controllers/questions/coding-question');

router.get('/getCodingQuestions', isAuth, getRole, isNotStudent, codingController.getCodingQuestions);
router.get('/getTestCases', isAuth, getRole, isNotStudent, codingController.getTestCases);

router.post('/add', isAuth, upload.single('file'), getRole, isNotStudent, codingController.addCodingQuestion);
router.post('/edit', isAuth, upload.single('file'), getRole, isNotStudent, codingController.editCodingQuestion);

module.exports = router;