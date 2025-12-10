// backend/src/api/cafe.js
const express = require('express');
const db = require('../db');
const { searchCafesFromProviders } = require('../repositories/cafeRepository');
const reviewRepository = require('../repositories/reviewRepository');

const router = express.Router();

// Helper: sort list theo sortKey
function sortCafes(list, sort, hasDistance) {
  switch (sort) {
    case 'rating':
      // Ưu tiên user_rating, nếu không có thì dùng rating từ provider
      return list.sort((a, b) => {
        const ratingA = a.user_rating != null ? a.user_rating : (a.rating || 0);
        const ratingB = b.user_rating != null ? b.user_rating : (b.rating || 0);
        return ratingB - ratingA;
      });
    case 'name':
      return list.sort((a, b) => a.name.localeCompare(b.name));
    case 'distance':
      if (!hasDistance) return list;
      return list.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    default:
      return list;
  }
}

// Helper: Lấy average ratings cho nhiều cafes
async function getCafesWithRatings(cafes) {
  if (!cafes || cafes.length === 0) return cafes;

  // Lấy tất cả cafe IDs (nếu có)
  const cafeIds = cafes
    .map(c => c.id)
    .filter(id => id != null && !isNaN(id));

  if (cafeIds.length === 0) {
    // Nếu không có cafe IDs, trả về với rating null
    return cafes.map(c => ({ ...c, user_rating: null, review_count: 0 }));
  }

  // Lấy ratings từ database
  const ratingMap = new Map();
  for (const cafeId of cafeIds) {
    try {
      const ratingData = await reviewRepository.getAverageRating(cafeId);
      ratingMap.set(cafeId, {
        user_rating: ratingData.avg_rating,
        review_count: ratingData.review_count
      });
    } catch (err) {
      console.error(`Error getting rating for cafe ${cafeId}:`, err);
      ratingMap.set(cafeId, { user_rating: null, review_count: 0 });
    }
  }

  // Gắn ratings vào cafes
  return cafes.map(cafe => {
    if (cafe.id && ratingMap.has(cafe.id)) {
      const rating = ratingMap.get(cafe.id);
      return {
        ...cafe,
        user_rating: rating.user_rating,
        review_count: rating.review_count
      };
    }
    return {
      ...cafe,
      user_rating: null,
      review_count: 0
    };
  });
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

    // Lấy ratings từ reviews
    const cafesWithRatings = await getCafesWithRatings(cafes);

    const sorted = sortCafes(cafesWithRatings, sort, true);
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

    // Lấy ratings từ reviews
    const cafesWithRatings = await getCafesWithRatings(cafes);

    const sorted = sortCafes(cafesWithRatings, sort, lat != null && lng != null);
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
    const cafes = result.rows;
    const cafesWithRatings = await getCafesWithRatings(cafes);
    res.json(cafesWithRatings);
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
        (provider, provider_place_id, name, address, lat, lng, rating, user_rating_count)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (provider, provider_place_id)
       DO UPDATE SET
          name = EXCLUDED.name,
          address = EXCLUDED.address,
          lat = EXCLUDED.lat,
          lng = EXCLUDED.lng,
          rating = EXCLUDED.rating,
          user_rating_count = EXCLUDED.user_rating_count,
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
