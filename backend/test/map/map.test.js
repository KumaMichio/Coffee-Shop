// backend/test/map/map.test.js
const request = require('supertest');
const express = require('express');

// Mock config before requiring map routes
const mockConfig = {
  goong: {
    restApiKey: 'test_goong_key'
  }
};

jest.mock('../../src/config', () => mockConfig);

// Mock fetch before requiring routes
global.fetch = jest.fn();

const mapRoutes = require('../../src/api/map');

const app = express();
app.use(express.json());
app.use('/api/map', mapRoutes);

describe('Map API - Map Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset config mock
    mockConfig.goong.restApiKey = 'test_goong_key';
  });

  afterEach(() => {
    // Restore config after each test
    mockConfig.goong.restApiKey = 'test_goong_key';
  });

  describe('GET /api/map/current-location', () => {
    it('should return location for default address', async () => {
      const mockResponse = {
        results: [
          {
            formatted_address: 'Hồ Gươm, Hoàn Kiếm, Hà Nội, Việt Nam',
            geometry: {
              location: {
                lat: 21.028511,
                lng: 105.804817
              }
            }
          }
        ]
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const response = await request(app)
        .get('/api/map/current-location');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('lat', 21.028511);
      expect(response.body).toHaveProperty('lng', 105.804817);
      expect(response.body).toHaveProperty('formatted_address');
    });

    it('should return location for custom address', async () => {
      const mockResponse = {
        results: [
          {
            formatted_address: '123 Test Street, Hà Nội',
            geometry: {
              location: {
                lat: 21.030000,
                lng: 105.810000
              }
            }
          }
        ]
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const response = await request(app)
        .get('/api/map/current-location')
        .query({ address: '123 Test Street' });

      expect(response.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('123%20Test%20Street')
      );
    });

    it('should return 500 if GOONG_API_KEY is missing', async () => {
      // Mock config to return empty restApiKey
      mockConfig.goong.restApiKey = '';

      const response = await request(app)
        .get('/api/map/current-location');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('GOONG_API_KEY is missing');
      
      // Restore for other tests
      mockConfig.goong.restApiKey = 'test_goong_key';
    });

    it('should return 500 if geocode request fails', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500
      });

      const response = await request(app)
        .get('/api/map/current-location');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Geocode request failed');
    });

    it('should return 404 if no results from Goong', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] })
      });

      const response = await request(app)
        .get('/api/map/current-location');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('No results from Goong');
    });
  });

  describe('GET /api/map/geocode', () => {
    it('should geocode address successfully', async () => {
      const mockResponse = {
        results: [
          {
            formatted_address: '123 Test Street, Hà Nội',
            geometry: {
              location: {
                lat: 21.030000,
                lng: 105.810000
              }
            }
          }
        ]
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const response = await request(app)
        .get('/api/map/geocode')
        .query({ address: '123 Test Street' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('results');
    });

    it('should return 400 if address is missing', async () => {
      const response = await request(app)
        .get('/api/map/geocode');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('address is required');
    });

    it('should return 500 if GOONG_API_KEY is missing', async () => {
      // Mock config to return empty restApiKey
      mockConfig.goong.restApiKey = '';

      const response = await request(app)
        .get('/api/map/geocode')
        .query({ address: '123 Test Street' });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('GOONG_API_KEY is missing');
      
      // Restore for other tests
      mockConfig.goong.restApiKey = 'test_goong_key';
    });

    it('should return 500 if geocode request fails', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500
      });

      const response = await request(app)
        .get('/api/map/geocode')
        .query({ address: '123 Test Street' });

      expect(response.status).toBe(500);
    });
  });
});

