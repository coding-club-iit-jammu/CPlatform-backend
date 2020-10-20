const express = require('express');
const path = require('path');
const codeofIDEController = require('../controllers/CodeofIDE');
const isAuth = require('../middleware/is-auth');
const router = express.Router();

router.get('/getidecode',isAuth, codeofIDEController.getCode);
router.post('/saveidecode',isAuth, codeofIDEController.saveCode);
router.put('/autosaveidecode',isAuth, codeofIDEController.autosave);

module.exports = router;
