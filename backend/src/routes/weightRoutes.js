const express = require('express');
const router = express.Router();

/**
 * @route GET /api/weight
 * @desc Get weight entries
 * @access Private
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Weight tracking endpoint - coming soon',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;