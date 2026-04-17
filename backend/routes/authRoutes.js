const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, githubLogin } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/github', githubLogin);
router.get('/me', protect, getMe);

module.exports = router;
