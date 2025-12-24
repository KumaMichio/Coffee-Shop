// backend/test/review/review.test.js
const request = require('supertest');
const express = require('express');
const reviewRoutes = require('../../src/api/review');
const testUtils = require('../setup');

const app = express();
app.use(express.json());
app.use('/api/reviews', reviewRoutes);

// Mock repositories
jest.mock('../../src/repositories/reviewRepository', () => ({
  createOrUpdateReview: jest.fn(),
  getReviewsByCafe: jest.fn(),
  getReviewByUserAndCafe: jest.fn(),
  deleteReview: jest.fn(),
  getAverageRating: jest.fn()
}));

const reviewRepository = require('../../src/repositories/reviewRepository');
const db = require('../../src/db');

describe('Review API - Reviews Management', () => {
  const mockToken = testUtils.createMockToken();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/reviews', () => {
    it('should create a new review successfully', async () => {
      const mockReview = testUtils.createMockReview();
      reviewRepository.createOrUpdateReview.mockResolvedValue(mockReview);

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          cafe_id: 1,
          rating: 5,
          comment: 'Great coffee!',
          is_public: true,
          is_child_friendly: false
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Đánh giá đã được lưu');
      expect(response.body).toHaveProperty('review');
      expect(response.body.review.rating).toBe(5);
    });

    it('should create cafe if cafe_id is string (provider_place_id)', async () => {
      const mockReview = testUtils.createMockReview();
      db.query.mockResolvedValueOnce({ rows: [] }); // Cafe not found
      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Cafe created
      reviewRepository.createOrUpdateReview.mockResolvedValue(mockReview);

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          cafe_id: 'goong_test_place_id',
          cafe_data: {
            provider: 'goong',
            provider_place_id: 'test_place_id',
            name: 'Test Cafe',
            address: '123 Test Street',
            lat: 21.028511,
            lng: 105.804817
          },
          rating: 5,
          comment: 'Great coffee!'
        });

      expect(response.status).toBe(201);
      expect(db.query).toHaveBeenCalled(); // Should create cafe
    });

    it('should return 400 if cafe_id is missing', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          rating: 5
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('cafe_id và rating là bắt buộc');
    });

    it('should return 400 if rating is missing', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          cafe_id: 1
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('cafe_id và rating là bắt buộc');
    });

    it('should return 400 if rating is less than 1', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          cafe_id: 1,
          rating: 0
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Rating phải là số nguyên từ 1 đến 5');
    });

    it('should return 400 if rating is greater than 5', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          cafe_id: 1,
          rating: 6
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 if cafe_id is string but cafe_data is missing', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          cafe_id: 'goong_test_place_id',
          rating: 5
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Thiếu thông tin cafe_data khi cafe_id không phải là số');
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .send({
          cafe_id: 1,
          rating: 5
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/reviews/cafe/:cafeId', () => {
    it('should return reviews for a cafe successfully', async () => {
      const mockReviews = [testUtils.createMockReview()];
      reviewRepository.getReviewsByCafe.mockResolvedValue(mockReviews);
      reviewRepository.getAverageRating.mockResolvedValue({ avg_rating: 4.5, review_count: 1 });

      const response = await request(app)
        .get('/api/reviews/cafe/1')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('reviews');
      expect(response.body).toHaveProperty('average_rating');
      expect(response.body).toHaveProperty('review_count');
    });

    it('should handle cafe_id as provider_provider_place_id format', async () => {
      db.query.mockResolvedValue({ rows: [{ id: 1 }] });
      reviewRepository.getReviewsByCafe.mockResolvedValue([]);
      reviewRepository.getAverageRating.mockResolvedValue({ avg_rating: null, review_count: 0 });

      const response = await request(app)
        .get('/api/reviews/cafe/goong_test_place_id')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(db.query).toHaveBeenCalled();
    });

    it('should return empty reviews if cafe not in database', async () => {
      db.query.mockResolvedValue({ rows: [] });
      reviewRepository.getReviewsByCafe.mockResolvedValue([]);
      reviewRepository.getAverageRating.mockResolvedValue({ avg_rating: null, review_count: 0 });

      const response = await request(app)
        .get('/api/reviews/cafe/goong_nonexistent')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.reviews).toEqual([]);
      expect(response.body.review_count).toBe(0);
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .get('/api/reviews/cafe/1');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/reviews/my/:cafeId', () => {
    it('should return user review for a cafe', async () => {
      const mockReview = testUtils.createMockReview();
      reviewRepository.getReviewByUserAndCafe.mockResolvedValue(mockReview);

      const response = await request(app)
        .get('/api/reviews/my/1')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('review');
      expect(response.body.review).not.toBeNull();
    });

    it('should return null if user has no review', async () => {
      reviewRepository.getReviewByUserAndCafe.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/reviews/my/1')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.review).toBeNull();
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .get('/api/reviews/my/1');

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/reviews/:cafeId', () => {
    it('should delete review successfully', async () => {
      const mockReview = testUtils.createMockReview();
      reviewRepository.deleteReview.mockResolvedValue(mockReview);

      const response = await request(app)
        .delete('/api/reviews/1')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Đánh giá đã được xóa');
    });

    it('should return 404 if review does not exist', async () => {
      reviewRepository.deleteReview.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/reviews/999')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Không tìm thấy đánh giá');
    });

    it('should return 400 if cafeId is invalid', async () => {
      const response = await request(app)
        .delete('/api/reviews/invalid')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(400);
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .delete('/api/reviews/1');

      expect(response.status).toBe(401);
    });
  });
});

