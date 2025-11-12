// AI Controller: Whisper transcription proxy

exports.transcribe = async (req, res) => {
  try {
    const { audioBase64, mimeType } = req.body || {};

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'OPENAI_API_KEY is not configured on the server'
      });
    }

    if (!audioBase64 || !mimeType) {
      return res.status(400).json({
        success: false,
        error: 'audioBase64 and mimeType are required'
      });
    }

    // Decode base64 into a Buffer
    const buffer = Buffer.from(audioBase64, 'base64');

    // Use Web APIs available in Node 18+ (Blob, File, FormData, fetch)
    const blob = new Blob([buffer], { type: mimeType });
    const file = new File([blob], 'audio.webm', { type: mimeType });

    const form = new FormData();
    form.append('file', file);
    form.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: form
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ success: false, error: text });
    }

    const data = await response.json();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Fraud/threat risk scoring endpoint
const { scoreEvent } = require('../utils/fraudModel');

exports.scoreFraud = async (req, res) => {
  try {
    const { features = {}, baselines = {} } = req.body || {};
    const score = scoreEvent(features, baselines);
    const label = score >= 0.85 ? 'critical' : score >= 0.7 ? 'high' : score >= 0.45 ? 'medium' : 'low';
    return res.status(200).json({ success: true, score, label });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Proxy to Python spam detector (Flask) at http://localhost:8001/predict
exports.predictSpam = async (req, res) => {
  try {
    const { texts } = req.body || {};
    if (!Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({ success: false, error: 'texts array is required' });
    }
    const base = process.env.SPAM_SERVICE_URL || 'http://localhost:8001';
    const response = await fetch(`${base}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts })
    });
    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ success: false, error: text });
    }
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};


