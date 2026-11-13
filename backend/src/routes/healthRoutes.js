const express = require('express');
const router = express.Router();
const config = require('../config/environment');

/**
 * @route   GET /api/health
 * @desc    Application Health Check
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'UP',
    message: 'Backend service is healthy and operational.',
    timestamp: new Date().toISOString(),
    environment: config.env,
    uptime: `${Math.floor(process.uptime())} seconds`,
    version: '1.0.0'
  });
});

module.exports = router;
