const express = require('express');
const router = express.Router();
const checkinController = require('../controllers/checkinController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/', authenticate, checkinController.submitCheckin);
router.get('/today', authenticate, checkinController.getTodayCheckin);
router.get('/history', authenticate, checkinController.getCheckinHistory);

module.exports = router;
