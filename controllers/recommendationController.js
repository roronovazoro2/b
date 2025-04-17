const { validationResult } = require('express-validator');
const User = require('../models/User');
const Outfit = require('../models/Outfit');
const Clothing = require('../models/Clothing');

// @desc    Get outfit recommendations based on user preferences
// @route   GET /api/recommendations
// @access  Private
exports.getRecommendations = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Get user's clothing items
    const userClothing = await Clothing.find({ user: req.user.id });
    
    // Get user's preferences
    const preferences = user.preferences || {};
    
    // Get existing outfits
    const existingOutfits = await Outfit.find({ user: req.user.id });
    
    // Generate recommendations based on preferences and available clothing
    const recommendations = generateRecommendations(userClothing, preferences, existingOutfits);
    
    res.json(recommendations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Save a recommended outfit
// @route   POST /api/recommendations/save
// @access  Private
exports.saveRecommendation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, name, description } = req.body;

    // Create new outfit
    const newOutfit = new Outfit({
      user: req.user.id,
      items,
      name,
      description,
      isRecommended: true
    });

    const outfit = await newOutfit.save();
    res.json(outfit);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Helper function to generate recommendations
function generateRecommendations(clothing, preferences, existingOutfits) {
  const recommendations = [];
  
  // Group clothing by type
  const clothingByType = clothing.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {});

  // Generate outfit combinations based on preferences
  const topItems = clothingByType['top'] || [];
  const bottomItems = clothingByType['bottom'] || [];
  const outerwearItems = clothingByType['outerwear'] || [];
  const shoeItems = clothingByType['shoes'] || [];

  // Create combinations
  for (const top of topItems) {
    for (const bottom of bottomItems) {
      // Check if colors match preferences
      if (preferences.colors && 
          !preferences.colors.includes(top.color) && 
          !preferences.colors.includes(bottom.color)) {
        continue;
      }

      // Check if style matches preferences
      if (preferences.style && 
          top.style !== preferences.style && 
          bottom.style !== preferences.style) {
        continue;
      }

      // Add outerwear if available and matches
      const matchingOuterwear = outerwearItems.filter(outerwear => 
        (!preferences.colors || preferences.colors.includes(outerwear.color)) &&
        (!preferences.style || outerwear.style === preferences.style)
      );

      // Add shoes if available and match
      const matchingShoes = shoeItems.filter(shoe =>
        (!preferences.colors || preferences.colors.includes(shoe.color)) &&
        (!preferences.style || shoe.style === preferences.style)
      );

      if (matchingShoes.length > 0) {
        const outfit = {
          items: [top, bottom, ...matchingOuterwear.slice(0, 1), matchingShoes[0]],
          name: `${top.name} with ${bottom.name}`,
          description: `A ${top.style} outfit with ${top.color} top and ${bottom.color} bottom`
        };
        recommendations.push(outfit);
      }
    }
  }

  return recommendations.slice(0, 10); // Return top 10 recommendations
} 