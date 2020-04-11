const express = require('express');

const router = express.Router();

const isAuth = require('../middleware/is-auth');
const userController = require('../controllers/user');

router.get('/get', isAuth, userController.getUserData);

module.exports = router;