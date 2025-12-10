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

// Sử dụng CORS để cho phép frontend truy cập API
app.use(cors());
app.use(express.json());

// Cấu hình các route
app.use('/api/cafes', cafeRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/profile', profileRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the Coffee Finder API');
});



module.exports = app;
