const express = require('express');
const router = express.Router();

const isAuth = require('../middleware/is-auth');
const getRole = require('../middleware/get-role');

const practiceController = require('../controllers/practice');

router.get('/getMCQ',isAuth,getRole,practiceController.getMCQ);
router.get('/getTrueFalse',isAuth,getRole,practiceController.getTrueFalse);
router.get('/getCodingQuestion',isAuth,getRole,practiceController.getCodingQuestion);


module.exports = router;