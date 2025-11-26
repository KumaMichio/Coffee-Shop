// src/services/apiService.js
const API_BASE = process.env.REACT_APP_API_BASE || '';

const apiService = {
  getCafes: async () => {
    const res = await fetch(`http://localhost:5001/api/cafes`);
    if (!res.ok) throw new Error('Failed to fetch cafes');
    return res.json();
  },

  getCurrentLocation: async () => {
    const res = await fetch(`http://localhost:5001/api/map/current-location`);
    if (!res.ok) throw new Error('Failed to fetch location');
    return res.json();
  },

  searchCafes: async (keyword) => {
    const res = await fetch(
      `http://localhost:5001/api/cafes/search?query=${encodeURIComponent(keyword)}`
    );
    if (!res.ok) throw new Error('Failed to search cafes');
    return res.json();
  }
};

export default apiService;

