const express = require('express')
const path = require('path');

const authController = require('../controllers/auth');

const router = express.Router();

router.post("/login",authController.login);
router.post("/createUser",authController.createUser);
router.post("/changePassword",authController.changePassword);

module.exports = router;