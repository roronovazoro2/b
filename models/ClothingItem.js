const mongoose = require('mongoose');

const clothingItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: [
      'top',
      'bottom',
      'dress',
      'outerwear',
      'shoes',
      'accessory',
      'bag',
    ],
  },
  category: {
    type: String,
    required: true,
    enum: [
      'shirt',
      't-shirt',
      'sweater',
      'jacket',
      'coat',
      'pants',
      'jeans',
      'skirt',
      'shorts',
      'dress',
      'sneakers',
      'boots',
      'heels',
      'sandals',
      'jewelry',
      'watch',
      'belt',
      'scarf',
      'hat',
      'bag',
      'backpack',
    ],
  },
  color: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    trim: true,
  },
  size: {
    type: String,
    required: true,
  },
  season: {
    type: [String],
    enum: ['spring', 'summer', 'fall', 'winter', 'all'],
    default: ['all'],
  },
  style: {
    type: [String],
    enum: ['casual', 'formal', 'streetwear', 'sportswear', 'business', 'evening'],
    default: ['casual'],
  },
  occasion: {
    type: [String],
    enum: ['casual', 'formal', 'party', 'work', 'sport', 'beach', 'travel'],
    default: ['casual'],
  },
  image: {
    type: String,
    required: true,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  lastWorn: {
    type: Date,
  },
  notes: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
clothingItemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const ClothingItem = mongoose.model('ClothingItem', clothingItemSchema);

module.exports = ClothingItem; 