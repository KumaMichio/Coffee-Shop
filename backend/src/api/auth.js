// backend/src/api/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const JWT_EXPIRES_IN = '7d';

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// POST /api/auth/register - Đăng ký tài khoản mới
router.post('/register', async (req, res) => {
  try {
    // sửa lỗi destructuring: bỏ ký tự |
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Vui lòng điền đầy đủ thông tin'
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: 'Email không đúng định dạng'
      });
    }

    // Validate username length
    if (username.length < 3 || username.length > 50) {
      return res.status(400).json({
        error: 'Username phải từ 3-50 ký tự'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Mật khẩu phải có ít nhất 6 ký tự'
      });
    }

    // Kiểm tra email đã tồn tại
    const existingEmail = await userRepository.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({
        error: 'Email đã được sử dụng'
      });
    }

    // Kiểm tra username đã tồn tại
    const existingUsername = await userRepository.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json({
        error: 'Username đã được sử dụng'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Tạo user mới
    const user = await userRepository.create(username, email, passwordHash);

    // Tạo JWT token (role mặc định là 'user')
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: 'user' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Đăng ký thành công',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: 'user'
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// POST /api/auth/login - Đăng nhập
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Vui lòng điền email và mật khẩu'
      });
    }

    // Tìm user theo email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Kiểm tra password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Tạo JWT token (bao gồm role)
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role || 'user' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role || 'user'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// GET /api/auth/me - Lấy thông tin user hiện tại (cần token)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // authenticateToken đã verify JWT và gắn decoded vào req.user
    const user = await userRepository.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'User không tồn tại' });
    }

    // Trả về user với role
    res.json({ 
      user: {
        ...user,
        role: user.role || 'user'
      }
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Get me error:', error);
    }
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;
