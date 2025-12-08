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

  const distanceMeters =
    centerLat != null && centerLng != null
      ? distanceInMeters(centerLat, centerLng, locationLat, locationLng)
      : null;
  
  // Chuyển từ mét sang km
  const distance = distanceMeters !== null ? distanceMeters / 1000 : null;

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

  try {
    // Dùng Goong Place AutoComplete với keyword "cafe" hoặc "cà phê"
    const searchTerm = keyword || 'cafe';
    const url = new URL('https://rsapi.goong.io/Place/AutoComplete');
    url.searchParams.set('input', searchTerm);
    url.searchParams.set('location', `${lat},${lng}`);
    url.searchParams.set('radius', radiusMeters || 2000);
    url.searchParams.set('api_key', goong.restApiKey);

    const res = await fetch(url.toString());
    if (!res.ok) {
      console.error('Goong API error:', res.status);
      return [];
    }
    
    const data = await res.json();
    const predictions = data.predictions || [];

    // Goong AutoComplete trả về predictions với place_id
    // Cần gọi Place Detail để lấy tọa độ chính xác
    const cafes = [];
    
    for (const p of predictions.slice(0, 10)) { // Giới hạn 10 kết quả
      try {
        // Gọi Place Detail API để lấy tọa độ
        const detailUrl = new URL('https://rsapi.goong.io/Place/Detail');
        detailUrl.searchParams.set('place_id', p.place_id);
        detailUrl.searchParams.set('api_key', goong.restApiKey);
        
        const detailRes = await fetch(detailUrl.toString());
        if (!detailRes.ok) continue;
        
        const detailData = await detailRes.json();
        const result = detailData.result;
        
        if (result && result.geometry && result.geometry.location) {
          const placeLat = result.geometry.location.lat;
          const placeLng = result.geometry.location.lng;
          
          cafes.push(normalizePlace({
            provider: 'goong',
            place: {
              id: p.place_id,
              name: result.name || p.structured_formatting?.main_text || p.description,
              address: result.formatted_address || p.description,
              rating: result.rating || null,
              user_ratings_total: result.user_ratings_total || null
            },
            lat: placeLat,
            lng: placeLng,
            centerLat: lat,
            centerLng: lng
          }));
        }
      } catch (error) {
        console.error('Error fetching place detail:', error.message);
      }
    }

    return cafes;
  } catch (error) {
    console.error('Goong API error:', error.message);
    return [];
  }
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
  
  try {
    const [fromGoong, fromGoogle] = await Promise.all([
      searchNearbyFromGoong(lat, lng, radiusMeters, keyword).catch(err => {
        console.error('Goong API error:', err.message);
        return [];
      }),
      searchNearbyFromGoogle(lat, lng, radiusMeters, keyword).catch(err => {
        console.error('Google API error:', err.message);
        return [];
      })
    ]);
    
    // DEBUG: Tạm bỏ filter để xem Goong trả về gì
    console.log('Goong results:', fromGoong.length, fromGoong.map(c => `${c.name}: ${c.distance}km`));
    console.log('Google results:', fromGoogle.length);
    
    // LỌC THỰC SỰ THEO RADIUS (Goong API không tự lọc chính xác)
    const radiusKm = radiusMeters / 1000;
    const filteredFromGoong = fromGoong.filter(cafe => cafe.distance <= radiusKm);
    const filteredFromGoogle = fromGoogle.filter(cafe => cafe.distance <= radiusKm);
    
    console.log('After filter (<= 2km):', filteredFromGoong.length, 'from Goong,', filteredFromGoogle.length, 'from Google');

    // Gom và loại duplicate theo provider+id
    const merged = [...filteredFromGoong, ...filteredFromGoogle];
    
    const seen = new Set();
    const unique = [];

    for (const c of merged) {
      const key = `${c.provider}:${c.provider_place_id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(c);
    }

    return unique;
  } catch (error) {
    console.error('❌ Error in searchCafesFromProviders:', error.message);
    return [];
  }
}

module.exports = {
  searchCafesFromProviders,
  distanceInMeters
};
