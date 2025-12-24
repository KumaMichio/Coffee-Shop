// backend/test/cafe/cafe.test.js
const request = require('supertest');
const express = require('express');
const testUtils = require('../setup');

// Mock repositories before requiring routes
jest.mock('../../src/repositories/cafeRepository', () => ({
  searchCafesFromProviders: jest.fn()
}));

jest.mock('../../src/repositories/reviewRepository', () => ({
  getAverageRating: jest.fn()
}));

const cafeRoutes = require('../../src/api/cafe');
const cafeRepository = require('../../src/repositories/cafeRepository');
const reviewRepository = require('../../src/repositories/reviewRepository');
const db = require('../../src/db');

const app = express();
app.use(express.json());
app.use('/api/cafes', cafeRoutes);

describe('Cafe API - Cafe Search & Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/cafes/nearby', () => {
    it('should return nearby cafes successfully', async () => {
      const mockCafes = [
        testUtils.createMockCafe({ id: 1, name: 'Cafe 1', distance: 500 }),
        testUtils.createMockCafe({ id: 2, name: 'Cafe 2', distance: 1000 })
      ];

      cafeRepository.searchCafesFromProviders.mockResolvedValue(mockCafes);
      reviewRepository.getAverageRating.mockResolvedValue({ avg_rating: 4.5, review_count: 10 });

      const response = await request(app)
        .get('/api/cafes/nearby')
        .query({
          lat: 21.028511,
          lng: 105.804817,
          radius: 2000,
          sort: 'distance'
        });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('distance');
    });

    it('should return 400 if lat is missing', async () => {
      const response = await request(app)
        .get('/api/cafes/nearby')
        .query({
          lng: 105.804817
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('lat và lng là bắt buộc');
    });

    it('should return 400 if lng is missing', async () => {
      const response = await request(app)
        .get('/api/cafes/nearby')
        .query({
          lat: 21.028511
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('lat và lng là bắt buộc');
    });

    it('should return 400 if lat is not a number', async () => {
      const response = await request(app)
        .get('/api/cafes/nearby')
        .query({
          lat: 'invalid',
          lng: 105.804817
        });

      expect(response.status).toBe(400);
    });

    it('should use default radius if not provided', async () => {
      const mockCafes = [testUtils.createMockCafe()];
      cafeRepository.searchCafesFromProviders.mockResolvedValue(mockCafes);
      reviewRepository.getAverageRating.mockResolvedValue({ avg_rating: null, review_count: 0 });

      const response = await request(app)
        .get('/api/cafes/nearby')
        .query({
          lat: 21.028511,
          lng: 105.804817
        });

      expect(response.status).toBe(200);
      expect(cafeRepository.searchCafesFromProviders).toHaveBeenCalledWith(
        expect.objectContaining({
          radius: 2000 // default radius
        })
      );
    });

    it('should sort by rating when sort=rating', async () => {
      const mockCafes = [
        testUtils.createMockCafe({ id: 1, rating: 4.0, user_rating: 4.5 }),
        testUtils.createMockCafe({ id: 2, rating: 4.5, user_rating: 4.0 })
      ];

      cafeRepository.searchCafesFromProviders.mockResolvedValue(mockCafes);
      reviewRepository.getAverageRating.mockResolvedValue({ avg_rating: 4.5, review_count: 10 });

      const response = await request(app)
        .get('/api/cafes/nearby')
        .query({
          lat: 21.028511,
          lng: 105.804817,
          sort: 'rating'
        });

      expect(response.status).toBe(200);
      // First cafe should have higher rating
      expect(response.body[0].user_rating).toBeGreaterThanOrEqual(response.body[1].user_rating);
    });
  });

  describe('GET /api/cafes/search', () => {
    it('should search cafes by query successfully', async () => {
      const mockCafes = [
        testUtils.createMockCafe({ id: 1, name: 'Starbucks Coffee' })
      ];

      cafeRepository.searchCafesFromProviders.mockResolvedValue(mockCafes);
      reviewRepository.getAverageRating.mockResolvedValue({ avg_rating: 4.5, review_count: 10 });

      const response = await request(app)
        .get('/api/cafes/search')
        .query({
          query: 'starbucks',
          lat: 21.028511,
          lng: 105.804817
        });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(cafeRepository.searchCafesFromProviders).toHaveBeenCalledWith(
        expect.objectContaining({
          keyword: 'starbucks'
        })
      );
    });

    it('should return 400 if query is missing', async () => {
      const response = await request(app)
        .get('/api/cafes/search')
        .query({
          lat: 21.028511,
          lng: 105.804817
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('query is required');
    });

    it('should return 400 if query is empty', async () => {
      const response = await request(app)
        .get('/api/cafes/search')
        .query({
          query: '   ',
          lat: 21.028511,
          lng: 105.804817
        });

      expect(response.status).toBe(400);
    });

    it('should use default location if lat/lng not provided', async () => {
      const mockCafes = [testUtils.createMockCafe()];
      cafeRepository.searchCafesFromProviders.mockResolvedValue(mockCafes);
      reviewRepository.getAverageRating.mockResolvedValue({ avg_rating: null, review_count: 0 });

      const response = await request(app)
        .get('/api/cafes/search')
        .query({
          query: 'starbucks'
        });

      expect(response.status).toBe(200);
      expect(cafeRepository.searchCafesFromProviders).toHaveBeenCalledWith(
        expect.objectContaining({
          lat: 21.028511, // default Hanoi location
          lng: 105.804817
        })
      );
    });
  });

  describe('GET /api/cafes', () => {
    it('should return all cafes from database', async () => {
      const mockCafes = [
        testUtils.createMockCafe({ id: 1 }),
        testUtils.createMockCafe({ id: 2 })
      ];

      db.query.mockResolvedValue({ rows: mockCafes });
      // Mock getAverageRating for each cafe
      reviewRepository.getAverageRating
        .mockResolvedValueOnce({ avg_rating: 4.5, review_count: 10 })
        .mockResolvedValueOnce({ avg_rating: 4.3, review_count: 8 });

      const response = await request(app)
        .get('/api/cafes');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      // Verify db.query was called
      expect(db.query).toHaveBeenCalled();
      // Verify it was called with SELECT query
      const calls = db.query.mock.calls;
      const selectCall = calls.find(call => call[0] && call[0].includes('SELECT'));
      expect(selectCall).toBeDefined();
    });

    it('should only return cafes with valid coordinates', async () => {
      const mockCafes = [
        testUtils.createMockCafe({ id: 1, lat: 21.028511, lng: 105.804817 }),
        testUtils.createMockCafe({ id: 2, lat: null, lng: null })
      ];

      db.query.mockResolvedValue({ rows: mockCafes.filter(c => c.lat && c.lng) });
      reviewRepository.getAverageRating.mockResolvedValue({ avg_rating: null, review_count: 0 });

      const response = await request(app)
        .get('/api/cafes');

      expect(response.status).toBe(200);
      // Should only return cafes with valid coordinates
      expect(response.body.every(c => c.lat && c.lng)).toBe(true);
    });
  });
});

