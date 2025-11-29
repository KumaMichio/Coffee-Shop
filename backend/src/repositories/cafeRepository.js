// backend/src/repositories/cafeRepository.js
const pool = require('../db');

async function upsertCafeFromGoong(detail) {
  const { name, formatted_address, geometry, place_id } = detail || {};
  const lat = geometry?.location?.lat;
  const lng = geometry?.location?.lng;

  if (lat == null || lng == null) {
    throw new Error('Missing lat/lng from Goong detail');
  }

  const query = `
    INSERT INTO cafes (name, address, lat, lng, place_id, source)
    VALUES ($1, $2, $3, $4, $5, 'goong')
    ON CONFLICT (place_id)
    DO UPDATE SET
      name = EXCLUDED.name,
      address = EXCLUDED.address,
      lat = EXCLUDED.lat,
      lng = EXCLUDED.lng
    RETURNING *;
  `;

  const values = [
    name,
    formatted_address || null,
    lat,
    lng,
    place_id
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

module.exports = {
  upsertCafeFromGoong,
};
