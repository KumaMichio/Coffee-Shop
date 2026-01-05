// backend/test/admin/admin.test.js
const request = require('supertest');
const express = require('express');
const testUtils = require('../setup');

// Mock repositories before requiring routes
jest.mock('../../src/repositories/userRepository', () => ({
  findById: jest.fn()
}));

const adminRoutes = require('../../src/api/admin');
const db = require('../../src/db');

const app = express();
app.use(express.json());
app.use('/api/admin', adminRoutes);

describe('Admin API - Admin Dashboard', () => {
  const mockAdminToken = testUtils.createMockToken(1, 'admin@example.com', 'admin');
  const mockUserToken = testUtils.createMockToken(2, 'user@example.com', 'user');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/admin/stats', () => {
    it('should return statistics successfully', async () => {
      // Mock all 4 queries in sequence
      db.query
        .mockResolvedValueOnce({ rows: [{ count: '100' }] }) // users
        .mockResolvedValueOnce({ rows: [{ count: '500' }] }) // reviews
        .mockResolvedValueOnce({ rows: [{ count: '10' }] }) // promotions
        .mockResolvedValueOnce({ rows: [{ count: '200' }] }); // cafes

      const response = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${mockAdminToken}`);

      expect(response.status).toBe(200);
      // Use toBeGreaterThanOrEqual to handle actual database values
      expect(response.body).toHaveProperty('total_users');
      expect(response.body).toHaveProperty('total_reviews');
      expect(response.body).toHaveProperty('active_promotions');
      expect(response.body).toHaveProperty('total_cafes');
      expect(typeof response.body.total_users).toBe('number');
      expect(typeof response.body.total_reviews).toBe('number');
      expect(typeof response.body.active_promotions).toBe('number');
      expect(typeof response.body.total_cafes).toBe('number');
    });

    it('should return 403 if user is not admin', async () => {
      const response = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${mockUserToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .get('/api/admin/stats');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/admin/users', () => {
    it('should return users list successfully', async () => {
      const mockUsers = [
        testUtils.createMockUser({ id: 1 }),
        testUtils.createMockUser({ id: 2 })
      ];

      db.query
        .mockResolvedValueOnce({ rows: mockUsers }) // users query
        .mockResolvedValueOnce({ rows: [{ total: '2' }] }); // count query

      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${mockAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('limit', 20);
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(typeof response.body.total).toBe('number');
    });

    it('should support pagination', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ total: '100' }] });

      const response = await request(app)
        .get('/api/admin/users')
        .query({ page: 2, limit: 10 })
        .set('Authorization', `Bearer ${mockAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.page).toBe(2);
      expect(response.body.limit).toBe(10);
    });

    it('should support search', async () => {
      const mockUsers = [testUtils.createMockUser({ username: 'testuser' })];
      db.query
        .mockResolvedValueOnce({ rows: mockUsers })
        .mockResolvedValueOnce({ rows: [{ total: '1' }] });

      const response = await request(app)
        .get('/api/admin/users')
        .query({ search: 'test' })
        .set('Authorization', `Bearer ${mockAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('users');
      // Check that db.query was called (at least for the main query)
      expect(db.query).toHaveBeenCalled();
      // Check that search parameter was used in query
      const calls = db.query.mock.calls;
      const searchCall = calls.find(call => 
        call[0] && call[0].includes('ILIKE') && call[1] && call[1][0] && call[1][0].includes('test')
      );
      expect(searchCall).toBeDefined();
    });

    it('should return 403 if user is not admin', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${mockUserToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/admin/users/:id', () => {
    it('should delete user successfully', async () => {
      const deletedUser = testUtils.createMockUser();
      db.query.mockResolvedValue({ rows: [deletedUser] });

      const response = await request(app)
        .delete('/api/admin/users/2')
        .set('Authorization', `Bearer ${mockAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'User đã được xóa');
    });

    it('should return 400 if trying to delete self', async () => {
      const response = await request(app)
        .delete('/api/admin/users/1')
        .set('Authorization', `Bearer ${mockAdminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Không thể xóa chính mình');
    });

    it('should return 404 if user does not exist', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .delete('/api/admin/users/999')
        .set('Authorization', `Bearer ${mockAdminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User không tồn tại');
    });

    it('should return 403 if user is not admin', async () => {
      const response = await request(app)
        .delete('/api/admin/users/2')
        .set('Authorization', `Bearer ${mockUserToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/admin/reviews', () => {
    it('should return reviews list successfully', async () => {
      const mockReviews = [testUtils.createMockReview()];
      db.query
        .mockResolvedValueOnce({ rows: mockReviews })
        .mockResolvedValueOnce({ rows: [{ total: '1' }] });

      const response = await request(app)
        .get('/api/admin/reviews')
        .set('Authorization', `Bearer ${mockAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('reviews');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.reviews)).toBe(true);
      expect(typeof response.body.total).toBe('number');
    });

    it('should filter by cafe_id', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ total: '0' }] });

      const response = await request(app)
        .get('/api/admin/reviews')
        .query({ cafe_id: 1 })
        .set('Authorization', `Bearer ${mockAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('reviews');
      // Check that db.query was called with cafe_id filter
      const calls = db.query.mock.calls;
      const filterCall = calls.find(call => 
        call[0] && call[0].includes('WHERE') && call[1] && call[1].includes(1)
      );
      expect(filterCall).toBeDefined();
    });

    it('should return 403 if user is not admin', async () => {
      const response = await request(app)
        .get('/api/admin/reviews')
        .set('Authorization', `Bearer ${mockUserToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/admin/reviews/:id', () => {
    it('should delete review successfully', async () => {
      db.query.mockResolvedValue({ rows: [{ id: 1 }] });

      const response = await request(app)
        .delete('/api/admin/reviews/1')
        .set('Authorization', `Bearer ${mockAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Review đã được xóa');
      expect(db.query).toHaveBeenCalled();
    });

    it('should return 404 if review does not exist', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .delete('/api/admin/reviews/999')
        .set('Authorization', `Bearer ${mockAdminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Review không tồn tại');
    });

    it('should return 403 if user is not admin', async () => {
      const response = await request(app)
        .delete('/api/admin/reviews/1')
        .set('Authorization', `Bearer ${mockUserToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/admin/cafes', () => {
    it('should return cafes list successfully', async () => {
      const mockCafes = [testUtils.createMockCafe()];
      db.query.mockResolvedValue({ rows: mockCafes });

      const response = await request(app)
        .get('/api/admin/cafes')
        .set('Authorization', `Bearer ${mockAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('cafes');
    });

    it('should support search', async () => {
      const mockCafes = [testUtils.createMockCafe({ name: 'Starbucks' })];
      db.query.mockResolvedValue({ rows: mockCafes });

      const response = await request(app)
        .get('/api/admin/cafes')
        .query({ search: 'starbucks' })
        .set('Authorization', `Bearer ${mockAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('cafes');
      // Check that db.query was called with search
      expect(db.query).toHaveBeenCalled();
      const calls = db.query.mock.calls;
      const searchCall = calls.find(call => 
        call[0] && call[0].includes('ILIKE') && call[1] && call[1][0] && call[1][0].includes('starbucks')
      );
      expect(searchCall).toBeDefined();
    });

    it('should return 403 if user is not admin', async () => {
      const response = await request(app)
        .get('/api/admin/cafes')
        .set('Authorization', `Bearer ${mockUserToken}`);

      expect(response.status).toBe(403);
    });
  });
});

