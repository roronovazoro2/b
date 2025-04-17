const ClothingItem = require('../models/ClothingItem');
const { validationResult } = require('express-validator');

// @desc    Get all clothing items
// @route   GET /api/wardrobe
// @access  Private
exports.getClothingItems = async (req, res) => {
  try {
    const items = await ClothingItem.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single clothing item
// @route   GET /api/wardrobe/:id
// @access  Private
exports.getClothingItem = async (req, res) => {
  try {
    const item = await ClothingItem.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add new clothing item
// @route   POST /api/wardrobe
// @access  Private
exports.addClothingItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      type,
      category,
      color,
      brand,
      size,
      season,
      style,
      occasion,
      image,
      notes,
    } = req.body;

    const newItem = new ClothingItem({
      user: req.user.id,
      name,
      type,
      category,
      color,
      brand,
      size,
      season,
      style,
      occasion,
      image,
      notes,
    });

    const item = await newItem.save();

    // Add item to user's wardrobe
    req.user.wardrobe.push(item._id);
    await req.user.save();

    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update clothing item
// @route   PUT /api/wardrobe/:id
// @access  Private
exports.updateClothingItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let item = await ClothingItem.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const {
      name,
      type,
      category,
      color,
      brand,
      size,
      season,
      style,
      occasion,
      image,
      notes,
      isFavorite,
    } = req.body;

    // Update fields
    if (name) item.name = name;
    if (type) item.type = type;
    if (category) item.category = category;
    if (color) item.color = color;
    if (brand) item.brand = brand;
    if (size) item.size = size;
    if (season) item.season = season;
    if (style) item.style = style;
    if (occasion) item.occasion = occasion;
    if (image) item.image = image;
    if (notes) item.notes = notes;
    if (typeof isFavorite === 'boolean') item.isFavorite = isFavorite;

    await item.save();
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete clothing item
// @route   DELETE /api/wardrobe/:id
// @access  Private
exports.deleteClothingItem = async (req, res) => {
  try {
    const item = await ClothingItem.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    await item.remove();

    // Remove item from user's wardrobe
    req.user.wardrobe = req.user.wardrobe.filter(
      (id) => id.toString() !== req.params.id
    );
    await req.user.save();

    res.json({ message: 'Item removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get clothing items by type
// @route   GET /api/wardrobe/type/:type
// @access  Private
exports.getClothingItemsByType = async (req, res) => {
  try {
    const items = await ClothingItem.find({
      user: req.user.id,
      type: req.params.type,
    }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get favorite clothing items
// @route   GET /api/wardrobe/favorites
// @access  Private
exports.getFavoriteItems = async (req, res) => {
  try {
    const items = await ClothingItem.find({
      user: req.user.id,
      isFavorite: true,
    }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}; 