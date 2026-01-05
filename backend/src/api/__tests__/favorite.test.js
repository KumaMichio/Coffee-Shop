// backend/src/api/__tests__/favorite.test.js
const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

// Mock middleware before importing routes
jest.mock('../../middleware/auth', () => {
  // Require jwt inside the factory to avoid scope issues
  const jwt = require('jsonwebtoken');
  return {
    authenticateToken: (req, res, next) => {
      // Mock authentication - extract userId from token
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this');
          req.user = { userId: decoded.userId };
          next();
        } catch (err) {
          res.status(401).json({ error: 'Token không hợp lệ' });
        }
      } else {
        res.status(401).json({ error: 'Chưa đăng nhập' });
      }
    }
  };
});

const favoriteRoutes = require('../favorite');

const app = express();
app.use(express.json());
app.use('/api/favorites', favoriteRoutes);

// Mock repositories
jest.mock('../../repositories/favoriteRepository', () => ({
  getFavoritesByUser: jest.fn(),
  saveCafeAndAddFavorite: jest.fn(),
  removeFavorite: jest.fn(),
  isFavorite: jest.fn()
}));

const favoriteRepository = require('../../repositories/favoriteRepository');

describe('Favorite API', () => {
  const mockToken = jwt.sign(
    { userId: 1, email: 'test@example.com' },
    process.env.JWT_SECRET || 'your-secret-key-change-this'
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/favorites', () => {
    it('should get user favorites successfully', async () => {
      const mockFavorites = [
        {
          id: 1,
          name: 'Test Cafe',
          address: '123 Test St',
          lat: 21.028511,
          lng: 105.804817
        }
      ];

      favoriteRepository.getFavoritesByUser.mockResolvedValue(mockFavorites);

      const response = await request(app)
        .get('/api/favorites')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('favorites');
      expect(response.body.favorites).toEqual(mockFavorites);
    });
  });

  describe('POST /api/favorites', () => {
    it('should add cafe to favorites successfully', async () => {
      favoriteRepository.saveCafeAndAddFavorite.mockResolvedValue({
        cafeId: 1,
        favoriteId: 1
      });

      const response = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          provider: 'google',
          provider_place_id: 'test123',
          name: 'Test Cafe',
          address: '123 Test St',
          lat: 21.028511,
          lng: 105.804817,
          rating: 4.5
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('cafeId');
      expect(response.body).toHaveProperty('favoriteId');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          name: 'Test Cafe'
          // Missing provider, provider_place_id, lat, lng
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Thiếu thông tin quán cà phê');
    });

    it('should return 400 if cafe already in favorites', async () => {
      const error = new Error('Duplicate');
      error.code = '23505'; // Unique violation
      favoriteRepository.saveCafeAndAddFavorite.mockRejectedValue(error);

      const response = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          provider: 'google',
          provider_place_id: 'test123',
          name: 'Test Cafe',
          lat: 21.028511,
          lng: 105.804817
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Quán đã có trong danh sách yêu thích');
    });
  });

  describe('DELETE /api/favorites/:cafeId', () => {
    it('should remove cafe from favorites successfully', async () => {
      favoriteRepository.removeFavorite.mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/favorites/1')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Xóa khỏi yêu thích thành công');
    });

    it('should return 404 if favorite not found', async () => {
      favoriteRepository.removeFavorite.mockResolvedValue(false);

      const response = await request(app)
        .delete('/api/favorites/999')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Không tìm thấy trong danh sách yêu thích');
    });

    it('should return 400 if cafeId is invalid', async () => {
      const response = await request(app)
        .delete('/api/favorites/invalid')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('ID quán không hợp lệ');
    });
  });

  describe('GET /api/favorites/check/:cafeId', () => {
    it('should return true if cafe is favorite', async () => {
      favoriteRepository.isFavorite.mockResolvedValue(true);

      const response = await request(app)
        .get('/api/favorites/check/1')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.isFavorite).toBe(true);
    });

    it('should return false if cafe is not favorite', async () => {
      favoriteRepository.isFavorite.mockResolvedValue(false);

      const response = await request(app)
        .get('/api/favorites/check/1')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.isFavorite).toBe(false);
    });
  });
});

