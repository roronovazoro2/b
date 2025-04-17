const mongoose = require('mongoose');

const outfitSchema = new mongoose.Schema({
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
  description: {
    type: String,
    trim: true,
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clothing',
    required: true,
  }],
  style: {
    type: String,
    required: true,
    enum: ['casual', 'formal', 'business', 'sportswear', 'evening'],
  },
  occasion: {
    type: [String],
    enum: ['casual', 'formal', 'business', 'party', 'sport'],
    default: [],
  },
  season: {
    type: [String],
    enum: ['spring', 'summer', 'fall', 'winter'],
    default: [],
  },
  image: {
    type: String,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  isRecommended: {
    type: Boolean,
    default: false,
  },
  lastWorn: {
    type: Date,
  },
  weather: {
    temperature: Number,
    condition: {
      type: String,
      enum: ['sunny', 'cloudy', 'rainy', 'snowy', 'windy'],
    },
  },
  notes: {
    type: String,
    trim: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  tags: [{
    type: String,
    trim: true,
  }],
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
outfitSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for getting the main colors of the outfit
outfitSchema.virtual('colors').get(function() {
  return this.items.map(item => item.color);
});

// Method to check if an outfit is suitable for a specific occasion
outfitSchema.methods.isSuitableFor = function(occasion) {
  return this.occasion.includes(occasion);
};

// Method to check if an outfit is suitable for the current season
outfitSchema.methods.isSuitableForSeason = function(season) {
  return this.season.includes('all') || this.season.includes(season);
};

const Outfit = mongoose.model('Outfit', outfitSchema);

module.exports = Outfit; 