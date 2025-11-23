const express = require('express');
const axios = require('axios');
const router = express.Router();

const GOONG_REST_API_KEY = process.env.GOONG_REST_API_KEY;

router.get('/autocomplete', async (req, res) => {
  try {
    const { input, lat, lng, radiusKm, limit } = req.query;

    if (!input) {
      return res.status(400).json({ message: 'input is required' });
    }

    const params = {
      input,
      api_key: GOONG_REST_API_KEY,
      more_compound: true,
      has_deprecated_administrative_unit: false,
    };

    if (lat && lng) {
      params.location = `${lat},${lng}`;
      params.origin = `${lat},${lng}`; // để Goong trả về distance_meters
    }

    if (radiusKm) params.radius = radiusKm;
    if (limit) params.limit = limit;

    const goongRes = await axios.get(
      'https://rsapi.goong.io/v2/place/autocomplete',
      { params }
    );

    res.json(goongRes.data); // predictions [...]
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ message: 'Goong autocomplete error' });
  }
});

module.exports = router;
