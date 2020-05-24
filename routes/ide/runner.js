const express = require("express");
const router = express.Router();

const runnerController = require("../../controllers/ide/runner.js");

router.get('/langs', runnerController.getLanguages);
router.post('/run', runnerController.postCode);

module.exports = router;