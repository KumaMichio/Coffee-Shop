// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Middleware xác thực JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  // 1. Không có Authorization header
  if (!authHeader) {
    return res.status(401).json({ error: 'Chưa đăng nhập' });
  }

  // 2. Header sai format (không phải "Bearer <token>")
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Token không hợp lệ' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Ví dụ: { userId, email }
    req.user = decoded;
    return next();
  } catch (error) {
    // Không spam log khi chạy test
    if (process.env.NODE_ENV !== 'test') {
      console.error('JWT verify error:', error.message);
    }

    // 3. Token sai / hết hạn → theo test: 401 + "Token không hợp lệ"
    return res.status(401).json({ error: 'Token không hợp lệ' });
  }
}

// Middleware kiểm tra quyền admin
function requireAdmin(req, res, next) {
  // authenticateToken phải được gọi trước để có req.user
  if (!req.user) {
    return res.status(401).json({ error: 'Chưa đăng nhập' });
  }

  // Kiểm tra role trong JWT token
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Không có quyền truy cập' });
  }

  return next();
}

module.exports = { authenticateToken, requireAdmin };
