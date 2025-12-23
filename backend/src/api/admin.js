// backend/src/api/admin.js
const express = require('express');
const userRepository = require('../repositories/userRepository');
const reviewRepository = require('../repositories/reviewRepository');
const promotionRepository = require('../repositories/promotionRepository');
const { authenticateToken } = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

// Tất cả routes đều cần authentication
router.use(authenticateToken);

// GET /api/admin/users - Lấy danh sách tất cả users
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let query = `
      SELECT 
        id, username, email, avatar_url, created_at, updated_at
      FROM users
    `;
    const params = [];

    if (search) {
      query += ` WHERE username ILIKE $1 OR email ILIKE $1`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    // Lấy tổng số users
    let countQuery = `SELECT COUNT(*) as total FROM users`;
    const countParams = [];
    if (search) {
      countQuery += ` WHERE username ILIKE $1 OR email ILIKE $1`;
      countParams.push(`%${search}%`);
    }
    const countResult = await db.query(countQuery, countParams);

    res.json({
      users: result.rows,
      total: parseInt(countResult.rows[0].total),
      page,
      limit
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Get users error:', error);
    }
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// GET /api/admin/reviews - Lấy tất cả reviews
router.get('/reviews', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const cafeId = req.query.cafe_id;

    let query = `
      SELECT 
        r.*,
        u.username,
        u.email,
        c.name as cafe_name,
        c.address as cafe_address
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN cafes c ON r.cafe_id = c.id
    `;
    const params = [];

    if (cafeId) {
      query += ` WHERE r.cafe_id = $1`;
      params.push(parseInt(cafeId));
    }

    query += ` ORDER BY r.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    // Lấy tổng số reviews
    let countQuery = `SELECT COUNT(*) as total FROM reviews`;
    const countParams = [];
    if (cafeId) {
      countQuery += ` WHERE cafe_id = $1`;
      countParams.push(parseInt(cafeId));
    }
    const countResult = await db.query(countQuery, countParams);

    res.json({
      reviews: result.rows,
      total: parseInt(countResult.rows[0].total),
      page,
      limit
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Get reviews error:', error);
    }
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// GET /api/admin/cafes - Lấy danh sách cafes (để chọn khi tạo promotion)
router.get('/cafes', async (req, res) => {
  try {
    const search = req.query.search || '';
    const limit = parseInt(req.query.limit) || 50;

    let query = `
      SELECT id, name, address, lat, lng, provider, provider_place_id
      FROM cafes
    `;
    const params = [];

    if (search) {
      query += ` WHERE name ILIKE $1 OR address ILIKE $1`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY name LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await db.query(query, params);

    res.json({ cafes: result.rows });
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Get cafes error:', error);
    }
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// DELETE /api/admin/users/:id - Xóa user (soft delete hoặc hard delete)
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const currentUserId = req.user.userId;

    // Không cho phép xóa chính mình
    if (userId === currentUserId) {
      return res.status(400).json({ error: 'Không thể xóa chính mình' });
    }

    // Xóa user (CASCADE sẽ xóa favorites và reviews)
    const result = await db.query(
      `DELETE FROM users WHERE id = $1 RETURNING id, username, email`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User không tồn tại' });
    }

    res.json({
      message: 'User đã được xóa',
      user: result.rows[0]
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Delete user error:', error);
    }
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// DELETE /api/admin/reviews/:id - Xóa review
router.delete('/reviews/:id', async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);

    const result = await db.query(
      `DELETE FROM reviews WHERE id = $1 RETURNING id`,
      [reviewId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review không tồn tại' });
    }

    res.json({
      message: 'Review đã được xóa'
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Delete review error:', error);
    }
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// GET /api/admin/stats - Lấy thống kê tổng quan
router.get('/stats', async (req, res) => {
  try {
    const [usersCount, reviewsCount, promotionsCount, cafesCount] = await Promise.all([
      db.query('SELECT COUNT(*) as count FROM users'),
      db.query('SELECT COUNT(*) as count FROM reviews'),
      db.query('SELECT COUNT(*) as count FROM promotions WHERE is_active = TRUE'),
      db.query('SELECT COUNT(*) as count FROM cafes')
    ]);

    res.json({
      total_users: parseInt(usersCount.rows[0].count),
      total_reviews: parseInt(reviewsCount.rows[0].count),
      active_promotions: parseInt(promotionsCount.rows[0].count),
      total_cafes: parseInt(cafesCount.rows[0].count)
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Get stats error:', error);
    }
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;

