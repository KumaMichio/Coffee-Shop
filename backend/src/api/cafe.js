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
    case 'price':
    case 'price_low':
      // Sort by price_level: lower price_level (1=$) first, nulls last
      return list.sort((a, b) => {
        const priceA = a.price_level != null ? a.price_level : 999;
        const priceB = b.price_level != null ? b.price_level : 999;
        return priceA - priceB;
      });
    case 'price_high':
      // Sort by price_level: higher price_level (4=$$$$) first, nulls last
      return list.sort((a, b) => {
        const priceA = a.price_level != null ? a.price_level : 0;
        const priceB = b.price_level != null ? b.price_level : 0;
        return priceB - priceA;
      });
    default:
      return list;
  }
}

// Helper: Lấy average ratings và price_level từ database cho nhiều cafes
async function getCafesWithRatings(cafes) {
  if (!cafes || cafes.length === 0) return cafes;

  // Lấy tất cả cafe IDs và provider+place_id để merge data từ DB
  const cafeIds = cafes
    .map(c => c.id)
    .filter(id => id != null && !isNaN(id));
  
  const providerPlaceIds = cafes
    .filter(c => c.provider && c.provider_place_id && !c.id)
    .map(c => ({ provider: c.provider, provider_place_id: c.provider_place_id }));

  const dbDataMap = new Map(); // key: id hoặc provider:provider_place_id

  // Lấy ratings và price_level từ DB theo IDs
  if (cafeIds.length > 0) {
    const placeholders = cafeIds.map((_, i) => `$${i + 1}`).join(',');
    const result = await db.query(
      `SELECT id, price_level FROM cafes WHERE id IN (${placeholders})`,
      cafeIds
    );
    result.rows.forEach(row => {
      dbDataMap.set(`id_${row.id}`, { price_level: row.price_level });
    });
  }

  // Lấy ratings và price_level từ DB theo provider+place_id
  if (providerPlaceIds.length > 0) {
    for (const { provider, provider_place_id } of providerPlaceIds) {
      const result = await db.query(
        `SELECT id, price_level FROM cafes WHERE provider = $1 AND provider_place_id = $2 LIMIT 1`,
        [provider, provider_place_id]
      );
      if (result.rows.length > 0) {
        dbDataMap.set(`${provider}:${provider_place_id}`, {
          id: result.rows[0].id,
          price_level: result.rows[0].price_level
        });
      }
    }
  }

  // Lấy ratings từ reviews cho các cafes có ID
  const ratingMap = new Map();
  const allIds = [...cafeIds];
  providerPlaceIds.forEach(pp => {
    const dbData = dbDataMap.get(`${pp.provider}:${pp.provider_place_id}`);
    if (dbData && dbData.id) {
      allIds.push(dbData.id);
    }
  });

  for (const cafeId of [...new Set(allIds)]) {
    try {
      const ratingData = await reviewRepository.getAverageRating(cafeId);
      ratingMap.set(cafeId, {
        user_rating: ratingData.avg_rating,
        review_count: ratingData.review_count
      });
    } catch (err) {
      ratingMap.set(cafeId, { user_rating: null, review_count: 0 });
    }
  }

  // Merge tất cả data
  return cafes.map(cafe => {
    let dbData = null;
    if (cafe.id) {
      dbData = dbDataMap.get(`id_${cafe.id}`);
    } else if (cafe.provider && cafe.provider_place_id) {
      dbData = dbDataMap.get(`${cafe.provider}:${cafe.provider_place_id}`);
      if (dbData && dbData.id) {
        cafe.id = dbData.id;
      }
    }

    const rating = cafe.id && ratingMap.has(cafe.id) 
      ? ratingMap.get(cafe.id) 
      : { user_rating: null, review_count: 0 };

    return {
      ...cafe,
      user_rating: rating.user_rating,
      review_count: rating.review_count,
      // Ưu tiên price_level từ API, nếu không có thì dùng từ DB
      price_level: cafe.price_level != null ? cafe.price_level : (dbData?.price_level || null)
    };
  });
}

// GET /api/cafes/nearby?lat=&lng=&radius=&sort=&limit=&offset=
router.get('/nearby', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = req.query.radius ? parseInt(req.query.radius, 10) : 2000;
    const sort = req.query.sort || 'distance';
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20; // Default 20 results
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res
        .status(400)
        .json({ message: 'lat và lng là bắt buộc (số thực)' });
    }

    // Validate limit (max 50 to prevent performance issues)
    const validLimit = Math.min(Math.max(1, limit), 50);

    const cafes = await searchCafesFromProviders({
      lat,
      lng,
      radius,
      keyword: null
    });

    // Lấy ratings từ reviews và price_level từ database
    const cafesWithRatings = await getCafesWithRatings(cafes);

    const sorted = sortCafes(cafesWithRatings, sort, true);
    
    // Apply pagination
    const total = sorted.length;
    const paginatedCafes = sorted.slice(offset, offset + validLimit);

    res.json({
      cafes: paginatedCafes,
      total: total,
      limit: validLimit,
      offset: offset,
      hasMore: offset + validLimit < total
    });
  } catch (err) {
    console.error('Error in /api/cafes/nearby', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/cafes/search?query=&lat=&lng=&sort=&limit=&offset=
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const sort = req.query.sort || 'rating';
    const lat = req.query.lat ? parseFloat(req.query.lat) : null;
    const lng = req.query.lng ? parseFloat(req.query.lng) : null;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20; // Default 20 results
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;

    if (!query || query.trim() === '') {
      return res.status(400).json({ message: 'query is required' });
    }

    // Validate limit (max 50 to prevent performance issues)
    const validLimit = Math.min(Math.max(1, limit), 50);

    // Nếu có lat,lng → dùng làm center, nếu không thì set default Hà Nội
    const centerLat = lat ?? 21.028511;
    const centerLng = lng ?? 105.804817;

    // Khi search, dùng radius lớn (50km) để lấy tất cả kết quả, không filter theo khoảng cách
    const cafes = await searchCafesFromProviders({
      lat: centerLat,
      lng: centerLng,
      radius: 50000, // 50km - giới hạn tối đa của Google Places API
      keyword: query
    });

    // Lấy ratings từ reviews
    const cafesWithRatings = await getCafesWithRatings(cafes);

    const sorted = sortCafes(cafesWithRatings, sort, lat != null && lng != null);
    
    // Apply pagination
    const total = sorted.length;
    const paginatedCafes = sorted.slice(offset, offset + validLimit);

    res.json({
      cafes: paginatedCafes,
      total: total,
      limit: validLimit,
      offset: offset,
      hasMore: offset + validLimit < total
    });
  } catch (err) {
    console.error('Error in /api/cafes/search', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/cafes/favorites
// Lưu ý: Endpoint này trả về tất cả cafes (không filter theo favorites)
// Để lấy favorites của user, sử dụng /api/favorites thay thế
router.get('/favorites', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, provider, provider_place_id, name, address,
              lat, lng, rating, user_rating_count, created_at
       FROM cafes
       WHERE lat IS NOT NULL AND lng IS NOT NULL
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
      user_rating_count,
      price_level
    } = req.body;

    if (!provider || !provider_place_id || !name || lat == null || lng == null) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    const result = await db.query(
      `INSERT INTO cafes
        (provider, provider_place_id, name, address, lat, lng, rating, user_rating_count, price_level)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (provider, provider_place_id)
       DO UPDATE SET
          name = EXCLUDED.name,
          address = EXCLUDED.address,
          lat = EXCLUDED.lat,
          lng = EXCLUDED.lng,
          rating = EXCLUDED.rating,
          user_rating_count = EXCLUDED.user_rating_count,
          price_level = EXCLUDED.price_level,
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
        user_rating_count || null,
        price_level || null
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error in POST /api/cafes/favorites', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/cafes -> Lấy tất cả cafes từ database (dùng để hiển thị trên map)
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, provider, provider_place_id, name, address,
              lat, lng, rating, user_rating_count
       FROM cafes
       WHERE lat IS NOT NULL AND lng IS NOT NULL
       ORDER BY created_at DESC`
    );
    const cafes = result.rows;
    // Lấy ratings từ reviews
    const cafesWithRatings = await getCafesWithRatings(cafes);
    res.json(cafesWithRatings);
  } catch (err) {
    console.error('Error in GET /api/cafes', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
