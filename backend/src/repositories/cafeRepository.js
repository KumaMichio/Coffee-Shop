// backend/src/repositories/cafeRepository.js
const fetch = require('node-fetch');
const { goong, google } = require('../config');

// Haversine: tính khoảng cách 2 điểm lat/lng theo mét
function distanceInMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000; // bán kính Trái Đất (m)
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Normalize 1 place thành cafe chung
function normalizePlace({
  provider,
  place,
  lat,
  lng,
  centerLat,
  centerLng
}) {
  const locationLat = lat;
  const locationLng = lng;

  const distance =
    centerLat != null && centerLng != null
      ? distanceInMeters(centerLat, centerLng, locationLat, locationLng)
      : null;

  return {
    provider,
    provider_place_id: place.id || place.place_id,
    name: place.name,
    address: place.address || place.vicinity || place.formatted_address,
    lat: locationLat,
    lng: locationLng,
    rating: place.rating || null,
    user_rating_count: place.user_ratings_total || place.userRatingCount || null,
    distance
  };
}

// ===== Goong APIs =====

// Nearby cafés từ Goong quanh (lat,lng)
async function searchNearbyFromGoong(lat, lng, radiusMeters, keyword) {
  if (!goong.restApiKey) return [];

  // Bạn chỉnh lại endpoint này theo doc Goong Nearby Search
  const url = new URL('https://rsapi.goong.io/Place/AutoComplete');
  url.searchParams.set('location', `${lat},${lng}`);
  if (radiusMeters) url.searchParams.set('radius', radiusMeters);
  if (keyword) url.searchParams.set('input', keyword);
  url.searchParams.set('api_key', goong.restApiKey);

  const res = await fetch(url.toString());
  if (!res.ok) {
    console.error('Goong API error:', res.status);
    return [];
  }
  const data = await res.json();

  // data.predictions tùy theo API bạn dùng
  const predictions = data.predictions || [];
  // Goong AutoComplete không có lat/lng → thực tế cần gọi detail tiếp,
  // ở đây mình giả định đã có geometry.location cho đơn giản.
  const cafes = predictions
    .filter((p) => p.description) // có tên
    .map((p) =>
      normalizePlace({
        provider: 'goong',
        place: {
          id: p.place_id || p.placeId || p.id,
          name: p.structured_formatting?.main_text || p.description,
          address: p.description,
          rating: null,
          userRatingCount: null
        },
        lat,
        lng,
        centerLat: lat,
        centerLng: lng
      })
    );

  return cafes;
}

// ===== Google Places APIs =====

async function searchNearbyFromGoogle(lat, lng, radiusMeters, keyword) {
  if (!google.placesApiKey) return [];

  const url = new URL(
    'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
  );
  url.searchParams.set('location', `${lat},${lng}`);
  url.searchParams.set('radius', radiusMeters || 2000);
  url.searchParams.set('type', 'cafe');
  if (keyword) url.searchParams.set('keyword', keyword);
  url.searchParams.set('key', google.placesApiKey);

  const res = await fetch(url.toString());
  if (!res.ok) {
    console.error('Google Places error:', res.status);
    return [];
  }
  const data = await res.json();
  const results = data.results || [];

  return results.map((place) =>
    normalizePlace({
      provider: 'google',
      place,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      centerLat: lat,
      centerLng: lng
    })
  );
}

// ===== Hàm public dùng cho router =====

// Tìm quán quanh vị trí (lat,lng), radius (m), optional keyword
async function searchCafesFromProviders({ lat, lng, radius, keyword }) {
  const radiusMeters = radius || 2000;
  const [fromGoong, fromGoogle] = await Promise.all([
    searchNearbyFromGoong(lat, lng, radiusMeters, keyword),
    searchNearbyFromGoogle(lat, lng, radiusMeters, keyword)
  ]);

  // Gom và loại duplicate theo provider+id
  const merged = [...fromGoong, ...fromGoogle];
  const seen = new Set();
  const unique = [];

  for (const c of merged) {
    const key = `${c.provider}:${c.provider_place_id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(c);
  }

  return unique;
}

module.exports = {
  searchCafesFromProviders,
  distanceInMeters
};
