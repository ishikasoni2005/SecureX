const express = require('express');
const router = express.Router();

// GET /api/v1/system/health
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  });
});

// GET /api/v1/system/metrics
router.get('/metrics', (req, res) => {
  res.json({
    success: true,
    data: {
      cpu: {
        usage: 45.2,
        cores: 8
      },
      memory: {
        used: 2048,
        total: 8192,
        percentage: 25
      },
      disk: {
        used: 120,
        total: 500,
        percentage: 24
      },
      network: {
        bytesIn: 1024000,
        bytesOut: 512000
      }
    }
  });
});

module.exports = router;
