// frontend/src/services/apiService.js
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const apiService = {
  // lấy toàn bộ quán trong DB (yêu thích / đã lưu)
  getSavedCafes: async () => {
    const res = await fetch(`${API_BASE}/api/cafes`);
    if (!res.ok) throw new Error('Failed to fetch saved cafes');
    return res.json();
  },

  getFavorites: async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    
    const res = await fetch(`${API_BASE}/api/favorites`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
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
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Search cafes error:', res.status, errorText);
      throw new Error(`Failed to search cafes: ${res.status}`);
    }
    const data = await res.json();
    // Ensure we return an array
    return Array.isArray(data) ? data : [];
  },

  // lấy quán gần vị trí hiện tại trong bán kính radius (m)
  getNearbyCafes: async ({ lat, lng, radius = 2000, sort = 'distance' }) => {
    const params = new URLSearchParams();
    params.set('lat', lat);
    params.set('lng', lng);
    params.set('radius', radius);
    params.set('sort', sort);
    const res = await fetch(`${API_BASE}/api/cafes/nearby?` + params.toString());
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Get nearby cafes error:', res.status, errorText);
      throw new Error(`Failed to fetch nearby cafes: ${res.status}`);
    }
    const data = await res.json();
    // Ensure we return an array
    return Array.isArray(data) ? data : [];
  },

  // lưu 1 quán yêu thích vào DB (cần authentication)
  saveFavoriteCafe: async (cafe) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    
    const res = await fetch(`${API_BASE}/api/favorites`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(cafe)
    });
    if (!res.ok) throw new Error('Failed to save favorite cafe');
    return res.json();
  }
};

export default apiService;
