const { validationResult } = require('express-validator');
const User = require('../models/User');
const Clothing = require('../models/Clothing');
const Outfit = require('../models/Outfit');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, stylePreferences, favoriteColors } = req.body;

    // Build profile object
    const profileFields = {};
    if (name) profileFields.name = name;
    if (email) profileFields.email = email;
    if (stylePreferences) profileFields.stylePreferences = stylePreferences;
    if (favoriteColors) profileFields.favoriteColors = favoriteColors;

    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update user
    user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get user's wardrobe
// @route   GET /api/users/wardrobe
// @access  Private
exports.getWardrobe = async (req, res) => {
  try {
    const wardrobe = await Clothing.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(wardrobe);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get user's outfits
// @route   GET /api/users/outfits
// @access  Private
exports.getOutfits = async (req, res) => {
  try {
    const outfits = await Outfit.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(outfits);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}; 