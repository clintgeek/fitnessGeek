const mongoose = require('mongoose');

const dailySummarySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  totals: {
    calories: {
      type: Number,
      default: 0,
      min: 0
    },
    protein_grams: {
      type: Number,
      default: 0,
      min: 0
    },
    carbs_grams: {
      type: Number,
      default: 0,
      min: 0
    },
    fat_grams: {
      type: Number,
      default: 0,
      min: 0
    },
    fiber_grams: {
      type: Number,
      default: 0,
      min: 0
    },
    sugar_grams: {
      type: Number,
      default: 0,
      min: 0
    },
    sodium_mg: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  meals: {
    breakfast: {
      calories: { type: Number, default: 0, min: 0 },
      protein_grams: { type: Number, default: 0, min: 0 },
      carbs_grams: { type: Number, default: 0, min: 0 },
      fat_grams: { type: Number, default: 0, min: 0 }
    },
    lunch: {
      calories: { type: Number, default: 0, min: 0 },
      protein_grams: { type: Number, default: 0, min: 0 },
      carbs_grams: { type: Number, default: 0, min: 0 },
      fat_grams: { type: Number, default: 0, min: 0 }
    },
    dinner: {
      calories: { type: Number, default: 0, min: 0 },
      protein_grams: { type: Number, default: 0, min: 0 },
      carbs_grams: { type: Number, default: 0, min: 0 },
      fat_grams: { type: Number, default: 0, min: 0 }
    },
    snack: {
      calories: { type: Number, default: 0, min: 0 },
      protein_grams: { type: Number, default: 0, min: 0 },
      carbs_grams: { type: Number, default: 0, min: 0 },
      fat_grams: { type: Number, default: 0, min: 0 }
    }
  },
  goals_met: {
    calories: { type: Boolean, default: false },
    protein: { type: Boolean, default: false },
    carbs: { type: Boolean, default: false },
    fat: { type: Boolean, default: false }
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Compound index for user and date
dailySummarySchema.index({ user_id: 1, date: 1 }, { unique: true });

// Static method to get or create daily summary
dailySummarySchema.statics.getOrCreate = async function(userId, date) {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);

  let summary = await this.findOne({
    user_id: userId,
    date: startDate
  });

  if (!summary) {
    summary = new this({
      user_id: userId,
      date: startDate
    });
    await summary.save();
  }

  return summary;
};

// Static method to update daily summary from food logs
dailySummarySchema.statics.updateFromLogs = async function(userId, date) {
  const FoodLog = mongoose.model('FoodLog');
  const NutritionGoals = mongoose.model('NutritionGoals');

  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  // Get all logs for the date
  const logs = await FoodLog.find({
    user_id: userId,
    log_date: { $gte: startDate, $lte: endDate }
  }).populate('food_item_id');

  // Calculate totals
  const totals = {
    calories: 0,
    protein_grams: 0,
    carbs_grams: 0,
    fat_grams: 0,
    fiber_grams: 0,
    sugar_grams: 0,
    sodium_mg: 0
  };

  const meals = {
    breakfast: { calories: 0, protein_grams: 0, carbs_grams: 0, fat_grams: 0 },
    lunch: { calories: 0, protein_grams: 0, carbs_grams: 0, fat_grams: 0 },
    dinner: { calories: 0, protein_grams: 0, carbs_grams: 0, fat_grams: 0 },
    snack: { calories: 0, protein_grams: 0, carbs_grams: 0, fat_grams: 0 }
  };

  logs.forEach(log => {
    const food = log.food_item_id;
    const multiplier = log.servings;

    // Add to totals
    totals.calories += (food.nutrition.calories_per_serving * multiplier);
    totals.protein_grams += (food.nutrition.protein_grams * multiplier);
    totals.carbs_grams += (food.nutrition.carbs_grams * multiplier);
    totals.fat_grams += (food.nutrition.fat_grams * multiplier);
    totals.fiber_grams += (food.nutrition.fiber_grams * multiplier);
    totals.sugar_grams += (food.nutrition.sugar_grams * multiplier);
    totals.sodium_mg += (food.nutrition.sodium_mg * multiplier);

    // Add to meal breakdown
    if (meals[log.meal_type]) {
      meals[log.meal_type].calories += (food.nutrition.calories_per_serving * multiplier);
      meals[log.meal_type].protein_grams += (food.nutrition.protein_grams * multiplier);
      meals[log.meal_type].carbs_grams += (food.nutrition.carbs_grams * multiplier);
      meals[log.meal_type].fat_grams += (food.nutrition.fat_grams * multiplier);
    }
  });

  // Get user's goals
  const goals = await NutritionGoals.findOne({
    user_id: userId,
    is_active: true
  });

  // Check if goals are met
  const goals_met = {
    calories: goals ? totals.calories >= goals.calories : false,
    protein: goals ? totals.protein_grams >= goals.protein_grams : false,
    carbs: goals ? totals.carbs_grams >= goals.carbs_grams : false,
    fat: goals ? totals.fat_grams >= goals.fat_grams : false
  };

  // Update or create daily summary
  const summary = await this.findOneAndUpdate(
    { user_id: userId, date: startDate },
    {
      totals,
      meals,
      goals_met,
      updated_at: new Date()
    },
    { upsert: true, new: true }
  );

  return summary;
};

// Static method to get summary for date range
dailySummarySchema.statics.getSummaryRange = async function(userId, startDate, endDate) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  return await this.find({
    user_id: userId,
    date: { $gte: start, $lte: end }
  }).sort({ date: 1 });
};

module.exports = mongoose.model('DailySummary', dailySummarySchema);