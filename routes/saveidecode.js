const express = require('express');
const path = require('path');
const CodeofIDEController = require('../controllers/CodeofIDE');
const router = express.Router();

router.post('/saveidecode',CodeofIDEController.saveCode);
module.exports = router;