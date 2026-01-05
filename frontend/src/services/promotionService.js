// frontend/src/services/promotionService.js
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const promotionService = {
  // Lấy promotions gần vị trí
  getPromotionsNearby: async ({ lat, lng, radius = 5000 }) => {
    const params = new URLSearchParams();
    params.set('lat', lat);
    params.set('lng', lng);
    params.set('radius', radius);

    const res = await fetch(`${API_BASE}/api/promotions/nearby?${params.toString()}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Failed to fetch promotions' }));
      throw new Error(errorData.error || 'Failed to fetch nearby promotions');
    }
    const data = await res.json();
    return data.promotions || [];
  },

  // Lấy promotions của một quán
  getPromotionsByCafe: async (cafeId) => {
    const res = await fetch(`${API_BASE}/api/promotions/cafe/${cafeId}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Failed to fetch promotions' }));
      throw new Error(errorData.error || 'Failed to fetch cafe promotions');
    }
    const data = await res.json();
    return data.promotions || [];
  },

  // Lấy promotion theo ID
  getPromotionById: async (promotionId) => {
    const res = await fetch(`${API_BASE}/api/promotions/${promotionId}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Failed to fetch promotion' }));
      throw new Error(errorData.error || 'Failed to fetch promotion');
    }
    const data = await res.json();
    return data.promotion;
  },

  // Tạo promotion mới (cần auth)
  createPromotion: async (promotionData) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${API_BASE}/api/promotions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(promotionData)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Failed to create promotion' }));
      throw new Error(errorData.error || 'Failed to create promotion');
    }

    const data = await res.json();
    return data.promotion;
  },

  // Cập nhật promotion (cần auth)
  updatePromotion: async (promotionId, updateData) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${API_BASE}/api/promotions/${promotionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Failed to update promotion' }));
      throw new Error(errorData.error || 'Failed to update promotion');
    }

    const data = await res.json();
    return data.promotion;
  },

  // Xóa promotion (cần auth)
  deletePromotion: async (promotionId) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${API_BASE}/api/promotions/${promotionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Failed to delete promotion' }));
      throw new Error(errorData.error || 'Failed to delete promotion');
    }

    return true;
  },

  // Lấy tất cả active promotions (không cần auth)
  getAllActivePromotions: async () => {
    const res = await fetch(`${API_BASE}/api/promotions/all`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Failed to fetch promotions' }));
      throw new Error(errorData.error || 'Failed to fetch all promotions');
    }
    const data = await res.json();
    return data.promotions || [];
  },

  // Lấy tất cả promotions (cho admin, cần auth)
  getAllPromotions: async (limit = 50, offset = 0) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    const params = new URLSearchParams();
    params.set('limit', limit);
    params.set('offset', offset);

    const res = await fetch(`${API_BASE}/api/promotions?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Failed to fetch promotions' }));
      throw new Error(errorData.error || 'Failed to fetch promotions');
    }

    return res.json();
  }
};

export default promotionService;

