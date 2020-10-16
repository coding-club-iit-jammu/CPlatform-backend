const express = require('express');
const path = require('path');
const CodeofIDEController = require('../controllers/CodeofIDE');
const router = express.Router();

router.put('/updatesubmission',CodeofIDEController.updatePrevSubmission);
module.exports = router;