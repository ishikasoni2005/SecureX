const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Start a call: notify clients to begin STT capture
router.post('/start', protect, (req, res) => {
  const { room = 'global', metadata = {} } = req.body || {};
  req.io.to(room).emit('call_start', { room, metadata, startedAt: Date.now() });
  return res.status(200).json({ success: true });
});

// End a call: notify clients to stop STT and finalize transcript
router.post('/end', protect, (req, res) => {
  const { room = 'global', metadata = {} } = req.body || {};
  req.io.to(room).emit('call_end', { room, metadata, endedAt: Date.now() });
  return res.status(200).json({ success: true });
});

module.exports = router;


