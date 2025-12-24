// backend/test/favorite/favorite.test.js
const request = require('supertest');
const express = require('express');
const favoriteRoutes = require('../../src/api/favorite');
const testUtils = require('../setup');

const app = express();
app.use(express.json());
app.use('/api/favorites', favoriteRoutes);

// Mock repositories
jest.mock('../../src/repositories/favoriteRepository', () => ({
  getFavoritesByUser: jest.fn(),
  saveCafeAndAddFavorite: jest.fn(),
  removeFavorite: jest.fn(),
  isFavorite: jest.fn()
}));

const favoriteRepository = require('../../src/repositories/favoriteRepository');

describe('Favorite API - Favorites Management', () => {
  const mockToken = testUtils.createMockToken();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/favorites', () => {
    it('should return user favorites successfully', async () => {
      const mockFavorites = [
        {
          id: 1,
          cafe_id: 1,
          cafe: testUtils.createMockCafe({ id: 1 }),
          created_at: new Date()
        }
      ];

      favoriteRepository.getFavoritesByUser.mockResolvedValue(mockFavorites);

      const response = await request(app)
        .get('/api/favorites')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Lấy danh sách yêu thích thành công');
      expect(response.body).toHaveProperty('favorites');
      expect(Array.isArray(response.body.favorites)).toBe(true);
    });

    it('should return empty array if user has no favorites', async () => {
      favoriteRepository.getFavoritesByUser.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/favorites')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.favorites).toEqual([]);
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .get('/api/favorites');

      expect(response.status).toBe(401);
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
          provider: 'goong',
          provider_place_id: 'test_place_id',
          name: 'Test Cafe',
          address: '123 Test Street',
          lat: 21.028511,
          lng: 105.804817,
          rating: 4.5
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Thêm vào yêu thích thành công');
      expect(response.body).toHaveProperty('cafeId');
      expect(response.body).toHaveProperty('favoriteId');
    });

    it('should return 400 if cafe is already in favorites', async () => {
      const error = new Error('Duplicate');
      error.code = '23505'; // PostgreSQL unique constraint violation
      favoriteRepository.saveCafeAndAddFavorite.mockRejectedValue(error);

      const response = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          provider: 'goong',
          provider_place_id: 'test_place_id',
          name: 'Test Cafe',
          address: '123 Test Street',
          lat: 21.028511,
          lng: 105.804817
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Quán đã có trong danh sách yêu thích');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          name: 'Test Cafe'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Thiếu thông tin quán cà phê');
    });

    it('should return 400 if lat or lng is missing', async () => {
      const response = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          provider: 'goong',
          provider_place_id: 'test_place_id',
          name: 'Test Cafe',
          address: '123 Test Street'
        });

      expect(response.status).toBe(400);
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .post('/api/favorites')
        .send({
          provider: 'goong',
          provider_place_id: 'test_place_id',
          name: 'Test Cafe',
          lat: 21.028511,
          lng: 105.804817
        });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/favorites/:cafeId', () => {
    it('should remove cafe from favorites successfully', async () => {
      favoriteRepository.removeFavorite.mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/favorites/1')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Xóa khỏi yêu thích thành công');
    });

    it('should return 404 if favorite does not exist', async () => {
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

    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .delete('/api/favorites/1');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/favorites/check/:cafeId', () => {
    it('should return true if cafe is in favorites', async () => {
      favoriteRepository.isFavorite.mockResolvedValue(true);

      const response = await request(app)
        .get('/api/favorites/check/1')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('isFavorite', true);
    });

    it('should return false if cafe is not in favorites', async () => {
      favoriteRepository.isFavorite.mockResolvedValue(false);

      const response = await request(app)
        .get('/api/favorites/check/1')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('isFavorite', false);
    });

    it('should return 400 if cafeId is invalid', async () => {
      const response = await request(app)
        .get('/api/favorites/check/invalid')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(400);
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .get('/api/favorites/check/1');

      expect(response.status).toBe(401);
    });
  });
});

