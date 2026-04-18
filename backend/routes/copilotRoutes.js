const express = require('express');
const {
    analyzeResume,
    generateSuggestions,
    optimizeResume,
    predictInterview,
    extractJobFromUrl,
} = require('../controllers/copilotController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/analyze-resume', analyzeResume);
router.post('/generate-suggestions', generateSuggestions);
router.post('/optimize-resume', optimizeResume);
router.post('/predict-interview', predictInterview);
router.post('/extract-job', extractJobFromUrl);

module.exports = router;
