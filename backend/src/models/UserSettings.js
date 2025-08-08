const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true
  },
  dashboard: {
    // Dashboard component visibility settings
    show_current_weight: {
      type: Boolean,
      default: true
    },
    show_blood_pressure: {
      type: Boolean,
      default: true
    },
    show_calories_today: {
      type: Boolean,
      default: true
    },
    show_login_streak: {
      type: Boolean,
      default: true
    },
    show_nutrition_today: {
      type: Boolean,
      default: true
    },
    show_quick_actions: {
      type: Boolean,
      default: true
    },
    // Individual goal card settings
    show_weight_goal: {
      type: Boolean,
      default: true
    },
    show_nutrition_goal: {
      type: Boolean,
      default: true
    },
    // Card order settings
    card_order: {
      type: [String],
      default: [
        'current_weight',
        'blood_pressure',
        'calories_today',
        'login_streak',
        'nutrition_today',
        'quick_actions',
        'weight_goal',
        'nutrition_goal'
      ]
    }
  },
  // General app settings
  theme: {
    type: String,
    enum: ['light', 'dark', 'auto'],
    default: 'light'
  },
  notifications: {
    enabled: {
      type: Boolean,
      default: true
    },
    daily_reminder: {
      type: Boolean,
      default: true
    },
    goal_reminders: {
      type: Boolean,
      default: true
    }
  },
  // Nutrition / calorie goal from Calorie Wizard
  nutrition_goal: {
    enabled: { type: Boolean, default: false },
    start_date: { type: Date },
    start_weight: { type: Number },
    target_weight: { type: Number },
    activity_level: { type: String },
    weight_change_rate: { type: Number },
    plan_type: { type: String, enum: ['standard', 'weekender', 'auto', 'stepFlex'], default: 'standard' },
    daily_calorie_target: { type: Number },
    weekly_schedule: { type: [Number], default: undefined }, // 7 values Mon..Sun
    min_safe_calories: { type: Number },
    bmr: { type: Number },
    tdee: { type: Number },
    timeline_weeks: { type: Number },
    estimated_end_date: { type: Date }
  },
  units: {
    weight: {
      type: String,
      enum: ['lbs', 'kg'],
      default: 'lbs'
    },
    height: {
      type: String,
      enum: ['ft', 'cm'],
      default: 'ft'
    }
  },
  // AI settings
  ai: {
    enabled: {
      type: Boolean,
      default: true
    },
    features: {
      natural_language_food_logging: {
        type: Boolean,
        default: true
      },
      meal_suggestions: {
        type: Boolean,
        default: true
      },
      nutrition_analysis: {
        type: Boolean,
        default: true
      },
      goal_recommendations: {
        type: Boolean,
        default: true
      }
    }
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Ensure one settings document per user
userSettingsSchema.index({ user_id: 1 }, { unique: true });

// Static method to get or create user settings
userSettingsSchema.statics.getOrCreate = async function(userId) {
  let settings = await this.findOne({ user_id: userId });

  if (!settings) {
    settings = new this({ user_id: userId });
    await settings.save();
  }

  return settings;
};

// Static method to update user settings
userSettingsSchema.statics.updateSettings = async function(userId, updateData) {
  const settings = await this.findOneAndUpdate(
    { user_id: userId },
    { $set: updateData },
    { upsert: true, new: true }
  );

  return settings;
};

module.exports = mongoose.model('UserSettings', userSettingsSchema);