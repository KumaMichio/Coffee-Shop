// backend/test/auth/auth.test.js
const request = require('supertest');
const express = require('express');
const authRoutes = require('../../src/api/auth');
const testUtils = require('../setup');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Mock repositories
jest.mock('../../src/repositories/userRepository', () => ({
  findByEmail: jest.fn(),
  findByUsername: jest.fn(),
  findById: jest.fn(),
  create: jest.fn()
}));

const userRepository = require('../../src/repositories/userRepository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Auth API - Authentication', () => {
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
      expect(response.body).toHaveProperty('message', 'Đăng ký thành công');
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

    it('should return 400 if username is too short', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'ab',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Username phải từ 3-50 ký tự');
    });

    it('should return 400 if username is too long', async () => {
      const longUsername = 'a'.repeat(51);
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: longUsername,
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Username phải từ 3-50 ký tự');
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

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Vui lòng điền đầy đủ thông tin');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const mockUser = testUtils.createMockUser();
      userRepository.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Đăng nhập thành công');
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
      const mockUser = testUtils.createMockUser();
      userRepository.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Email hoặc mật khẩu không đúng');
    });

    it('should return 400 if email or password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Vui lòng điền email và mật khẩu');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user info with valid token', async () => {
      const mockUser = testUtils.createMockUser();
      const token = testUtils.createMockToken();
      userRepository.findById.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.id).toBe(1);
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should return 401 if token is missing', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
    });

    it('should return 404 if user does not exist', async () => {
      const token = testUtils.createMockToken();
      userRepository.findById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User không tồn tại');
    });
  });
});

