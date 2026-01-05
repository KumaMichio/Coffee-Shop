// backend/src/api/__tests__/cafe.test.js
const request = require('supertest');
const express = require('express');
const cafeRoutes = require('../cafe');

const app = express();
app.use(express.json());
app.use('/api/cafes', cafeRoutes);

// Mock repositories
jest.mock('../../repositories/cafeRepository', () => ({
  searchCafesFromProviders: jest.fn()
}));

const cafeRepository = require('../../repositories/cafeRepository');

describe('Cafe API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/cafes/nearby', () => {
    it('should return nearby cafes successfully', async () => {
      const mockCafes = [
        {
          provider: 'google',
          provider_place_id: 'test1',
          name: 'Cafe 1',
          address: '123 Test St',
          lat: 21.028511,
          lng: 105.804817,
          rating: 4.5,
          distance: 0.5
        },
        {
          provider: 'goong',
          provider_place_id: 'test2',
          name: 'Cafe 2',
          address: '456 Test St',
          lat: 21.029511,
          lng: 105.805817,
          rating: 4.0,
          distance: 1.2
        }
      ];

      cafeRepository.searchCafesFromProviders.mockResolvedValue(mockCafes);

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
    });

    it('should return 400 if lat or lng is missing', async () => {
      const response = await request(app)
        .get('/api/cafes/nearby')
        .query({
          lat: 'invalid',
          lng: 105.804817
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('lat và lng là bắt buộc (số thực)');
    });

    it('should use default radius if not provided', async () => {
      cafeRepository.searchCafesFromProviders.mockResolvedValue([]);

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
  });

  describe('GET /api/cafes/search', () => {
    it('should search cafes successfully', async () => {
      const mockCafes = [
        {
          provider: 'google',
          provider_place_id: 'test1',
          name: 'Coffee Shop',
          address: '123 Test St',
          lat: 21.028511,
          lng: 105.804817,
          rating: 4.5
        }
      ];

      cafeRepository.searchCafesFromProviders.mockResolvedValue(mockCafes);

      const response = await request(app)
        .get('/api/cafes/search')
        .query({
          query: 'coffee',
          lat: 21.028511,
          lng: 105.804817,
          sort: 'rating'
        });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
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

    it('should use default location if lat/lng not provided', async () => {
      cafeRepository.searchCafesFromProviders.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/cafes/search')
        .query({
          query: 'coffee'
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
});




