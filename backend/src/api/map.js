// backend/src/api/map.js
const express = require('express');
const { goong } = require('../config');

const router = express.Router();
const GOONG_REST_API_KEY = process.env.GOONG_API_KEY;

/**
 * GET /api/map/current-location
 * - Demo: dùng Geocoding của Goong để lấy toạ độ 1 địa chỉ mặc định (Hồ Gươm)
 * - Bạn có thể truyền ?address=... để geocode địa chỉ tùy ý.
 */
router.get('/current-location', async (req, res) => {
  try {
    const address =
      req.query.address || 'Hồ Gươm, Hoàn Kiếm, Hà Nội';

    if (!GOONG_REST_API_KEY) {
      return res
        .status(500)
        .json({ message: 'GOONG_REST_API_KEY is missing' });
    }

    const url = `https://rsapi.goong.io/Geocode?address=${encodeURIComponent(
      address
    )}&api_key=${GOONG_REST_API_KEY}`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error('Goong Geocode error status:', response.status);
      return res.status(500).json({ message: 'Geocode request failed' });
    }

    const data = await response.json();

    const first = data.results && data.results[0];
    if (!first || !first.geometry || !first.geometry.location) {
      return res.status(404).json({ message: 'No results from Goong' });
    }

    const { lat, lng } = first.geometry.location;

    // trả về lat/lng + địa chỉ format
    res.json({
      lat,
      lng,
      formatted_address: first.formatted_address
    });
  } catch (err) {
    console.error('Error in /api/map/current-location', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /api/map/geocode?address=...
 * - Endpoint chung dùng REST API key cho các search khác nếu cần.
 */
router.get('/geocode', async (req, res) => {
  try {
    const { address } = req.query;
    if (!address) {
      return res.status(400).json({ message: 'address is required' });
    }

    if (!GOONG_REST_API_KEY) {
      return res
        .status(500)
        .json({ message: 'GOONG_REST_API_KEY is missing' });
    }

    const url = `https://rsapi.goong.io/Geocode?address=${encodeURIComponent(
      address
    )}&api_key=${GOONG_REST_API_KEY}`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error('Goong Geocode error status:', response.status);
      return res.status(500).json({ message: 'Geocode request failed' });
    }

    const data = await response.json();
    res.json(data); // trả toàn bộ response cho FE (tuỳ bạn xử lý)
  } catch (err) {
    console.error('Error in /api/map/geocode', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;