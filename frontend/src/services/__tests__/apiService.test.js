// frontend/src/services/__tests__/apiService.test.js
import apiService from '../apiService';

// Mock fetch globally
global.fetch = jest.fn();

describe('apiService', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();
  });

  describe('searchCafes', () => {
    it('should search cafes successfully', async () => {
      const mockCafes = [
        { id: 1, name: 'Cafe 1', lat: 21.028511, lng: 105.804817 }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCafes
      });

      const result = await apiService.searchCafes({
        query: 'coffee',
        lat: 21.028511,
        lng: 105.804817,
        sort: 'rating'
      });

      expect(result).toEqual(mockCafes);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/cafes/search')
      );
    });

    it('should throw error if request fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false
      });

      await expect(
        apiService.searchCafes({ query: 'coffee' })
      ).rejects.toThrow('Failed to search cafes');
    });
  });

  describe('getNearbyCafes', () => {
    it('should get nearby cafes successfully', async () => {
      const mockCafes = [
        { id: 1, name: 'Cafe 1', distance: 0.5 }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCafes
      });

      const result = await apiService.getNearbyCafes({
        lat: 21.028511,
        lng: 105.804817,
        radius: 2000
      });

      expect(result).toEqual(mockCafes);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/cafes/nearby')
      );
    });
  });

  describe('saveFavoriteCafe', () => {
    it('should save favorite cafe successfully', async () => {
      localStorage.setItem('token', 'test-token');

      const mockResponse = {
        message: 'Thêm vào yêu thích thành công',
        cafeId: 1
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await apiService.saveFavoriteCafe({
        provider: 'google',
        provider_place_id: 'test123',
        name: 'Test Cafe',
        lat: 21.028511,
        lng: 105.804817
      });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/favorites'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );
    });

    it('should throw error if not authenticated', async () => {
      localStorage.removeItem('token');

      await expect(
        apiService.saveFavoriteCafe({
          provider: 'google',
          provider_place_id: 'test123',
          name: 'Test Cafe',
          lat: 21.028511,
          lng: 105.804817
        })
      ).rejects.toThrow('Not authenticated');
    });
  });
});




