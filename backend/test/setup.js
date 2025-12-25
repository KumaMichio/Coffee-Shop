// backend/test/setup.js
// Test setup và utilities

const jwt = require('jsonwebtoken');

// Mock database - must be before any imports that use db
jest.mock('../src/db', () => ({
  query: jest.fn()
}));

// Mock middleware
jest.mock('../src/middleware/auth', () => {
  const jwt = require('jsonwebtoken');
  return {
    authenticateToken: (req, res, next) => {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this');
          req.user = { userId: decoded.userId, email: decoded.email, role: decoded.role || 'user' };
          next();
        } catch (err) {
          res.status(401).json({ error: 'Token không hợp lệ' });
        }
      } else {
        res.status(401).json({ error: 'Chưa đăng nhập' });
      }
    },
    requireAdmin: (req, res, next) => {
      if (req.user && req.user.role === 'admin') {
        next();
      } else {
        res.status(403).json({ error: 'Không có quyền truy cập' });
      }
    }
  };
});

// Test utilities
const testUtils = {
  // Tạo mock JWT token
  createMockToken: (userId = 1, email = 'test@example.com', role = 'user') => {
    return jwt.sign(
      { userId, email, role },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: '7d' }
    );
  },

  // Tạo mock user
  createMockUser: (overrides = {}) => {
    return {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      password_hash: 'hashed_password',
      role: 'user',
      avatar_url: null,
      created_at: new Date(),
      ...overrides
    };
  },

  // Tạo mock cafe
  createMockCafe: (overrides = {}) => {
    return {
      id: 1,
      provider: 'goong',
      provider_place_id: 'test_place_id',
      name: 'Test Cafe',
      address: '123 Test Street',
      lat: 21.028511,
      lng: 105.804817,
      rating: 4.5,
      user_rating_count: 10,
      created_at: new Date(),
      ...overrides
    };
  },

  // Tạo mock review
  createMockReview: (overrides = {}) => {
    return {
      id: 1,
      user_id: 1,
      cafe_id: 1,
      rating: 5,
      comment: 'Great coffee!',
      is_public: true,
      is_child_friendly: false,
      created_at: new Date(),
      ...overrides
    };
  },

  // Tạo mock promotion
  createMockPromotion: (overrides = {}) => {
    return {
      id: 1,
      cafe_id: 1,
      title: 'Test Promotion',
      description: 'Test description',
      discount_type: 'percentage',
      discount_value: 20,
      start_date: new Date(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      is_active: true,
      created_at: new Date(),
      ...overrides
    };
  }
};

module.exports = testUtils;

