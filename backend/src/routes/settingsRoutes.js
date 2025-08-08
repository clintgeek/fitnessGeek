const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const UserSettings = require('../models/UserSettings');
const logger = require('../config/logger');

// Apply authentication to all routes
router.use(authenticateToken);

// GET /api/settings - Get user settings
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;

    const settings = await UserSettings.getOrCreate(userId);

    logger.info('User settings retrieved', { userId });

    res.json({
      success: true,
      data: settings
    });

  } catch (error) {
    logger.error('Error getting user settings:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve user settings',
        code: 'SETTINGS_RETRIEVAL_ERROR'
      }
    });
  }
});

// PUT /api/settings - Update user settings
router.put('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // Validate update data structure
    const allowedFields = [
      'dashboard',
      'theme',
      'notifications',
      'units',
      'ai',
      'nutrition_goal'
    ];

    const validUpdateData = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        validUpdateData[field] = updateData[field];
      }
    });

    const settings = await UserSettings.updateSettings(userId, validUpdateData);

    logger.info('User settings updated', {
      userId,
      updatedFields: Object.keys(validUpdateData)
    });

    res.json({
      success: true,
      data: settings,
      message: 'Settings updated successfully'
    });

  } catch (error) {
    logger.error('Error updating user settings:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update user settings',
        code: 'SETTINGS_UPDATE_ERROR'
      }
    });
  }
});

// PUT /api/settings/ai - Update AI settings specifically
router.put('/ai', async (req, res) => {
  try {
    const userId = req.user.id;
    const aiSettings = req.body;

    // Validate AI settings structure
    const allowedAIFields = [
      'enabled',
      'features'
    ];

    const validAISettings = {};
    allowedAIFields.forEach(field => {
      if (aiSettings[field] !== undefined) {
        validAISettings[field] = aiSettings[field];
      }
    });

    const settings = await UserSettings.updateSettings(userId, {
      ai: validAISettings
    });

    logger.info('AI settings updated', {
      userId,
      aiSettings: validAISettings
    });

    res.json({
      success: true,
      data: settings.ai,
      message: 'AI settings updated successfully'
    });

  } catch (error) {
    logger.error('Error updating AI settings:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update AI settings',
        code: 'AI_SETTINGS_UPDATE_ERROR'
      }
    });
  }
});

// PUT /api/settings/dashboard - Update dashboard settings specifically
router.put('/dashboard', async (req, res) => {
  try {
    const userId = req.user.id;
    const dashboardSettings = req.body;

    // Validate dashboard settings
    const allowedDashboardFields = [
      'show_current_weight',
      'show_blood_pressure',
      'show_calories_today',
      'show_login_streak',
      'show_nutrition_today',
      'show_quick_actions',
      'show_weight_goal',
      'show_nutrition_goal',
      'card_order'
    ];

    const validDashboardSettings = {};
    allowedDashboardFields.forEach(field => {
      if (dashboardSettings[field] !== undefined) {
        validDashboardSettings[field] = dashboardSettings[field];
      }
    });

    const settings = await UserSettings.updateSettings(userId, {
      dashboard: validDashboardSettings
    });

    logger.info('Dashboard settings updated', {
      userId,
      dashboardSettings: validDashboardSettings
    });

    res.json({
      success: true,
      data: settings.dashboard,
      message: 'Dashboard settings updated successfully'
    });

  } catch (error) {
    logger.error('Error updating dashboard settings:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update dashboard settings',
        code: 'DASHBOARD_SETTINGS_UPDATE_ERROR'
      }
    });
  }
});

module.exports = router;