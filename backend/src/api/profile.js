// backend/src/api/profile.js
const express = require('express');
const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const reviewRepository = require('../repositories/reviewRepository');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Tất cả routes đều cần authentication
router.use(authenticateToken);

// GET /api/profile - Lấy thông tin profile và reviews của user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Lấy thông tin user
    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User không tồn tại' });
    }

    // Lấy reviews của user (page 1, 10 items)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const reviewsData = await reviewRepository.getReviewsByUser(userId, limit, offset);

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at
      },
      reviews: reviewsData.reviews,
      total_reviews: reviewsData.total,
      page,
      limit
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Get profile error:', error);
    }
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// PUT /api/profile - Cập nhật thông tin profile
router.put('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { username, email } = req.body;

    // Validate
    if (username && (username.length < 3 || username.length > 50)) {
      return res.status(400).json({
        error: 'Username phải từ 3-50 ký tự'
      });
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: 'Email không đúng định dạng'
        });
      }
    }

    // Kiểm tra username/email đã tồn tại (trừ user hiện tại)
    if (username) {
      const existingUser = await userRepository.findByUsername(username);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({
          error: 'Username đã được sử dụng'
        });
      }
    }

    if (email) {
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({
          error: 'Email đã được sử dụng'
        });
      }
    }

    // Cập nhật
    const updatedUser = await userRepository.update(userId, { username, email });

    res.json({
      message: 'Cập nhật profile thành công',
      user: updatedUser
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Update profile error:', error);
    }
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// PUT /api/profile/password - Đổi mật khẩu
router.put('/password', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        error: 'Vui lòng điền mật khẩu hiện tại và mật khẩu mới'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        error: 'Mật khẩu mới phải có ít nhất 6 ký tự'
      });
    }

    // Lấy user để kiểm tra mật khẩu hiện tại
    const user = await userRepository.findByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ error: 'User không tồn tại' });
    }

    // Kiểm tra mật khẩu hiện tại
    const isPasswordValid = await bcrypt.compare(current_password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Mật khẩu hiện tại không đúng'
      });
    }

    // Hash mật khẩu mới
    const passwordHash = await bcrypt.hash(new_password, 10);

    // Cập nhật
    await userRepository.updatePassword(userId, passwordHash);

    res.json({
      message: 'Đổi mật khẩu thành công'
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Change password error:', error);
    }
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;

