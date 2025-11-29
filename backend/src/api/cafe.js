// backend/src/api/cafe.js
const express = require('express');
const pool = require('../db');
const { upsertCafeFromGoong } = require('../repositories/cafeRepository');
require('dotenv').config();

const router = express.Router();

// node-fetch v3 là ESM, nên dùng dynamic import trong CommonJS
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const GOONG_REST_API_KEY = process.env.GOONG_REST_API_KEY;

// =======================
// Hàm gọi Goong API
// =======================

async function searchCafesAround(lat, lng, limit = 10, radiusKm = 5) {
  const baseUrl = 'https://rsapi.goong.io/Place/AutoComplete';

  const params = new URLSearchParams({
    api_key: GOONG_REST_API_KEY,
    input: 'cà phê',             // từ khóa chung, không phải tên cụ thể
    location: `${lat},${lng}`,   // "lat,lng"
    limit: String(limit),
    radius: String(radiusKm),
  });

  const url = `${baseUrl}?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Goong API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.predictions || [];
}

async function getPlaceDetail(placeId) {
  const baseUrl = 'https://rsapi.goong.io/Place/Detail';

  const params = new URLSearchParams({
    api_key: GOONG_REST_API_KEY,
    place_id: placeId,
  });

  const url = `${baseUrl}?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Goong Detail error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.result;
}

// =======================
// ROUTES
// =======================

// GET /api/cafes
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cafes ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Get cafes error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/cafes/search?query=xxx
router.get('/search', async (req, res) => {
  try {
    const query = (req.query.query || '').trim();

    // 1. Nếu ô tìm kiếm trống → trả hết
    if (!query) {
      const all = await pool.query('SELECT * FROM cafes ORDER BY id DESC');
      return res.json(all.rows);
    }

    // 2. Tìm trong DB trước
    const dbResult = await pool.query(
      `SELECT * FROM cafes WHERE LOWER(name) LIKE LOWER($1)`,
      [`%${query}%`]
    );

    if (dbResult.rows.length > 0) {
      return res.json(dbResult.rows);
    }

    // 3. Không tìm thấy → fallback sang Goong
    console.log(`[Goong fallback] query="${query}"`);

    // Tạm dùng Hồ Gươm làm center; sau có thể dùng tọa độ người dùng
    const centerLat = 21.0285;
    const centerLng = 105.8520;

    const predictions = await searchCafesAround(centerLat, centerLng, 10, 5);

    if (!predictions.length) {
      return res.json([]);
    }

    const results = [];

    for (const p of predictions) {
      const placeId = p.place_id;
      if (!placeId) continue;

      const detail = await getPlaceDetail(placeId);
      const saved = await upsertCafeFromGoong(detail);

      // Chuẩn hóa format trả về cho FE
      results.push({
        id: saved ? saved.id : null,
        name: detail.name,
        address: detail.formatted_address,
        lat: detail.geometry?.location?.lat,
        lng: detail.geometry?.location?.lng,
        place_id: detail.place_id,
      });
    }

    res.json(results);
  } catch (err) {
    console.error('Search cafes error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
