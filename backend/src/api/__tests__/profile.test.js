// backend/src/api/__tests__/profile.test.js
const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Mock middleware
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

const profileRoutes = require('../profile');

const app = express();
app.use(express.json());
app.use('/api/profile', profileRoutes);

// Mock repositories
jest.mock('../../repositories/userRepository', () => ({
  findById: jest.fn(),
  findByUsername: jest.fn(),
  findByEmail: jest.fn(),
  update: jest.fn(),
  updatePassword: jest.fn()
}));

jest.mock('../../repositories/reviewRepository', () => ({
  getReviewsByUser: jest.fn()
}));

const userRepository = require('../../repositories/userRepository');
const reviewRepository = require('../../repositories/reviewRepository');

describe('Profile API', () => {
  const mockToken = jwt.sign(
    { userId: 1, email: 'test@example.com' },
    process.env.JWT_SECRET || 'your-secret-key-change-this'
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/profile', () => {
    it('should get profile successfully', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        avatar_url: null,
        created_at: '2024-01-01'
      };

      const mockReviews = {
        reviews: [
          { id: 1, cafe_id: 1, rating: 5, comment: 'Great!' }
        ],
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
      expect(response.body.user.username).toBe('testuser');
    });

    it('should return 404 if user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User không tồn tại');
    });

    it('should handle pagination', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        avatar_url: null,
        created_at: '2024-01-01'
      };

      const mockReviews = {
        reviews: [],
        total: 0
      };

      userRepository.findById.mockResolvedValue(mockUser);
      reviewRepository.getReviewsByUser.mockResolvedValue(mockReviews);

      const response = await request(app)
        .get('/api/profile?page=2&limit=5')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.page).toBe(2);
      expect(response.body.limit).toBe(5);
      expect(reviewRepository.getReviewsByUser).toHaveBeenCalledWith(1, 5, 5);
    });
  });

  describe('PUT /api/profile', () => {
    it('should update username successfully', async () => {
      const updatedUser = {
        id: 1,
        username: 'newusername',
        email: 'test@example.com',
        avatar_url: null
      };

      userRepository.findByUsername.mockResolvedValue(null);
      userRepository.update.mockResolvedValue(updatedUser);

      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          username: 'newusername'
        });

      expect(response.status).toBe(200);
      expect(response.body.user.username).toBe('newusername');
    });

    it('should update email successfully', async () => {
      const updatedUser = {
        id: 1,
        username: 'testuser',
        email: 'newemail@example.com',
        avatar_url: null
      };

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.update.mockResolvedValue(updatedUser);

      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          email: 'newemail@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe('newemail@example.com');
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
      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          username: 'a'.repeat(51)
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Username phải từ 3-50 ký tự');
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
      userRepository.findByUsername.mockResolvedValue({
        id: 2,
        username: 'existinguser'
      });

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
      userRepository.findByEmail.mockResolvedValue({
        id: 2,
        email: 'existing@example.com'
      });

      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          email: 'existing@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email đã được sử dụng');
    });
  });

  describe('POST /api/profile/avatar', () => {
    it('should upload avatar with URL successfully', async () => {
      const updatedUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        avatar_url: 'https://example.com/avatar.jpg'
      };

      userRepository.update.mockResolvedValue(updatedUser);

      const response = await request(app)
        .post('/api/profile/avatar')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          avatar_url: 'https://example.com/avatar.jpg'
        });

      expect(response.status).toBe(200);
      expect(response.body.user.avatar_url).toBe('https://example.com/avatar.jpg');
    });

    it('should upload avatar with base64 successfully', async () => {
      const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const updatedUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        avatar_url: base64Image
      };

      userRepository.update.mockResolvedValue(updatedUser);

      const response = await request(app)
        .post('/api/profile/avatar')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          avatar_url: base64Image
        });

      expect(response.status).toBe(200);
      expect(response.body.user.avatar_url).toBe(base64Image);
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
  });

  describe('PUT /api/profile/password', () => {
    it('should change password successfully', async () => {
      const hashedPassword = await bcrypt.hash('oldpassword', 10);
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password_hash: hashedPassword
      };

      userRepository.findByEmail.mockResolvedValue(mockUser);
      userRepository.updatePassword.mockResolvedValue(true);

      const response = await request(app)
        .put('/api/profile/password')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          current_password: 'oldpassword',
          new_password: 'newpassword123'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Đổi mật khẩu thành công');
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
      expect(response.body.error).toBe('Vui lòng điền mật khẩu hiện tại và mật khẩu mới');
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

    it('should return 401 if current_password is incorrect', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password_hash: hashedPassword
      };

      userRepository.findByEmail.mockResolvedValue(mockUser);

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
  });
});

