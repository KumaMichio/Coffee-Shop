// backend/test/promotion/promotion.test.js
const request = require('supertest');
const express = require('express');
const promotionRoutes = require('../../src/api/promotion');
const testUtils = require('../setup');

const app = express();
app.use(express.json());
app.use('/api/promotions', promotionRoutes);

// Mock repositories
jest.mock('../../src/repositories/promotionRepository', () => ({
  getAllActivePromotions: jest.fn(),
  getPromotionsNearby: jest.fn(),
  getPromotionsByCafe: jest.fn(),
  getPromotionById: jest.fn(),
  createPromotion: jest.fn(),
  updatePromotion: jest.fn(),
  deletePromotion: jest.fn(),
  getAllPromotions: jest.fn()
}));

const promotionRepository = require('../../src/repositories/promotionRepository');

describe('Promotion API - Promotions Management', () => {
  const mockToken = testUtils.createMockToken();
  const mockAdminToken = testUtils.createMockToken(1, 'admin@example.com', 'admin');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/promotions/all', () => {
    it('should return all active promotions', async () => {
      const mockPromotions = [testUtils.createMockPromotion()];
      promotionRepository.getAllActivePromotions.mockResolvedValue(mockPromotions);

      const response = await request(app)
        .get('/api/promotions/all');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('promotions');
      expect(Array.isArray(response.body.promotions)).toBe(true);
    });

    it('should not require authentication', async () => {
      promotionRepository.getAllActivePromotions.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/promotions/all');

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/promotions/nearby', () => {
    it('should return nearby promotions successfully', async () => {
      const mockPromotions = [testUtils.createMockPromotion()];
      promotionRepository.getPromotionsNearby.mockResolvedValue(mockPromotions);

      const response = await request(app)
        .get('/api/promotions/nearby')
        .query({
          lat: 21.028511,
          lng: 105.804817,
          radius: 5000
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('promotions');
    });

    it('should return 400 if lat is missing', async () => {
      const response = await request(app)
        .get('/api/promotions/nearby')
        .query({
          lng: 105.804817
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('lat và lng là bắt buộc');
    });

    it('should return 400 if lng is missing', async () => {
      const response = await request(app)
        .get('/api/promotions/nearby')
        .query({
          lat: 21.028511
        });

      expect(response.status).toBe(400);
    });

    it('should use default radius if not provided', async () => {
      promotionRepository.getPromotionsNearby.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/promotions/nearby')
        .query({
          lat: 21.028511,
          lng: 105.804817
        });

      expect(response.status).toBe(200);
      expect(promotionRepository.getPromotionsNearby).toHaveBeenCalledWith(
        21.028511,
        105.804817,
        5000 // default radius
      );
    });

    it('should return 400 if lat/lng/radius are invalid numbers', async () => {
      const response = await request(app)
        .get('/api/promotions/nearby')
        .query({
          lat: 'invalid',
          lng: 105.804817,
          radius: 5000
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/promotions/cafe/:cafeId', () => {
    it('should return promotions for a cafe', async () => {
      const mockPromotions = [testUtils.createMockPromotion()];
      promotionRepository.getPromotionsByCafe.mockResolvedValue(mockPromotions);

      const response = await request(app)
        .get('/api/promotions/cafe/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('promotions');
    });

    it('should return 400 if cafeId is invalid', async () => {
      const response = await request(app)
        .get('/api/promotions/cafe/invalid');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('ID quán không hợp lệ');
    });

    it('should not require authentication', async () => {
      promotionRepository.getPromotionsByCafe.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/promotions/cafe/1');

      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/promotions', () => {
    it('should create promotion successfully', async () => {
      const mockPromotion = testUtils.createMockPromotion();
      promotionRepository.createPromotion.mockResolvedValue(mockPromotion);

      const response = await request(app)
        .post('/api/promotions')
        .set('Authorization', `Bearer ${mockAdminToken}`)
        .send({
          cafe_id: 1,
          title: 'Test Promotion',
          description: 'Test description',
          discount_type: 'percentage',
          discount_value: 20,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          is_active: true
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Khuyến mãi đã được tạo');
      expect(response.body).toHaveProperty('promotion');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/promotions')
        .set('Authorization', `Bearer ${mockAdminToken}`)
        .send({
          title: 'Test Promotion'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Thiếu thông tin bắt buộc');
    });

    it('should return 400 if discount_type is invalid', async () => {
      const response = await request(app)
        .post('/api/promotions')
        .set('Authorization', `Bearer ${mockAdminToken}`)
        .send({
          cafe_id: 1,
          title: 'Test Promotion',
          discount_type: 'invalid_type',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('discount_type phải là một trong');
    });

    it('should return 400 if end_date is before start_date', async () => {
      const response = await request(app)
        .post('/api/promotions')
        .set('Authorization', `Bearer ${mockAdminToken}`)
        .send({
          cafe_id: 1,
          title: 'Test Promotion',
          discount_type: 'percentage',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() - 1000).toISOString() // Past date
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('end_date phải sau start_date');
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .post('/api/promotions')
        .send({
          cafe_id: 1,
          title: 'Test Promotion',
          discount_type: 'percentage',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/promotions/:id', () => {
    it('should update promotion successfully', async () => {
      const updatedPromotion = testUtils.createMockPromotion({ title: 'Updated Title' });
      promotionRepository.updatePromotion.mockResolvedValue(updatedPromotion);

      const response = await request(app)
        .put('/api/promotions/1')
        .set('Authorization', `Bearer ${mockAdminToken}`)
        .send({
          title: 'Updated Title'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Khuyến mãi đã được cập nhật');
    });

    it('should return 404 if promotion does not exist', async () => {
      promotionRepository.updatePromotion.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/promotions/999')
        .set('Authorization', `Bearer ${mockAdminToken}`)
        .send({
          title: 'Updated Title'
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Không tìm thấy khuyến mãi');
    });

    it('should return 400 if id is invalid', async () => {
      const response = await request(app)
        .put('/api/promotions/invalid')
        .set('Authorization', `Bearer ${mockAdminToken}`)
        .send({
          title: 'Updated Title'
        });

      expect(response.status).toBe(400);
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .put('/api/promotions/1')
        .send({
          title: 'Updated Title'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/promotions/:id', () => {
    it('should delete promotion successfully', async () => {
      const deletedPromotion = testUtils.createMockPromotion();
      promotionRepository.deletePromotion.mockResolvedValue(deletedPromotion);

      const response = await request(app)
        .delete('/api/promotions/1')
        .set('Authorization', `Bearer ${mockAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Khuyến mãi đã được xóa');
    });

    it('should return 404 if promotion does not exist', async () => {
      promotionRepository.deletePromotion.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/promotions/999')
        .set('Authorization', `Bearer ${mockAdminToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 400 if id is invalid', async () => {
      const response = await request(app)
        .delete('/api/promotions/invalid')
        .set('Authorization', `Bearer ${mockAdminToken}`);

      expect(response.status).toBe(400);
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .delete('/api/promotions/1');

      expect(response.status).toBe(401);
    });
  });
});

