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
router.get('/getItem', isAuth, getRole, isNotStudent, codingController.getItem);

var cpUpload = upload.fields([{ name: 'testcases', maxCount: 1 }, { name: 'header', maxCount: 1 }, { name: 'footer', maxCount: 1 }, { name: 'mainCode', maxCount: 1}]);
router.post('/add', isAuth, cpUpload, getRole, isNotStudent, codingController.addCodingQuestion);
router.post('/edit', isAuth, cpUpload, getRole, isNotStudent, codingController.editCodingQuestion);

router.delete('/delete',isAuth,getRole,isNotStudent,codingController.deleteCoding);

module.exports = router;