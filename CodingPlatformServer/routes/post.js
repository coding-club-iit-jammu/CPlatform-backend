const express = require('express');

const isAuth = require('../middleware/is-auth');
const getRole = require('../middleware/get-role');

const postController = require('../controllers/post');

const router = express.Router();

router.get('/getResource', isAuth, getRole, postController.getResource);

module.exports = router;