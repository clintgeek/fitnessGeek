const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Get user goals
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;

    // TODO: Get goals from database
    // For now, return empty goals structure
    const goals = {
      nutrition: {
        trackMacros: false,
        goals: {}
      },
      weight: null
    };

    res.json({
      success: true,
      data: goals
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch goals',
        code: 'GOALS_FETCH_ERROR'
      }
    });
  }
});

// Save user goals
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { nutrition, weight } = req.body;

    // Validate the request structure
    if (!nutrition && !weight) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'At least nutrition or weight goals must be provided',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    // TODO: Save goals to database
    console.log('Saving goals for user:', userId, { nutrition, weight });

    res.json({
      success: true,
      message: 'Goals saved successfully',
      data: { nutrition, weight }
    });
  } catch (error) {
    console.error('Error saving goals:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to save goals',
        code: 'GOALS_SAVE_ERROR'
      }
    });
  }
});

module.exports = router;