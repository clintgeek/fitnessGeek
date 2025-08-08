const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const FoodLog = require('../models/FoodLog');
const FoodItem = require('../models/FoodItem');
const DailySummary = require('../models/DailySummary');
const logger = require('../config/logger');

// Apply authentication to all routes
router.use(authenticateToken);

// Parse YYYY-MM-DD as local date to avoid UTC shift
function parseLocalDate(input) {
  if (typeof input === 'string') {
    const [y, m, d] = input.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  }
  return new Date(input);
}

// GET /api/logs - Get food logs for a date
router.get('/', async (req, res) => {
  try {
    const { date, meal_type } = req.query;
    const userId = req.user.id;

    let logs;

    if (date) {
      if (meal_type) {
        // Get logs for specific meal type on specific date
        logs = await FoodLog.getLogsByMealType(userId, meal_type, date);
      } else {
        // Get all logs for specific date
        logs = await FoodLog.getLogsForDate(userId, date);
      }
    } else {
      // Get recent logs (last 10)
      logs = await FoodLog.getRecentLogs(userId, 10);
    }

    logger.info('Food logs retrieved', {
      userId,
      count: logs.length,
      date: date || 'recent',
      mealType: meal_type || 'all'
    });

    res.json({
      success: true,
      data: logs
    });

  } catch (error) {
    logger.error('Error getting food logs:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve food logs',
        code: 'LOG_RETRIEVAL_ERROR'
      }
    });
  }
});

// GET /api/logs/:id - Get single food log
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const log = await FoodLog.findOne({
      _id: id,
      user_id: userId
    }).populate('food_item_id');

    if (!log) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Food log not found',
          code: 'LOG_NOT_FOUND'
        }
      });
    }

    logger.info('Food log retrieved', { userId, logId: id });

    res.json({
      success: true,
      data: log
    });

  } catch (error) {
    logger.error('Error getting food log:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve food log',
        code: 'LOG_RETRIEVAL_ERROR'
      }
    });
  }
});

// POST /api/logs - Create new food log
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      food_item,
      log_date,
      meal_type,
      servings,
      notes,
      nutrition
    } = req.body;

    // Validate required fields
    if (!food_item || !log_date || !meal_type || !servings) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Food item, log date, meal type, and servings are required',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    // Validate meal type
    const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    if (!validMealTypes.includes(meal_type)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid meal type',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    // Find or create food item
    let foodItem;
    if (food_item._id) {
      // Use existing food item
      foodItem = await FoodItem.findById(food_item._id);
      if (!foodItem || foodItem.is_deleted) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Food item not found',
            code: 'FOOD_NOT_FOUND'
          }
        });
      }
    } else {
      // Create new food item
      foodItem = await FoodItem.findOrCreate(food_item, userId);
    }

    // Create food log
    const log = new FoodLog({
      user_id: userId,
      food_item_id: foodItem._id,
      log_date: parseLocalDate(log_date),
      meal_type,
      servings: parseFloat(servings),
      notes: notes || '',
      nutrition: nutrition || foodItem.nutrition || {}
    });

    const savedLog = await log.save();

    // Update daily summary
    await DailySummary.updateFromLogs(userId, log_date);

    // Get populated log for response
    const populatedLog = await FoodLog.findById(savedLog._id)
      .populate('food_item_id');

    logger.info('Food log created', {
      userId,
      logId: savedLog._id,
      foodName: foodItem.name,
      mealType: meal_type,
      servings: servings
    });

    res.status(201).json({
      success: true,
      data: populatedLog,
      message: 'Food log created successfully'
    });

  } catch (error) {
    logger.error('Error creating food log:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create food log',
        code: 'LOG_CREATION_ERROR'
      }
    });
  }
});

// PUT /api/logs/:id - Update food log
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { meal_type, servings, log_date, notes } = req.body;

    const log = await FoodLog.findOne({
      _id: id,
      user_id: userId
    });

    if (!log) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Food log not found',
          code: 'LOG_NOT_FOUND'
        }
      });
    }

    // Update fields if provided
    if (meal_type !== undefined) {
      const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
      if (!validMealTypes.includes(meal_type)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Invalid meal type',
            code: 'VALIDATION_ERROR'
          }
        });
      }
      log.meal_type = meal_type;
    }

    if (servings !== undefined) {
      log.servings = parseFloat(servings);
    }

    if (log_date !== undefined) {
      log.log_date = parseLocalDate(log_date);
    }

    if (notes !== undefined) {
      log.notes = notes;
    }

    const updatedLog = await log.save();

    // Update daily summary
    await DailySummary.updateFromLogs(userId, updatedLog.log_date);

    // Get populated log for response
    const populatedLog = await FoodLog.findById(updatedLog._id)
      .populate('food_item_id');

    logger.info('Food log updated', {
      userId,
      logId: id,
      updatedFields: Object.keys(req.body)
    });

    res.json({
      success: true,
      data: populatedLog,
      message: 'Food log updated successfully'
    });

  } catch (error) {
    logger.error('Error updating food log:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update food log',
        code: 'LOG_UPDATE_ERROR'
      }
    });
  }
});

// DELETE /api/logs/:id - Delete food log
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const log = await FoodLog.findOne({
      _id: id,
      user_id: userId
    });

    if (!log) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Food log not found',
          code: 'LOG_NOT_FOUND'
        }
      });
    }

    // Store log date for summary update
    const logDate = log.log_date;

    // Delete the log
    await FoodLog.deleteOne({ _id: id });

    // Update daily summary
    await DailySummary.updateFromLogs(userId, logDate);

    logger.info('Food log deleted', {
      userId,
      logId: id,
      foodName: log.food_item_id?.name || 'Unknown'
    });

    res.json({
      success: true,
      message: 'Food log deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting food log:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete food log',
        code: 'LOG_DELETION_ERROR'
      }
    });
  }
});

// GET /api/logs/date/:date - Get logs for specific date (alternative endpoint)
router.get('/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user.id;

    const logs = await FoodLog.getLogsForDate(userId, date);

    logger.info('Food logs retrieved for date', {
      userId,
      date,
      count: logs.length
    });

    res.json({
      success: true,
      data: logs
    });

  } catch (error) {
    logger.error('Error getting food logs for date:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve food logs',
        code: 'LOG_RETRIEVAL_ERROR'
      }
    });
  }
});

module.exports = router;