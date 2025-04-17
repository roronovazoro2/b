const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');
const Clothing = require('../models/Clothing');
const jwt = require('jsonwebtoken');

let mongoServer;

beforeAll(async () => {
  // Close any existing connections
  await mongoose.connection.close();
  
  // Create an in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to the test database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

afterAll(async () => {
  // Clean up
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear the database before each test
  await User.deleteMany({});
  await Clothing.deleteMany({});
});

describe('Clothing API', () => {
  let token;
  let userId;

  beforeEach(async () => {
    // Create a test user
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      stylePreferences: ['casual'],
      favoriteColors: ['blue', 'black']
    });
    await user.save();
    userId = user._id;

    // Generate JWT token
    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'testsecret', {
      expiresIn: '1h'
    });
  });

  describe('GET /api/clothing', () => {
    it('should return all clothing items for the authenticated user', async () => {
      // Create test clothing items
      await Clothing.create([
        {
          user: userId,
          name: 'Blue T-Shirt',
          type: 'top',
          color: 'blue',
          size: 'M',
          style: 'casual',
          image: 'https://example.com/tshirt.jpg'
        },
        {
          user: userId,
          name: 'Black Jeans',
          type: 'bottom',
          color: 'black',
          size: '32',
          style: 'casual',
          image: 'https://example.com/jeans.jpg'
        }
      ]);

      const response = await request(app)
        .get('/api/clothing')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      
      // Check that both items are in the response without assuming order
      const itemNames = response.body.map(item => item.name);
      expect(itemNames).toContain('Blue T-Shirt');
      expect(itemNames).toContain('Black Jeans');
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app).get('/api/clothing');
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/clothing', () => {
    it('should create a new clothing item', async () => {
      const clothingData = {
        name: 'Red Dress',
        type: 'dress',
        color: 'red',
        size: 'S',
        style: 'formal',
        image: 'https://example.com/dress.jpg'
      };

      const response = await request(app)
        .post('/api/clothing')
        .set('Authorization', `Bearer ${token}`)
        .send(clothingData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Red Dress');
      expect(response.body.user.toString()).toBe(userId.toString());

      // Verify it was saved to the database
      const savedClothing = await Clothing.findById(response.body._id);
      expect(savedClothing).toBeTruthy();
      expect(savedClothing.name).toBe('Red Dress');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/clothing')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Incomplete Item' });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/clothing/:id', () => {
    it('should return a specific clothing item', async () => {
      const clothing = await Clothing.create({
        user: userId,
        name: 'Green Sweater',
        type: 'top',
        color: 'green',
        size: 'L',
        style: 'casual',
        image: 'https://example.com/sweater.jpg'
      });

      const response = await request(app)
        .get(`/api/clothing/${clothing._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Green Sweater');
    });

    it('should return 404 if clothing item not found', async () => {
      const response = await request(app)
        .get(`/api/clothing/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/clothing/:id', () => {
    it('should update a clothing item', async () => {
      const clothing = await Clothing.create({
        user: userId,
        name: 'Yellow Jacket',
        type: 'outerwear',
        color: 'yellow',
        size: 'M',
        style: 'casual',
        image: 'https://example.com/jacket.jpg'
      });

      const updateData = {
        name: 'Yellow Rain Jacket',
        isFavorite: true
      };

      const response = await request(app)
        .put(`/api/clothing/${clothing._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Yellow Rain Jacket');
      expect(response.body.isFavorite).toBe(true);
    });
  });

  describe('DELETE /api/clothing/:id', () => {
    it('should delete a clothing item', async () => {
      const clothing = await Clothing.create({
        user: userId,
        name: 'White Shoes',
        type: 'shoes',
        color: 'white',
        size: '10',
        style: 'casual',
        image: 'https://example.com/shoes.jpg'
      });

      const response = await request(app)
        .delete(`/api/clothing/${clothing._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.msg).toBe('Clothing item removed');

      // Verify it was deleted from the database
      const deletedClothing = await Clothing.findById(clothing._id);
      expect(deletedClothing).toBeNull();
    });
  });

  describe('GET /api/clothing/type/:type', () => {
    it('should return clothing items by type', async () => {
      await Clothing.create([
        {
          user: userId,
          name: 'Blue T-Shirt',
          type: 'top',
          color: 'blue',
          size: 'M',
          style: 'casual',
          image: 'https://example.com/tshirt.jpg'
        },
        {
          user: userId,
          name: 'Black Jeans',
          type: 'bottom',
          color: 'black',
          size: '32',
          style: 'casual',
          image: 'https://example.com/jeans.jpg'
        },
        {
          user: userId,
          name: 'Red T-Shirt',
          type: 'top',
          color: 'red',
          size: 'L',
          style: 'casual',
          image: 'https://example.com/red-tshirt.jpg'
        }
      ]);

      const response = await request(app)
        .get('/api/clothing/type/top')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      
      // Check that both top items are in the response without assuming order
      const itemNames = response.body.map(item => item.name);
      expect(itemNames).toContain('Blue T-Shirt');
      expect(itemNames).toContain('Red T-Shirt');
    });
  });

  describe('GET /api/clothing/favorites', () => {
    it('should return favorite clothing items', async () => {
      await Clothing.create([
        {
          user: userId,
          name: 'Blue T-Shirt',
          type: 'top',
          color: 'blue',
          size: 'M',
          style: 'casual',
          image: 'https://example.com/tshirt.jpg',
          isFavorite: true
        },
        {
          user: userId,
          name: 'Black Jeans',
          type: 'bottom',
          color: 'black',
          size: '32',
          style: 'casual',
          image: 'https://example.com/jeans.jpg',
          isFavorite: false
        },
        {
          user: userId,
          name: 'Red Dress',
          type: 'dress',
          color: 'red',
          size: 'S',
          style: 'formal',
          image: 'https://example.com/dress.jpg',
          isFavorite: true
        }
      ]);

      const response = await request(app)
        .get('/api/clothing/favorites')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      
      // Check that both favorite items are in the response without assuming order
      const itemNames = response.body.map(item => item.name);
      expect(itemNames).toContain('Blue T-Shirt');
      expect(itemNames).toContain('Red Dress');
    });
  });
});