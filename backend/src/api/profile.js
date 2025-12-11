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
        avatar_url: user.avatar_url || null,
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
    const { username, email, avatar_url } = req.body;

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

    // Validate avatar_url nếu có (chỉ validate URL, không validate base64 ở đây)
    const isUrl = avatar_url && (avatar_url.startsWith('http://') || avatar_url.startsWith('https://'));
    if (isUrl && avatar_url.length > 2000) {
      return res.status(400).json({
        error: 'Avatar URL quá dài'
      });
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
    const updatedUser = await userRepository.update(userId, { username, email, avatar_url });

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

// POST /api/profile/avatar - Upload avatar (nhận base64 hoặc URL)
router.post('/avatar', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { avatar_url } = req.body;

    if (!avatar_url) {
      if (process.env.NODE_ENV !== 'test') {
        console.error('Upload avatar: missing avatar_url in request body');
      }
      return res.status(400).json({
        error: 'avatar_url là bắt buộc'
      });
    }

    // Validate URL format hoặc base64
    const isBase64 = avatar_url.startsWith('data:image');
    const isUrl = avatar_url.startsWith('http://') || avatar_url.startsWith('https://');

    if (!isBase64 && !isUrl) {
      if (process.env.NODE_ENV !== 'test') {
        console.error('Upload avatar: invalid format, avatar_url starts with:', avatar_url.substring(0, 50));
      }
      return res.status(400).json({
        error: 'Avatar phải là URL hợp lệ hoặc base64 image'
      });
    }

    // Validate độ dài: base64 có thể lớn (ảnh 5MB base64 ~7MB), URL thì giới hạn ngắn hơn
    if (isUrl && avatar_url.length > 2000) {
      return res.status(400).json({
        error: 'Avatar URL quá dài'
      });
    }

    // Base64: ảnh 5MB sẽ có base64 khoảng 6.6-7MB, cho phép đến 10MB để an toàn
    if (isBase64 && avatar_url.length > 10 * 1024 * 1024) {
      return res.status(400).json({
        error: 'Image is too big'
      });
    }

    // Cập nhật avatar
    const updatedUser = await userRepository.update(userId, { avatar_url });

    res.json({
      message: 'Cập nhật avatar thành công',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar_url: updatedUser.avatar_url
      }
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Upload avatar error:', error);
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

