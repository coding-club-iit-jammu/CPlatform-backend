const express = require('express');

const isAuth = require('../middleware/is-auth');

const courseController = require('../controllers/course');

const router = express.Router();

router.post('/add', isAuth, courseController.addCourse);
router.post('/join', isAuth, courseController.joinCourse);


module.exports = router;