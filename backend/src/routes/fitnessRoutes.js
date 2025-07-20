const express = require('express');
const router = express.Router();

/**
 * @route GET /api/fitness/garmin/status
 * @desc Get Garmin connection status
 * @access Private
 */
router.get('/garmin/status', (req, res) => {
  res.json({
    success: true,
    message: 'Garmin status endpoint - coming soon',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;