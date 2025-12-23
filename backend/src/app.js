// src/app.js
const express = require('express');
const app = express();
const cors = require('cors'); // CORS middleware để giải quyết vấn đề cross-origin
const cafeRoutes = require('./api/cafe');
const mapRoutes = require('./api/map');
const authRoutes = require('./api/auth');
const favoriteRoutes = require('./api/favorite');
const reviewRoutes = require('./api/review');
const profileRoutes = require('./api/profile');
const promotionRoutes = require('./api/promotion');
const adminRoutes = require('./api/admin');

// Sử dụng CORS để cho phép frontend truy cập API
app.use(cors());
// Tăng limit body size để hỗ trợ upload avatar (base64 có thể lớn hơn file gốc ~33%)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cấu hình các route
app.use('/api/cafes', cafeRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the Coffee Finder API');
});



module.exports = app;
