// frontend/src/services/apiService.js
const API_BASE = process.env.REACT_APP_API_BASE || '';

const apiService = {
  // lấy toàn bộ quán trong DB (yêu thích / đã lưu)
  getSavedCafes: async () => {
    const res = await fetch(`${API_BASE}/api/cafes`);
    if (!res.ok) throw new Error('Failed to fetch saved cafes');
    return res.json();
  },

  getFavorites: async () => {
    const res = await fetch(`${API_BASE}/api/cafes/favorites`);
    if (!res.ok) throw new Error('Failed to fetch favorites');
    return res.json();
  },

  // search từ Goong + Google
  searchCafes: async ({ query, lat, lng, sort }) => {
    const params = new URLSearchParams();
    params.set('query', query);
    if (lat != null && lng != null) {
      params.set('lat', lat);
      params.set('lng', lng);
    }
    if (sort) params.set('sort', sort);
    const res = await fetch(`${API_BASE}/api/cafes/search?` + params.toString());
    if (!res.ok) throw new Error('Failed to search cafes');
    return res.json();
  },

  // lấy quán gần vị trí hiện tại trong bán kính radius (m)
  getNearbyCafes: async ({ lat, lng, radius = 2000, sort = 'distance' }) => {
    const params = new URLSearchParams();
    params.set('lat', lat);
    params.set('lng', lng);
    params.set('radius', radius);
    params.set('sort', sort);
    const res = await fetch(`${API_BASE}/api/cafes/nearby?` + params.toString());
    if (!res.ok) throw new Error('Failed to fetch nearby cafes');
    return res.json();
  },

  // lưu 1 quán yêu thích vào DB
  saveFavoriteCafe: async (cafe) => {
    const res = await fetch(`${API_BASE}/api/cafes/favorites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cafe)
    });
    if (!res.ok) throw new Error('Failed to save favorite cafe');
    return res.json();
  }
};

export default apiService;
