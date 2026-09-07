const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

// Mount GET and PUT for user condition profile
router.get('/', authenticate, authController.getProfile);
router.put('/', authenticate, authController.updateProfile);

module.exports = router;
