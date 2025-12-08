// backend/src/repositories/cafeRepository.js
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

  // Nếu không có keyword, tìm với nhiều từ khóa mặc định để bắt các tên khác nhau
  const defaultKeywords = ['cafe', 'cà phê', 'coffee', 'coffee house', 'highland', 'highlands', 'phê', 'phê la'];
  const keywords = keyword
    ? Array.isArray(keyword)
      ? keyword
      : [keyword]
    : defaultKeywords;

  try {
    const placeMap = new Map(); // key: place_id -> normalized place

    // Với mỗi keyword, gọi AutoComplete và lấy detail cho mỗi place_id
    await Promise.all(
      keywords.map(async (kw) => {
        try {
          const url = new URL('https://rsapi.goong.io/Place/AutoComplete');
          url.searchParams.set('input', kw);
          url.searchParams.set('location', `${lat},${lng}`);
          url.searchParams.set('radius', radiusMeters || 2000);
          url.searchParams.set('api_key', goong.restApiKey);

          const res = await fetch(url.toString());
          if (!res.ok) {
            console.error('Goong API error for', kw, res.status);
            return;
          }

          const data = await res.json();
          const predictions = data.predictions || [];

          // Lấy tối đa 10 predictions cho mỗi keyword
          await Promise.all(
            predictions.slice(0, 10).map(async (p) => {
              try {
                if (!p.place_id) return;
                if (placeMap.has(p.place_id)) return; // đã lấy rồi

                const detailUrl = new URL('https://rsapi.goong.io/Place/Detail');
                detailUrl.searchParams.set('place_id', p.place_id);
                detailUrl.searchParams.set('api_key', goong.restApiKey);

                const detailRes = await fetch(detailUrl.toString());
                if (!detailRes.ok) return;

                const detailData = await detailRes.json();
                const result = detailData.result;

                if (result && result.geometry && result.geometry.location) {
                  const placeLat = result.geometry.location.lat;
                  const placeLng = result.geometry.location.lng;

                  const normalized = normalizePlace({
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
                  });

                  // Lọc theo bán kính ở đây nếu muốn, nhưng chúng ta vẫn tính distance ở normalizePlace.
                  placeMap.set(p.place_id, normalized);
                }
              } catch (err) {
                console.error('Error fetching Goong place detail:', err.message);
              }
            })
          );
        } catch (err) {
          console.error('Goong AutoComplete error for', kw, err.message);
        }
      })
    );

    return Array.from(placeMap.values());
  } catch (error) {
    console.error('Goong API error:', error.message);
    return [];
  }
}

// ===== Google Places APIs =====

async function searchNearbyFromGoogle(lat, lng, radiusMeters, keyword) {
  if (!google.placesApiKey) return [];

  // Nếu không có keyword, sử dụng nhiều từ khóa mặc định
  const defaultKeywords = ['cafe', 'cà phê', 'coffee', 'coffee house', 'highland', 'highlands', 'phê', 'phê la'];
  const keywords = keyword
    ? Array.isArray(keyword)
      ? keyword
      : [keyword]
    : defaultKeywords;

  try {
    const placeMap = new Map(); // place_id -> normalized place

    // Thêm một lần gọi chỉ theo type 'cafe' để bắt các kết quả loại cafe
    const baseUrl = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
    baseUrl.searchParams.set('location', `${lat},${lng}`);
    baseUrl.searchParams.set('radius', radiusMeters || 2000);
    baseUrl.searchParams.set('key', google.placesApiKey);

    // Gọi thêm 1 request base với type=cafe
    try {
      const url = new URL(baseUrl.toString());
      url.searchParams.set('type', 'cafe');
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        const results = data.results || [];
        for (const place of results) {
          const pid = place.place_id || `${place.geometry?.location?.lat}_${place.geometry?.location?.lng}_${place.name}`;
          if (!pid || placeMap.has(pid)) continue;
          placeMap.set(pid, normalizePlace({
            provider: 'google',
            place,
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
            centerLat: lat,
            centerLng: lng
          }));
        }
      }
    } catch (err) {
      console.error('Google base nearbysearch error:', err.message);
    }

    // Sau đó gọi theo từng keyword để bắt các tên khác nhau
    await Promise.all(
      keywords.map(async (kw) => {
        try {
          const url = new URL(baseUrl.toString());
          // Không set type ở đây để keyword có thể match tên
          url.searchParams.set('keyword', kw);

          const res = await fetch(url.toString());
          if (!res.ok) {
            console.error('Google Places error for', kw, res.status);
            return;
          }

          const data = await res.json();
          const results = data.results || [];

          for (const place of results) {
            const pid = place.place_id || `${place.geometry?.location?.lat}_${place.geometry?.location?.lng}_${place.name}`;
            if (!pid || placeMap.has(pid)) continue;
            placeMap.set(pid, normalizePlace({
              provider: 'google',
              place,
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng,
              centerLat: lat,
              centerLng: lng
            }));
          }
        } catch (err) {
          console.error('Google nearbysearch error for', kw, err.message);
        }
      })
    );

    return Array.from(placeMap.values());
  } catch (error) {
    console.error('Google Places error:', error.message);
    return [];
  }
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
