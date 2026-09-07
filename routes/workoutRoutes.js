const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/today', authenticate, workoutController.getTodayWorkout);

module.exports = router;
