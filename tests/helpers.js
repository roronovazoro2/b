const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Create a test user and return the user object and token
const createTestUser = async (userData = {}) => {
  const defaultUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    stylePreferences: ['casual'],
    favoriteColors: ['blue', 'black']
  };

  const user = new User({ ...defaultUser, ...userData });
  await user.save();

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET || 'testsecret',
    { expiresIn: '1h' }
  );

  return { user, token };
};

// Generate auth header for requests
const getAuthHeader = (token) => ({
  Authorization: `Bearer ${token}`
});

module.exports = {
  createTestUser,
  getAuthHeader
}; 