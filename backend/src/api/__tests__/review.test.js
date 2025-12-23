// backend/src/api/__tests__/review.test.js
const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

// Mock middleware before importing routes
jest.mock('../../middleware/auth', () => {
  const jwt = require('jsonwebtoken');
  return {
    authenticateToken: (req, res, next) => {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this');
          req.user = { userId: decoded.userId, email: decoded.email };
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

const reviewRoutes = require('../review');

const app = express();
app.use(express.json());
app.use('/api/reviews', reviewRoutes);

// Mock repositories
jest.mock('../../repositories/reviewRepository', () => ({
  createOrUpdateReview: jest.fn(),
  getReviewsByCafe: jest.fn(),
  getReviewByUserAndCafe: jest.fn(),
  deleteReview: jest.fn(),
  getAverageRating: jest.fn()
}));

const reviewRepository = require('../../repositories/reviewRepository');

// Mock database
jest.mock('../../db', () => ({
  query: jest.fn()
}));

const db = require('../../db');

describe('Review API', () => {
  const mockToken = jwt.sign(
    { userId: 1, email: 'test@example.com' },
    process.env.JWT_SECRET || 'your-secret-key-change-this'
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/reviews', () => {
    it('should create a new review successfully', async () => {
      const mockReview = {
        id: 1,
        user_id: 1,
        cafe_id: 1,
        rating: 5,
        comment: 'Great coffee!',
        is_public: true,
        is_child_friendly: false
      };

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
      expect(response.body.error).toBe('Rating phải là số nguyên từ 1 đến 5');
    });

    it('should create cafe if cafe_id is string (provider_place_id)', async () => {
      const mockReview = {
        id: 1,
        user_id: 1,
        cafe_id: 1,
        rating: 4,
        comment: 'Nice place'
      };

      // Mock: cafe không tồn tại trong DB
      db.query.mockResolvedValueOnce({ rows: [] });
      
      // Mock: tạo cafe mới
      db.query.mockResolvedValueOnce({
        rows: [{ id: 1 }]
      });

      reviewRepository.createOrUpdateReview.mockResolvedValue(mockReview);

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          cafe_id: 'google_test123',
          cafe_data: {
            provider: 'google',
            provider_place_id: 'test123',
            name: 'Test Cafe',
            address: '123 Test St',
            lat: 21.028511,
            lng: 105.804817
          },
          rating: 4
        });

      expect(response.status).toBe(201);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id FROM cafes'),
        ['google', 'test123']
      );
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO cafes'),
        expect.arrayContaining(['google', 'test123', 'Test Cafe'])
      );
    });

    it('should return 400 if cafe_id is string but cafe_data is missing', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          cafe_id: 'google_test123',
          rating: 4
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Thiếu thông tin cafe_data khi cafe_id không phải là số');
    });

    it('should return 401 if token is missing', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .send({
          cafe_id: 1,
          rating: 5
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Chưa đăng nhập');
    });
  });

  describe('GET /api/reviews/cafe/:cafeId', () => {
    it('should get reviews for a cafe successfully', async () => {
      const mockReviews = [
        {
          id: 1,
          user_id: 1,
          cafe_id: 1,
          rating: 5,
          comment: 'Great!',
          username: 'testuser'
        }
      ];

      reviewRepository.getReviewsByCafe.mockResolvedValue(mockReviews);
      reviewRepository.getAverageRating.mockResolvedValue({
        avg_rating: 4.5,
        review_count: 10
      });

      const response = await request(app)
        .get('/api/reviews/cafe/1')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('reviews');
      expect(response.body).toHaveProperty('average_rating', 4.5);
      expect(response.body).toHaveProperty('review_count', 10);
    });

    it('should handle string cafeId (provider_provider_place_id)', async () => {
      db.query.mockResolvedValueOnce({
        rows: [{ id: 1 }]
      });

      reviewRepository.getReviewsByCafe.mockResolvedValue([]);
      reviewRepository.getAverageRating.mockResolvedValue({
        avg_rating: null,
        review_count: 0
      });

      const response = await request(app)
        .get('/api/reviews/cafe/google_test123')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id FROM cafes'),
        ['google', 'test123']
      );
    });

    it('should return empty reviews if cafe not in DB', async () => {
      db.query.mockResolvedValueOnce({
        rows: []
      });

      const response = await request(app)
        .get('/api/reviews/cafe/google_test123')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.reviews).toEqual([]);
      expect(response.body.average_rating).toBeNull();
      expect(response.body.review_count).toBe(0);
    });
  });

  describe('GET /api/reviews/my/:cafeId', () => {
    it('should get user review for a cafe', async () => {
      const mockReview = {
        id: 1,
        user_id: 1,
        cafe_id: 1,
        rating: 5,
        comment: 'My review'
      };

      reviewRepository.getReviewByUserAndCafe.mockResolvedValue(mockReview);

      const response = await request(app)
        .get('/api/reviews/my/1')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('review');
      expect(response.body.review.rating).toBe(5);
    });

    it('should return null if user has no review', async () => {
      reviewRepository.getReviewByUserAndCafe.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/reviews/my/1')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.review).toBeNull();
    });
  });

  describe('DELETE /api/reviews/:cafeId', () => {
    it('should delete review successfully', async () => {
      const mockReview = {
        id: 1,
        user_id: 1,
        cafe_id: 1
      };

      reviewRepository.deleteReview.mockResolvedValue(mockReview);

      const response = await request(app)
        .delete('/api/reviews/1')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Đánh giá đã được xóa');
    });

    it('should return 404 if review not found', async () => {
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
      expect(response.body.error).toBe('ID quán không hợp lệ');
    });
  });
});

