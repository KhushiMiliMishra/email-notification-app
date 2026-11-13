const express = require('express');
const router = express.Router();
const healthRoutes = require('./healthRoutes');
const emailRoutes = require('./emailRoutes');

router.use('/health', healthRoutes);
router.use('/email', emailRoutes);

module.exports = router;
