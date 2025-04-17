const mongoose = require('mongoose');

const clothingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessory']
  },
  color: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    trim: true
  },
  size: {
    type: String,
    required: true
  },
  style: {
    type: String,
    required: true,
    enum: ['casual', 'formal', 'business', 'sportswear', 'evening']
  },
  season: {
    type: [String],
    enum: ['spring', 'summer', 'fall', 'winter'],
    default: []
  },
  occasion: {
    type: [String],
    enum: ['casual', 'formal', 'business', 'party', 'sport'],
    default: []
  },
  image: {
    type: String,
    required: true
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  lastWorn: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Clothing', clothingSchema); 