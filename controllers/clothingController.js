const { validationResult } = require('express-validator');
const Clothing = require('../models/Clothing');

// @desc    Get all clothing items
// @route   GET /api/clothing
// @access  Private
exports.getClothing = async (req, res) => {
  try {
    const clothing = await Clothing.find({ user: req.user.id })
      .sort({ name: 1 });
    res.json(clothing);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get clothing item by ID
// @route   GET /api/clothing/:id
// @access  Private
exports.getClothingById = async (req, res) => {
  try {
    const clothing = await Clothing.findById(req.params.id);
    
    // Check if clothing exists
    if (!clothing) {
      return res.status(404).json({ msg: 'Clothing item not found' });
    }
    
    // Check if user owns the clothing item
    if (clothing.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    res.json(clothing);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Clothing item not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Create a clothing item
// @route   POST /api/clothing
// @access  Private
exports.createClothing = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      type,
      color,
      brand,
      size,
      style,
      season,
      occasion,
      image,
      notes
    } = req.body;

    const newClothing = new Clothing({
      user: req.user.id,
      name,
      type,
      color,
      brand,
      size,
      style,
      season,
      occasion,
      image,
      notes
    });

    const clothing = await newClothing.save();
    res.json(clothing);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update a clothing item
// @route   PUT /api/clothing/:id
// @access  Private
exports.updateClothing = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      type,
      color,
      brand,
      size,
      style,
      season,
      occasion,
      image,
      isFavorite,
      notes
    } = req.body;

    // Build clothing object
    const clothingFields = {};
    if (name) clothingFields.name = name;
    if (type) clothingFields.type = type;
    if (color) clothingFields.color = color;
    if (brand) clothingFields.brand = brand;
    if (size) clothingFields.size = size;
    if (style) clothingFields.style = style;
    if (season) clothingFields.season = season;
    if (occasion) clothingFields.occasion = occasion;
    if (image) clothingFields.image = image;
    if (typeof isFavorite === 'boolean') clothingFields.isFavorite = isFavorite;
    if (notes) clothingFields.notes = notes;

    let clothing = await Clothing.findById(req.params.id);
    
    // Check if clothing exists
    if (!clothing) {
      return res.status(404).json({ msg: 'Clothing item not found' });
    }
    
    // Check if user owns the clothing item
    if (clothing.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    clothing = await Clothing.findByIdAndUpdate(
      req.params.id,
      { $set: clothingFields },
      { new: true }
    );

    res.json(clothing);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Clothing item not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Delete a clothing item
// @route   DELETE /api/clothing/:id
// @access  Private
exports.deleteClothing = async (req, res) => {
  try {
    const clothing = await Clothing.findById(req.params.id);

    if (!clothing) {
      return res.status(404).json({ msg: 'Clothing item not found' });
    }

    // Make sure user owns clothing item
    if (clothing.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Clothing.deleteOne({ _id: req.params.id });
    res.json({ msg: 'Clothing item removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Clothing item not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Get clothing items by type
// @route   GET /api/clothing/type/:type
// @access  Private
exports.getClothingByType = async (req, res) => {
  try {
    const clothing = await Clothing.find({
      user: req.user.id,
      type: req.params.type
    }).sort({ name: 1 });
    res.json(clothing);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get favorite clothing items
// @route   GET /api/clothing/favorites
// @access  Private
exports.getFavorites = async (req, res) => {
  try {
    const clothing = await Clothing.find({ user: req.user.id, isFavorite: true })
      .sort({ name: 1 });
    res.json(clothing);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}; 