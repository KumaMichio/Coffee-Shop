// backend/test/profile/profile.test.js
const request = require('supertest');
const express = require('express');
const profileRoutes = require('../../src/api/profile');
const testUtils = require('../setup');

const app = express();
// Increase body size limit for tests to allow testing large base64 images
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use('/api/profile', profileRoutes);

// Mock repositories
jest.mock('../../src/repositories/userRepository', () => ({
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findByUsername: jest.fn(),
  update: jest.fn(),
  updatePassword: jest.fn()
}));

jest.mock('../../src/repositories/reviewRepository', () => ({
  getReviewsByUser: jest.fn()
}));

const userRepository = require('../../src/repositories/userRepository');
const reviewRepository = require('../../src/repositories/reviewRepository');
const bcrypt = require('bcryptjs');

describe('Profile API - Profile Management', () => {
  const mockToken = testUtils.createMockToken();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/profile', () => {
    it('should return user profile successfully', async () => {
      const mockUser = testUtils.createMockUser();
      const mockReviews = {
        reviews: [testUtils.createMockReview()],
        total: 1
      };

      userRepository.findById.mockResolvedValue(mockUser);
      reviewRepository.getReviewsByUser.mockResolvedValue(mockReviews);

      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('reviews');
      expect(response.body.user.id).toBe(1);
    });

    it('should support pagination', async () => {
      const mockUser = testUtils.createMockUser();
      const mockReviews = { reviews: [], total: 0 };

      userRepository.findById.mockResolvedValue(mockUser);
      reviewRepository.getReviewsByUser.mockResolvedValue(mockReviews);

      const response = await request(app)
        .get('/api/profile')
        .query({ page: 2, limit: 10 })
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.page).toBe(2);
      expect(response.body.limit).toBe(10);
    });

    it('should return 404 if user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User không tồn tại');
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .get('/api/profile');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/profile', () => {
    it('should update profile successfully', async () => {
      const updatedUser = testUtils.createMockUser({ username: 'newusername' });
      userRepository.findByUsername.mockResolvedValue(null);
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.update.mockResolvedValue(updatedUser);

      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          username: 'newusername'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Cập nhật profile thành công');
      expect(response.body.user.username).toBe('newusername');
    });

    it('should return 400 if username is too short', async () => {
      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          username: 'ab'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Username phải từ 3-50 ký tự');
    });

    it('should return 400 if username is too long', async () => {
      const longUsername = 'a'.repeat(51);
      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          username: longUsername
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 if email format is invalid', async () => {
      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          email: 'invalid-email'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email không đúng định dạng');
    });

    it('should return 400 if username already exists', async () => {
      const existingUser = testUtils.createMockUser({ id: 2, username: 'existinguser' });
      userRepository.findByUsername.mockResolvedValue(existingUser);

      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          username: 'existinguser'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Username đã được sử dụng');
    });

    it('should return 400 if email already exists', async () => {
      const existingUser = testUtils.createMockUser({ id: 2, email: 'existing@example.com' });
      userRepository.findByEmail.mockResolvedValue(existingUser);

      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          email: 'existing@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email đã được sử dụng');
    });

    it('should return 400 if avatar URL is too long', async () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(2000);
      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          avatar_url: longUrl
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Avatar URL quá dài');
    });
  });

  describe('POST /api/profile/avatar', () => {
    it('should upload avatar with base64 successfully', async () => {
      const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...';
      const updatedUser = testUtils.createMockUser({ avatar_url: base64Image });
      userRepository.update.mockResolvedValue(updatedUser);

      const response = await request(app)
        .post('/api/profile/avatar')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          avatar_url: base64Image
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Cập nhật avatar thành công');
      expect(response.body.user.avatar_url).toBe(base64Image);
    });

    it('should upload avatar with URL successfully', async () => {
      const imageUrl = 'https://example.com/avatar.jpg';
      const updatedUser = testUtils.createMockUser({ avatar_url: imageUrl });
      userRepository.update.mockResolvedValue(updatedUser);

      const response = await request(app)
        .post('/api/profile/avatar')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          avatar_url: imageUrl
        });

      expect(response.status).toBe(200);
    });

    it('should return 400 if avatar_url is missing', async () => {
      const response = await request(app)
        .post('/api/profile/avatar')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('avatar_url là bắt buộc');
    });

    it('should return 400 if avatar format is invalid', async () => {
      const response = await request(app)
        .post('/api/profile/avatar')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          avatar_url: 'invalid-format'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Avatar phải là URL hợp lệ hoặc base64 image');
    });

    it('should return 400 or 413 if base64 image is too large', async () => {
      const largeBase64 = 'data:image/png;base64,' + 'a'.repeat(11 * 1024 * 1024); // > 10MB
      const response = await request(app)
        .post('/api/profile/avatar')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          avatar_url: largeBase64
        });

      // Express returns 413 (Payload Too Large) if body exceeds limit before validation
      // Or 400 if validation catches it first
      expect([400, 413]).toContain(response.status);
      if (response.status === 400) {
        expect(response.body.error).toBe('Image is too big');
      }
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .post('/api/profile/avatar')
        .send({
          avatar_url: 'https://example.com/avatar.jpg'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/profile/password', () => {
    it('should change password successfully', async () => {
      const mockUser = testUtils.createMockUser();
      userRepository.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      userRepository.updatePassword.mockResolvedValue();

      const response = await request(app)
        .put('/api/profile/password')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          current_password: 'oldpassword',
          new_password: 'newpassword123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Đổi mật khẩu thành công');
    });

    it('should return 400 if current_password is missing', async () => {
      const response = await request(app)
        .put('/api/profile/password')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          new_password: 'newpassword123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Vui lòng điền mật khẩu hiện tại và mật khẩu mới');
    });

    it('should return 400 if new_password is missing', async () => {
      const response = await request(app)
        .put('/api/profile/password')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          current_password: 'oldpassword'
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 if new_password is too short', async () => {
      const response = await request(app)
        .put('/api/profile/password')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          current_password: 'oldpassword',
          new_password: '12345'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Mật khẩu mới phải có ít nhất 6 ký tự');
    });

    it('should return 401 if current password is incorrect', async () => {
      const mockUser = testUtils.createMockUser();
      userRepository.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const response = await request(app)
        .put('/api/profile/password')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          current_password: 'wrongpassword',
          new_password: 'newpassword123'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Mật khẩu hiện tại không đúng');
    });

    it('should return 404 if user does not exist', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/profile/password')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          current_password: 'oldpassword',
          new_password: 'newpassword123'
        });

      expect(response.status).toBe(404);
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .put('/api/profile/password')
        .send({
          current_password: 'oldpassword',
          new_password: 'newpassword123'
        });

      expect(response.status).toBe(401);
    });
  });
});

