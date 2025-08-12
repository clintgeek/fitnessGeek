const mongoose = require('mongoose');

const MED_TIME_OF_DAY = ['morning', 'afternoon', 'evening'];

const medicationSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true
  },
  display_name: {
    type: String,
    required: true,
    trim: true
  },
  is_supplement: {
    type: Boolean,
    default: false
  },
  rxcui: {
    type: String,
    default: null,
    index: true
  },
  ingredient_name: {
    type: String,
    default: null
  },
  brand_name: {
    type: String,
    default: null
  },
  form: {
    type: String,
    default: null
  },
  route: {
    type: String,
    default: null
  },
  strength: {
    type: String,
    default: null
  },
  dose_value: {
    type: Number,
    default: null
  },
  dose_unit: {
    type: String,
    default: null
  },
  sig: {
    type: String,
    default: null
  },
  times_of_day: {
    type: [String],
    enum: MED_TIME_OF_DAY,
    default: []
  },
  suggested_indications: {
    type: [String],
    default: []
  },
  user_indications: {
    type: [String],
    default: []
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updatedAt'
  },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

medicationSchema.index({ user_id: 1, display_name: 1 });

module.exports = mongoose.model('Medication', medicationSchema);


