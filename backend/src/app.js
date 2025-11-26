// src/app.js
const express = require('express');
const app = express();
const cors = require('cors'); // CORS middleware để giải quyết vấn đề cross-origin
const cafeRoutes = require('./api/cafe');
const mapRoutes = require('./api/map');

// Sử dụng CORS để cho phép frontend truy cập API
app.use(cors());

// Cấu hình các route
app.use('/api/cafes', cafeRoutes);
app.use('/api/map', mapRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the Coffee Finder API');
});

module.exports = app;
