// backend/src/api/__tests__/auth.test.js
const request = require('supertest');
const express = require('express');
const authRoutes = require('../auth');
const db = require('../../db');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Mock database
jest.mock('../../db', () => ({
  query: jest.fn()
}));

// Mock repositories
jest.mock('../../repositories/userRepository', () => ({
  findByEmail: jest.fn(),
  findByUsername: jest.fn(),
  findById: jest.fn(),
  create: jest.fn()
}));

const userRepository = require('../../repositories/userRepository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.findByUsername.mockResolvedValue(null);
      userRepository.create.mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashed_password'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe('testuser');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should return 400 if email already exists', async () => {
      userRepository.findByEmail.mockResolvedValue({ id: 1, email: 'test@example.com' });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email đã được sử dụng');
    });

    it('should return 400 if username already exists', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.findByUsername.mockResolvedValue({ id: 1, username: 'testuser' });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Username đã được sử dụng');
    });

    it('should return 400 if email format is invalid', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'invalid-email',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email không đúng định dạng');
    });

    it('should return 400 if password is too short', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: '12345'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Mật khẩu phải có ít nhất 6 ký tự');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      userRepository.findByEmail.mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password_hash: hashedPassword
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    it('should return 401 if email does not exist', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Email hoặc mật khẩu không đúng');
    });

    it('should return 401 if password is incorrect', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      userRepository.findByEmail.mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password_hash: hashedPassword
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Email hoặc mật khẩu không đúng');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user info with valid token', async () => {
      const token = jwt.sign(
        { userId: 1, email: 'test@example.com' },
        process.env.JWT_SECRET || 'your-secret-key-change-this'
      );

      userRepository.findById.mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com'
      });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
    });

    it('should return 401 if token is missing', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Chưa đăng nhập');
    });

    it('should return 401 if token is invalid', async () => {
      // Use a malformed token (not a valid JWT format)
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token-format');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Token không hợp lệ');
    });
  });
});

