// backend/src/api/cafe.js
const express = require('express');
const db = require('../db');

const router = express.Router();

// Lấy list quán mặc định
router.get('/', async (req, res) => {
  try {
    const { query: keyword } = req.query;

    let sql = `
      SELECT id, name, address, lat, lng, rating, open_time, close_time
      FROM cafes
    `;
    const params = [];

    if (keyword) {
      params.push(`%${keyword}%`);
      sql += ' WHERE name ILIKE $1 OR address ILIKE $1';
    }

    sql += ' ORDER BY id LIMIT 50';

    const { rows } = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching cafes', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Search theo tên / địa chỉ
router.get('/search', async (req, res) => {
  try {
    const { query: keyword } = req.query;

    if (!keyword || keyword.trim() === '') {
      return res.status(400).json({ message: 'query is required' });
    }

    const sql = `
      SELECT id, name, address, lat, lng, rating, open_time, close_time
      FROM cafes
      WHERE name ILIKE $1 OR address ILIKE $1
      ORDER BY rating DESC NULLS LAST, id
      LIMIT 50
    `;
    const params = [`%${keyword}%`];

    const { rows } = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error searching cafes', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
