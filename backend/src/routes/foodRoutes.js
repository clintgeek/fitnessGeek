const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const FoodItem = require('../models/FoodItem');
const logger = require('../config/logger');
const foodApiService = require('../services/foodApiService');

// Apply authentication to all routes
router.use(authenticateToken);

// GET /api/foods - Get all food items for user (including global items)
router.get('/', async (req, res) => {
  try {
    const { search, barcode, source, limit = 25 } = req.query;
    const userId = req.user.id;

    let foods;

    if (barcode) {
      // Search by barcode in local database first
      let localFood = await FoodItem.findOne({
        barcode,
        is_deleted: false
      });

      if (localFood) {
        foods = [localFood];
      } else {
        // Try external APIs for barcode lookup
        try {
          const externalFood = await foodApiService.getFoodByBarcode(barcode);
          if (externalFood) {
            foods = [externalFood];
            logger.info('Barcode found via external API', {
              userId,
              barcode,
              source: externalFood.source
            });
          } else {
            foods = [];
          }
        } catch (error) {
          logger.warn('External barcode lookup failed', {
            userId,
            barcode,
            error: error.message
          });
          foods = [];
        }
      }
    } else if (search) {
      // Search local database first
      const localFoods = await FoodItem.search(search, userId, Math.ceil(parseInt(limit) / 2));

      // Search external APIs
      let externalFoods = [];
      try {
        externalFoods = await foodApiService.searchFoods(search, Math.ceil(parseInt(limit) / 2));
        logger.info('External API search results', {
          userId,
          query: search,
          count: externalFoods.length
        });
      } catch (error) {
        logger.warn('External API search failed, continuing with local results only', {
          userId,
          query: search,
          error: error.message
        });
      }

      // Combine and deduplicate results
      const allFoods = [...localFoods, ...externalFoods];
      const seen = new Set();
      foods = allFoods.filter(food => {
        const key = `${food.name}-${food.brand || ''}-${food.source}`;
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      }).slice(0, parseInt(limit));
    } else {
      // Get all foods (global + user's custom)
      const filter = { is_deleted: false };
      filter.$or = [
        { user_id: null }, // Global foods
        { user_id: userId } // User's custom foods
      ];

      if (source) {
        filter.source = source;
      }

      foods = await FoodItem.find(filter)
        .sort({ name: 1 })
        .limit(parseInt(limit));
    }

    logger.info('Food items retrieved', {
      userId,
      count: foods.length,
      search: search || null,
      barcode: barcode || null
    });

    res.json({
      success: true,
      data: foods
    });

  } catch (error) {
    logger.error('Error getting food items:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve food items',
        code: 'FOOD_RETRIEVAL_ERROR'
      }
    });
  }
});

// GET /api/foods/:id - Get single food item
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const food = await FoodItem.findOne({
      _id: id,
      is_deleted: false,
      $or: [
        { user_id: null }, // Global foods
        { user_id: userId } // User's custom foods
      ]
    });

    if (!food) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Food item not found',
          code: 'FOOD_NOT_FOUND'
        }
      });
    }

    logger.info('Food item retrieved', { userId, foodId: id });

    res.json({
      success: true,
      data: food
    });

  } catch (error) {
    logger.error('Error getting food item:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve food item',
        code: 'FOOD_RETRIEVAL_ERROR'
      }
    });
  }
});

// POST /api/foods - Create new food item
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      brand,
      barcode,
      nutrition,
      serving,
      source,
      source_id
    } = req.body;

    // Validate required fields
    if (!name || !nutrition || !nutrition.calories_per_serving) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Name and calories are required',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    // Check if food already exists
    let existingFood = null;
    if (barcode) {
      existingFood = await FoodItem.findOne({ barcode, is_deleted: false });
    } else if (source && source_id) {
      existingFood = await FoodItem.findOne({
        source,
        source_id,
        is_deleted: false
      });
    }

    if (existingFood) {
      logger.info('Food item already exists', {
        userId,
        foodId: existingFood._id,
        barcode: barcode || null,
        source: source || null
      });

      return res.json({
        success: true,
        data: existingFood,
        message: 'Food item already exists'
      });
    }

    // Create new food item
    const foodItem = new FoodItem({
      name,
      brand,
      barcode,
      nutrition: {
        calories_per_serving: nutrition.calories_per_serving,
        protein_grams: nutrition.protein_grams || 0,
        carbs_grams: nutrition.carbs_grams || 0,
        fat_grams: nutrition.fat_grams || 0,
        fiber_grams: nutrition.fiber_grams || 0,
        sugar_grams: nutrition.sugar_grams || 0,
        sodium_mg: nutrition.sodium_mg || 0
      },
      serving: {
        size: serving?.size || 100,
        unit: serving?.unit || 'g'
      },
      source: source || 'custom',
      source_id,
      user_id: userId // Custom foods belong to the user
    });

    const savedFood = await foodItem.save();

    logger.info('Food item created', {
      userId,
      foodId: savedFood._id,
      name: savedFood.name,
      source: savedFood.source
    });

    res.status(201).json({
      success: true,
      data: savedFood,
      message: 'Food item created successfully'
    });

  } catch (error) {
    logger.error('Error creating food item:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create food item',
        code: 'FOOD_CREATION_ERROR'
      }
    });
  }
});

// PUT /api/foods/:id - Update food item
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Allow users to edit any food they've saved locally (custom or API-sourced)
    const food = await FoodItem.findOne({
      _id: id,
      user_id: userId,
      is_deleted: false
    });

    if (!food) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Food item not found or not editable',
          code: 'FOOD_NOT_FOUND'
        }
      });
    }

    // Update allowed fields
    const allowedFields = ['name', 'brand', 'nutrition', 'serving'];
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        food[field] = updateData[field];
      }
    });

    const updatedFood = await food.save();

    logger.info('Food item updated', {
      userId,
      foodId: id,
      updatedFields: Object.keys(updateData)
    });

    res.json({
      success: true,
      data: updatedFood,
      message: 'Food item updated successfully'
    });

  } catch (error) {
    logger.error('Error updating food item:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update food item',
        code: 'FOOD_UPDATE_ERROR'
      }
    });
  }
});

// DELETE /api/foods/:id - Soft delete food item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Allow users to delete any food they've saved locally (custom or API-sourced)
    const food = await FoodItem.findOne({
      _id: id,
      user_id: userId,
      is_deleted: false
    });

    if (!food) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Food item not found or not deletable',
          code: 'FOOD_NOT_FOUND'
        }
      });
    }

    // Soft delete
    food.is_deleted = true;
    await food.save();

    logger.info('Food item deleted', {
      userId,
      foodId: id,
      name: food.name
    });

    res.json({
      success: true,
      message: 'Food item deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting food item:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete food item',
        code: 'FOOD_DELETION_ERROR'
      }
    });
  }
});

// GET /api/foods/search/:query - Search foods (alternative endpoint)
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 25 } = req.query;
    const userId = req.user.id;

    const foods = await FoodItem.search(query, userId, parseInt(limit));

    logger.info('Food search performed', {
      userId,
      query,
      count: foods.length
    });

    res.json({
      success: true,
      data: foods
    });

  } catch (error) {
    logger.error('Error searching foods:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to search foods',
        code: 'FOOD_SEARCH_ERROR'
      }
    });
  }
});

module.exports = router;