const express = require('express')
const path = require('path');

const authController = require('../controllers/auth');

const router = express.Router();

router.post("/login",authController.login);
router.post("/refreshToken",authController.refreshToken);
router.post("/createUser",authController.createUser);
router.post("/changePassword",authController.changePassword);
router.post("/changePasswordEmail",authController.changePasswordEmail);
router.post("/verify",authController.verify);

module.exports = router;