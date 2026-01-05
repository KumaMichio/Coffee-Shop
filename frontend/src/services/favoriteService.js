// frontend/src/services/favoriteService.js
import authService from './authService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

class FavoriteService {
  // Lấy danh sách quán yêu thích
  async getFavorites() {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Chưa đăng nhập');
    }

    const response = await fetch(`${API_BASE_URL}/api/favorites`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Lỗi lấy danh sách yêu thích');
    }

    return data.favorites;
  }

  // Thêm quán vào yêu thích
  async addFavorite(cafe) {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Chưa đăng nhập');
    }

    const response = await fetch(`${API_BASE_URL}/api/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        provider: cafe.provider,
        provider_place_id: cafe.provider_place_id,
        name: cafe.name,
        address: cafe.address,
        lat: cafe.lat,
        lng: cafe.lng,
        rating: cafe.rating,
        user_rating_count: cafe.user_rating_count,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Lỗi thêm yêu thích');
    }

    return data;
  }

  // Xóa quán khỏi yêu thích
  async removeFavorite(cafeId) {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Chưa đăng nhập');
    }

    const response = await fetch(`${API_BASE_URL}/api/favorites/${cafeId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Lỗi xóa yêu thích');
    }

    return data;
  }

  // Kiểm tra đã yêu thích chưa
  async isFavorite(cafeId) {
    const token = authService.getToken();
    if (!token) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/favorites/check/${cafeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data.isFavorite;
    } catch (error) {
      return false;
    }
  }
}

export default new FavoriteService();
