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

// Helper function để tạo photo URL từ photo_reference
function getPhotoUrl(provider, photoReference, apiKey) {
  if (!photoReference || !apiKey) return null;
  
  if (provider === 'google') {
    // Google Places Photo API
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${apiKey}`;
  } else if (provider === 'goong') {
    // Goong API - format có thể khác, cần kiểm tra
    // Tạm thời dùng format tương tự Google
    return `https://rsapi.goong.io/Place/Photo?photo_reference=${photoReference}&api_key=${apiKey}`;
  }
  return null;
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

  // Lấy photo reference từ place object
  let photoUrl = null;
  if (provider === 'google' && place.photos && place.photos.length > 0) {
    // Google: lấy photo_reference từ photos array
    const photoRef = place.photos[0].photo_reference;
    photoUrl = getPhotoUrl('google', photoRef, google.placesApiKey);
  } else if (provider === 'goong' && place.photos && place.photos.length > 0) {
    // Goong: cần kiểm tra format response
    const photoRef = place.photos[0].photo_reference || place.photos[0].reference;
    photoUrl = getPhotoUrl('goong', photoRef, goong.restApiKey);
  } else if (place.photo_reference) {
    // Fallback: nếu có photo_reference trực tiếp
    photoUrl = getPhotoUrl(provider, place.photo_reference, 
      provider === 'google' ? google.placesApiKey : goong.restApiKey);
  }

  return {
    provider,
    provider_place_id: place.id || place.place_id,
    name: place.name,
    address: place.address || place.vicinity || place.formatted_address,
    lat: locationLat,
    lng: locationLng,
    rating: place.rating || null,
    user_rating_count: place.user_ratings_total || place.userRatingCount || null,
    price_level: place.price_level || null, // 1-4: $ to $$$$
    distance,
    photo_url: photoUrl
  };
}

// ===== Goong APIs =====

// Helper: delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: retry với exponential backoff
async function fetchWithRetry(url, maxRetries = 2, delayMs = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        // Rate limited - wait longer
        const waitTime = delayMs * Math.pow(2, i);
        console.warn(`Rate limited (429), waiting ${waitTime}ms before retry ${i + 1}/${maxRetries}`);
        await delay(waitTime);
        continue;
      }
      return res;
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await delay(delayMs * Math.pow(2, i));
    }
  }
  throw new Error('Max retries exceeded');
}

// Nearby cafés từ Goong quanh (lat,lng)
async function searchNearbyFromGoong(lat, lng, radiusMeters, keyword) {
  if (!goong.restApiKey) return [];

  // Mở rộng keywords để bao gồm nhiều loại quán cà phê phổ biến
  // Bao gồm: cafe, cà phê, highland, phúc long, coffee, starbucks, trung nguyên, the coffee house, etc.
  const defaultKeywords = keyword ? [] : [
    'cafe',
    'cà phê',
    'coffee',
    'highland',
    'phúc long',
    'starbucks',
    'trung nguyên',
    'the coffee house',
    'highlands coffee',
    'phuclong',
    'cong caphe'
  ];
  const keywords = keyword
    ? Array.isArray(keyword)
      ? keyword
      : [keyword]
    : defaultKeywords;

  try {
    const placeMap = new Map(); // key: place_id -> normalized place

    // Sequential requests thay vì parallel để tránh rate limit
    for (let i = 0; i < keywords.length; i++) {
      const kw = keywords[i];
      
      // Delay giữa các requests
      if (i > 0) {
        await delay(300); // 300ms delay giữa các keyword requests
      }

      try {
        const url = new URL('https://rsapi.goong.io/Place/AutoComplete');
        url.searchParams.set('input', kw);
        url.searchParams.set('location', `${lat},${lng}`);
        url.searchParams.set('radius', radiusMeters || 2000);
        url.searchParams.set('api_key', goong.restApiKey);

        const res = await fetchWithRetry(url.toString());
        if (!res.ok) {
          if (res.status === 429) {
            console.warn('Goong API rate limited for', kw, '- skipping this keyword');
            continue; // Skip keyword này nếu bị rate limit
          }
          console.error('Goong API error for', kw, res.status);
          continue;
        }

        const data = await res.json();
        const predictions = data.predictions || [];

        // Giảm số predictions xuống 5 thay vì 10
        const limitedPredictions = predictions.slice(0, 5);

        // Sequential detail requests với delay
        for (let j = 0; j < limitedPredictions.length; j++) {
          const p = limitedPredictions[j];
          
          // Delay giữa các detail requests
          if (j > 0) {
            await delay(200); // 200ms delay giữa các detail requests
          }

          try {
            if (!p.place_id) continue;
            if (placeMap.has(p.place_id)) continue; // đã lấy rồi

            const detailUrl = new URL('https://rsapi.goong.io/Place/Detail');
            detailUrl.searchParams.set('place_id', p.place_id);
            detailUrl.searchParams.set('api_key', goong.restApiKey);

            const detailRes = await fetchWithRetry(detailUrl.toString());
            if (!detailRes.ok) {
              if (detailRes.status === 429) {
                console.warn('Goong Detail API rate limited for place', p.place_id);
                continue; // Skip place này nếu bị rate limit
              }
              continue;
            }

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
                  user_ratings_total: result.user_ratings_total || null,
                  photos: result.photos || null,
                  photo_reference: result.photos?.[0]?.photo_reference || result.photos?.[0]?.reference || null
                },
                lat: placeLat,
                lng: placeLng,
                centerLat: lat,
                centerLng: lng
              });

              placeMap.set(p.place_id, normalized);
            }
          } catch (err) {
            console.error('Error fetching Goong place detail:', err.message);
            // Continue với place tiếp theo
          }
        }
      } catch (err) {
        console.error('Goong AutoComplete error for', kw, err.message);
        // Continue với keyword tiếp theo
      }
    }

    return Array.from(placeMap.values());
  } catch (error) {
    console.error('Goong API error:', error.message);
    return [];
  }
}

// ===== Google Places APIs =====

async function searchNearbyFromGoogle(lat, lng, radiusMeters, keyword) {
  if (!google.placesApiKey) return [];

  try {
    const placeMap = new Map(); // place_id -> normalized place

    // Nếu có keyword từ user, chỉ search với keyword đó
    if (keyword) {
      const baseUrl = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
      baseUrl.searchParams.set('location', `${lat},${lng}`);
      baseUrl.searchParams.set('radius', radiusMeters || 2000);
      baseUrl.searchParams.set('type', 'cafe');
      baseUrl.searchParams.set('keyword', keyword);
      baseUrl.searchParams.set('key', google.placesApiKey);

      try {
        const res = await fetchWithRetry(baseUrl.toString());
        if (res.ok) {
          const data = await res.json();
          const results = data.results || [];
          
          const limitedResults = results.slice(0, 20);
          
          for (const place of limitedResults) {
            const pid = place.place_id || `${place.geometry?.location?.lat}_${place.geometry?.location?.lng}_${place.name}`;
            if (!pid || placeMap.has(pid)) continue;
            placeMap.set(pid, normalizePlace({
              provider: 'google',
              place: {
                ...place,
                photos: place.photos || null,
                photo_reference: place.photos?.[0]?.photo_reference || null
              },
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng,
              centerLat: lat,
              centerLng: lng
            }));
          }
        }
      } catch (err) {
        console.error('Google Places API error:', err.message);
      }
    } else {
      // Nếu không có keyword, search với nhiều keywords phổ biến để lấy tất cả quán
      const defaultKeywords = [
        'cafe',
        'coffee',
        'highland',
        'phúc long',
        'starbucks',
        'trung nguyên',
        'the coffee house'
      ];

      // Sequential requests để tránh rate limit
      for (let i = 0; i < defaultKeywords.length; i++) {
        const kw = defaultKeywords[i];
        
        // Delay giữa các requests
        if (i > 0) {
          await delay(300);
        }

        try {
          const baseUrl = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
          baseUrl.searchParams.set('location', `${lat},${lng}`);
          baseUrl.searchParams.set('radius', radiusMeters || 2000);
          baseUrl.searchParams.set('type', 'cafe');
          baseUrl.searchParams.set('keyword', kw);
          baseUrl.searchParams.set('key', google.placesApiKey);

          const res = await fetchWithRetry(baseUrl.toString());
          if (res.ok) {
            const data = await res.json();
            const results = data.results || [];
            
            const limitedResults = results.slice(0, 10); // Giảm số lượng mỗi keyword
            
            for (const place of limitedResults) {
              const pid = place.place_id || `${place.geometry?.location?.lat}_${place.geometry?.location?.lng}_${place.name}`;
              if (!pid || placeMap.has(pid)) continue;
              placeMap.set(pid, normalizePlace({
                provider: 'google',
                place: {
                  ...place,
                  photos: place.photos || null,
                  photo_reference: place.photos?.[0]?.photo_reference || null
                },
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng,
                centerLat: lat,
                centerLng: lng
              }));
            }
          } else if (res.status === 429) {
            console.warn('Google Places API rate limited for keyword:', kw);
            break; // Dừng nếu bị rate limit
          }
        } catch (err) {
          console.error('Google Places API error for keyword', kw, ':', err.message);
          // Continue với keyword tiếp theo
        }
      }
    }

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
    
    // Nếu có keyword (search mode), không filter theo distance để hiển thị tất cả kết quả
    // Nếu không có keyword (nearby mode), filter theo radius
    let filteredFromGoong, filteredFromGoogle;
    if (keyword) {
      // Search mode: không filter theo distance, hiển thị tất cả kết quả
      filteredFromGoong = fromGoong;
      filteredFromGoogle = fromGoogle;
      console.log('Search mode: showing all results without distance filter');
    } else {
      // Nearby mode: filter theo radius
      const radiusKm = radiusMeters / 1000;
      filteredFromGoong = fromGoong.filter(cafe => cafe.distance <= radiusKm);
      filteredFromGoogle = fromGoogle.filter(cafe => cafe.distance <= radiusKm);
      console.log('Nearby mode: filtered (<= ' + radiusKm + 'km):', filteredFromGoong.length, 'from Goong,', filteredFromGoogle.length, 'from Google');
    }

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
