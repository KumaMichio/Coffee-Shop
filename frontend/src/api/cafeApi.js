const BASE_URL = 'http://localhost:3000';

export async function fetchAllCafes() {
  const res = await fetch(`${BASE_URL}/api/cafes`);
  return res.json();
}

export async function searchCafes({ keyword, lat, lng, radiusKm }) {
  const params = new URLSearchParams();

  if (keyword) params.append('keyword', keyword);
  if (lat != null && lng != null && radiusKm != null) {
    params.append('lat', lat);
    params.append('lng', lng);
    params.append('radiusKm', radiusKm);
  }

  const res = await fetch(`${BASE_URL}/api/cafes/search?${params.toString()}`);
  return res.json();
}
