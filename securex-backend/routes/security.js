const express = require('express');
const router = express.Router();

// GET /api/v1/security/stats
router.get('/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalThreats: 156,
      criticalThreats: 12,
      activeAlerts: 8,
      blockedAttacks: 1247,
      networkTraffic: 2.4,
      lastUpdated: new Date().toISOString()
    }
  });
});

// GET /api/v1/security/events
router.get('/events', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        type: 'Malware Detection',
        severity: 'high',
        timestamp: new Date().toISOString(),
        source: '192.168.1.100',
        status: 'active'
      },
      {
        id: '2',
        type: 'Suspicious Login',
        severity: 'medium',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        source: '10.0.0.50',
        status: 'investigating'
      }
    ]
  });
});

module.exports = router;
