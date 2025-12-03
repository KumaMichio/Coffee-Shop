// backend/src/api/cafe.js
const express = require('express');
const db = require('../db');
const { searchCafesFromProviders } = require('../repositories/cafeRepository');

const router = express.Router();

// Helper: sort list theo sortKey
function sortCafes(list, sort, hasDistance) {
  switch (sort) {
    case 'rating':
      return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case 'name':
      return list.sort((a, b) => a.name.localeCompare(b.name));
    case 'distance':
      if (!hasDistance) return list;
      return list.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    default:
      return list;
  }
}

// GET /api/cafes/nearby?lat=&lng=&radius=&sort=
router.get('/nearby', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = req.query.radius ? parseInt(req.query.radius, 10) : 2000;
    const sort = req.query.sort || 'distance';

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res
        .status(400)
        .json({ message: 'lat và lng là bắt buộc (số thực)' });
    }

    const cafes = await searchCafesFromProviders({
      lat,
      lng,
      radius,
      keyword: null
    });

    const sorted = sortCafes(cafes, sort, true);
    res.json(sorted);
  } catch (err) {
    console.error('Error in /api/cafes/nearby', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/cafes/search?query=&lat=&lng=&sort=
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const sort = req.query.sort || 'rating';
    const lat = req.query.lat ? parseFloat(req.query.lat) : null;
    const lng = req.query.lng ? parseFloat(req.query.lng) : null;

    if (!query || query.trim() === '') {
      return res.status(400).json({ message: 'query is required' });
    }

    // Nếu có lat,lng → dùng làm center, nếu không thì set default Hà Nội
    const centerLat = lat ?? 21.028511;
    const centerLng = lng ?? 105.804817;

    const cafes = await searchCafesFromProviders({
      lat: centerLat,
      lng: centerLng,
      radius: 3000,
      keyword: query
    });

    const sorted = sortCafes(cafes, sort, lat != null && lng != null);
    res.json(sorted);
  } catch (err) {
    console.error('Error in /api/cafes/search', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/cafes/favorites
router.get('/favorites', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, provider, provider_place_id, name, address,
              lat, lng, rating, user_rating_count, is_favorite,
              created_at
       FROM cafes
       WHERE is_favorite = TRUE
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error in /api/cafes/favorites', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/cafes/favorites
router.post('/favorites', async (req, res) => {
  try {
    const {
      provider,
      provider_place_id,
      name,
      address,
      lat,
      lng,
      rating,
      user_rating_count
    } = req.body;

    if (!provider || !provider_place_id || !name || lat == null || lng == null) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    const result = await db.query(
      `INSERT INTO cafes
        (provider, provider_place_id, name, address, lat, lng, rating, user_rating_count, is_favorite)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,TRUE)
       ON CONFLICT (provider, provider_place_id)
       DO UPDATE SET
          name = EXCLUDED.name,
          address = EXCLUDED.address,
          lat = EXCLUDED.lat,
          lng = EXCLUDED.lng,
          rating = EXCLUDED.rating,
          user_rating_count = EXCLUDED.user_rating_count,
          is_favorite = TRUE,
          updated_at = NOW()
       RETURNING *`,
      [
        provider,
        provider_place_id,
        name,
        address || null,
        lat,
        lng,
        rating || null,
        user_rating_count || null
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error in POST /api/cafes/favorites', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// (Tuỳ: GET /api/cafes -> trả favorites, dùng cho backward compatibility)
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, provider, provider_place_id, name, address,
              lat, lng, rating, user_rating_count, is_favorite
       FROM cafes
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error in GET /api/cafes', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
