const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const NutritionGoals = require('../models/NutritionGoals');
const WeightGoals = require('../models/WeightGoals');
const mongoose = require('mongoose');

// Get user goals
router.get('/', authenticateToken, async (req, res) => {
    try {
    const userId = req.user?.id;
    console.log('User ID from token:', userId, 'Type:', typeof userId);

    // Use user ID as-is (baseGeek might not use MongoDB ObjectIds)
    const userIdObjectId = userId;
    console.log('Using user ID as-is:', userIdObjectId);

            // Get nutrition goals from database
    const nutritionGoals = await NutritionGoals.getActiveGoals(userIdObjectId);
    console.log('Fetched nutrition goals:', nutritionGoals);

    // Get weight goals from database
    const weightGoals = await WeightGoals.getActiveWeightGoals(userIdObjectId);
    console.log('Fetched weight goals:', weightGoals);

    // Build response structure
    const goals = {
      nutrition: {
        trackMacros: nutritionGoals ? true : false,
        goals: nutritionGoals ? {
          calories: nutritionGoals.calories,
          protein: nutritionGoals.protein_grams,
          carbs: nutritionGoals.carbs_grams,
          fat: nutritionGoals.fat_grams
        } : {}
      },
      weight: weightGoals ? {
        startWeight: weightGoals.startWeight,
        targetWeight: weightGoals.targetWeight,
        startDate: weightGoals.startDate ? weightGoals.startDate.toISOString().split('T')[0] : null,
        goalDate: weightGoals.goalDate ? weightGoals.goalDate.toISOString().split('T')[0] : null
      } : null
    };

    console.log('Sending goals response:', goals);

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

    // Use user ID as-is (baseGeek might not use MongoDB ObjectIds)
    const userIdObjectId = userId;

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

    let savedNutrition = null;
    let savedWeight = null;

    // Save nutrition goals if provided
    if (nutrition && nutrition.goals) {
      const nutritionData = {
        calories: nutrition.goals.calories,
        protein_grams: nutrition.goals.protein,
        carbs_grams: nutrition.goals.carbs,
        fat_grams: nutrition.goals.fat
      };

      // Remove undefined values
      Object.keys(nutritionData).forEach(key => {
        if (nutritionData[key] === undefined || nutritionData[key] === null) {
          delete nutritionData[key];
        }
      });

      if (Object.keys(nutritionData).length > 0) {
        savedNutrition = await NutritionGoals.createGoals(userIdObjectId, nutritionData);
      }
    }

    // Save weight goals if provided
    if (weight && weight.startWeight && weight.targetWeight) {
      const weightData = {
        startWeight: weight.startWeight,
        targetWeight: weight.targetWeight,
        startDate: weight.startDate ? new Date(weight.startDate) : new Date(),
        goalDate: weight.goalDate ? new Date(weight.goalDate) : null
      };

      savedWeight = await WeightGoals.createWeightGoals(userIdObjectId, weightData);
    }

    console.log('Saved goals for user:', userIdObjectId, { savedNutrition, savedWeight });

    res.json({
      success: true,
      message: 'Goals saved successfully',
      data: { nutrition: savedNutrition, weight: savedWeight }
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