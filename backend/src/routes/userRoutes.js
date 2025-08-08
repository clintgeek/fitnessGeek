const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.js');
const logger = require('../config/logger.js');

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * GET /api/users/profile
 * Get user profile information
 */
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user from database
    const User = require('../models/User.js');
    const user = await User.findById(userId).select('username email age height gender');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    logger.info('User profile retrieved', {
      userId,
      hasAge: !!user.age,
      hasHeight: !!user.height,
      hasGender: !!user.gender
    });

    res.json({
      success: true,
      data: {
        username: user.username,
        email: user.email,
        age: user.age,
        height: user.height,
        gender: user.gender
      }
    });

  } catch (error) {
    logger.error('Failed to get user profile', {
      userId: req.user.id,
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get user profile',
        code: 'PROFILE_RETRIEVAL_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * PUT /api/users/profile
 * Update user profile information
 */
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, age, height, gender } = req.body;
    
    // Validate input
    const updates = {};
    if (username !== undefined) updates.username = username;
    if (email !== undefined) updates.email = email;
    if (age !== undefined) updates.age = age;
    if (height !== undefined) updates.height = height;
    if (gender !== undefined) updates.gender = gender;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No valid fields to update',
          code: 'NO_VALID_FIELDS'
        }
      });
    }

    // Update user in database
    const User = require('../models/User.js');
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('username email age height gender');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    logger.info('User profile updated', {
      userId,
      updatedFields: Object.keys(updates)
    });

    res.json({
      success: true,
      data: {
        username: user.username,
        email: user.email,
        age: user.age,
        height: user.height,
        gender: user.gender
      }
    });

  } catch (error) {
    logger.error('Failed to update user profile', {
      userId: req.user.id,
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update user profile',
        code: 'PROFILE_UPDATE_ERROR',
        details: error.message
      }
    });
  }
});

module.exports = router;
