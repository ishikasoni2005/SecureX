const express = require('express');
const router = express.Router();
const { transcribe, scoreFraud, predictSpam } = require('../controllers/ai');

// POST /api/v1/ai/transcribe
router.post('/transcribe', transcribe);

// POST /api/v1/ai/fraud/score
router.post('/fraud/score', scoreFraud);
router.post('/spam/predict', predictSpam);

module.exports = router;


