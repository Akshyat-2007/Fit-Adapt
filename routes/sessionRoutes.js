const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/complete', authenticate, sessionController.completeSession);

module.exports = router;
