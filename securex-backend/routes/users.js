const express = require('express');
const router = express.Router();

// GET /api/v1/users/profile
router.get('/profile', (req, res) => {
  res.json({
    success: true,
    data: {
      id: '1',
      username: 'admin',
      email: 'admin@securex.com',
      role: 'administrator',
      lastLogin: new Date().toISOString()
    }
  });
});

// GET /api/v1/users
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        username: 'admin',
        email: 'admin@securex.com',
        role: 'administrator'
      },
      {
        id: '2',
        username: 'analyst',
        email: 'analyst@securex.com',
        role: 'analyst'
      }
    ]
  });
});

module.exports = router;
