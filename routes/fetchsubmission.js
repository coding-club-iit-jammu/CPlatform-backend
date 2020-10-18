const express = require('express');
const path = require('path');
const isAuth = require('../middleware/is-auth');
const codeofIDEController = require('../controllers/CodeofIDE');
const router = express.Router();

router.get('/fetchsubmission',isAuth, codeofIDEController.fetchPrevSubmission);
router.put('/updatesubmission',isAuth, codeofIDEController.updatePrevSubmission);
module.exports = router;
