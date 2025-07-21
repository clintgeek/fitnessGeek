const Weight = require('../models/Weight');
const logger = require('../config/logger');

/**
 * Get all weight logs for a user
 */
const getWeightLogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 100, offset = 0, startDate, endDate } = req.query;

    let query = { userId };

    // Add date range filter if provided
    if (startDate || endDate) {
      query.log_date = {};
      if (startDate) {
        query.log_date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.log_date.$lte = new Date(endDate);
      }
    }

    const weightLogs = await Weight.find(query)
      .sort({ log_date: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await Weight.countDocuments(query);

    logger.info(`Retrieved ${weightLogs.length} weight logs for user ${userId}`);

    res.json({
      success: true,
      data: weightLogs,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    logger.error('Error getting weight logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve weight logs',
      error: error.message
    });
  }
};

/**
 * Get a single weight log by ID
 */
const getWeightLog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const weightLog = await Weight.findOne({ _id: id, userId });

    if (!weightLog) {
      return res.status(404).json({
        success: false,
        message: 'Weight log not found'
      });
    }

    res.json({
      success: true,
      data: weightLog
    });
  } catch (error) {
    logger.error('Error getting weight log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve weight log',
      error: error.message
    });
  }
};

/**
 * Create a new weight log
 */
const createWeightLog = async (req, res) => {
  try {
    const userId = req.user.id;
    const { weight_value, log_date, notes } = req.body;

    // Validate required fields
    if (!weight_value) {
      return res.status(400).json({
        success: false,
        message: 'Weight value is required'
      });
    }

    // Check if weight log already exists for the same date
    let checkDate;
    if (log_date) {
      if (typeof log_date === 'string' && log_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        checkDate = new Date(log_date + 'T00:00:00');
      } else {
        checkDate = new Date(log_date);
      }
    } else {
      checkDate = new Date();
    }

    const existingLog = await Weight.findOne({
      userId,
      log_date: {
        $gte: new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate(), 0, 0, 0, 0),
        $lt: new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate(), 23, 59, 59, 999)
      }
    });

    if (existingLog) {
      return res.status(409).json({
        success: false,
        message: 'Weight log already exists for this date',
        data: existingLog
      });
    }

    // Handle date properly to avoid timezone issues
    let parsedDate;
    if (log_date) {
      // If it's just a date string (YYYY-MM-DD), treat it as local time
      if (typeof log_date === 'string' && log_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Create date in local timezone by adding time component
        parsedDate = new Date(log_date + 'T00:00:00');
      } else {
        parsedDate = new Date(log_date);
      }
    } else {
      parsedDate = new Date();
    }

    const weightLog = new Weight({
      userId,
      weight_value: parseFloat(parseFloat(weight_value).toFixed(1)),
      log_date: parsedDate,
      notes: notes || ''
    });

    await weightLog.save();

    logger.info(`Created weight log for user ${userId}: ${weight_value}`);

    res.status(201).json({
      success: true,
      message: 'Weight log created successfully',
      data: weightLog
    });
  } catch (error) {
    logger.error('Error creating weight log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create weight log',
      error: error.message
    });
  }
};

/**
 * Update a weight log
 */
const updateWeightLog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { weight_value, log_date, notes } = req.body;

    const weightLog = await Weight.findOne({ _id: id, userId });

    if (!weightLog) {
      return res.status(404).json({
        success: false,
        message: 'Weight log not found'
      });
    }

    // Update fields if provided
    if (weight_value !== undefined) {
      weightLog.weight_value = parseFloat(parseFloat(weight_value).toFixed(1));
    }
    if (log_date !== undefined) {
      // Handle date properly to avoid timezone issues
      if (typeof log_date === 'string' && log_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Create date in local timezone by adding time component
        weightLog.log_date = new Date(log_date + 'T00:00:00');
      } else {
        weightLog.log_date = new Date(log_date);
      }
    }
    if (notes !== undefined) {
      weightLog.notes = notes;
    }

    await weightLog.save();

    logger.info(`Updated weight log ${id} for user ${userId}`);

    res.json({
      success: true,
      message: 'Weight log updated successfully',
      data: weightLog
    });
  } catch (error) {
    logger.error('Error updating weight log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update weight log',
      error: error.message
    });
  }
};

/**
 * Delete a weight log
 */
const deleteWeightLog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const weightLog = await Weight.findOneAndDelete({ _id: id, userId });

    if (!weightLog) {
      return res.status(404).json({
        success: false,
        message: 'Weight log not found'
      });
    }

    logger.info(`Deleted weight log ${id} for user ${userId}`);

    res.json({
      success: true,
      message: 'Weight log deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting weight log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete weight log',
      error: error.message
    });
  }
};

/**
 * Get weight statistics for a user
 */
const getWeightStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    let query = { userId };

    // Add date range filter if provided
    if (startDate || endDate) {
      query.log_date = {};
      if (startDate) {
        query.log_date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.log_date.$lte = new Date(endDate);
      }
    }

    const weightLogs = await Weight.find(query).sort({ log_date: 1 });

    if (weightLogs.length === 0) {
      return res.json({
        success: true,
        data: {
          totalEntries: 0,
          currentWeight: null,
          startWeight: null,
          lowestWeight: null,
          highestWeight: null,
          averageWeight: null,
          totalChange: null,
          weeklyChange: null,
          monthlyChange: null
        }
      });
    }

    const weights = weightLogs.map(log => log.weight_value);
    const currentWeight = weights[weights.length - 1];
    const startWeight = weights[0];
    const lowestWeight = Math.min(...weights);
    const highestWeight = Math.max(...weights);
    const averageWeight = weights.reduce((sum, weight) => sum + weight, 0) / weights.length;
    const totalChange = currentWeight - startWeight;

    // Calculate weekly and monthly changes
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const weekAgoLog = weightLogs.find(log => log.log_date >= weekAgo);
    const monthAgoLog = weightLogs.find(log => log.log_date >= monthAgo);

    const weeklyChange = weekAgoLog ? currentWeight - weekAgoLog.weight_value : null;
    const monthlyChange = monthAgoLog ? currentWeight - monthAgoLog.weight_value : null;

    res.json({
      success: true,
      data: {
        totalEntries: weightLogs.length,
        currentWeight,
        startWeight,
        lowestWeight,
        highestWeight,
        averageWeight: parseFloat(averageWeight.toFixed(1)),
        totalChange: parseFloat(totalChange.toFixed(1)),
        weeklyChange: weeklyChange ? parseFloat(weeklyChange.toFixed(1)) : null,
        monthlyChange: monthlyChange ? parseFloat(monthlyChange.toFixed(1)) : null
      }
    });
  } catch (error) {
    logger.error('Error getting weight stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve weight statistics',
      error: error.message
    });
  }
};

module.exports = {
  getWeightLogs,
  getWeightLog,
  createWeightLog,
  updateWeightLog,
  deleteWeightLog,
  getWeightStats
};