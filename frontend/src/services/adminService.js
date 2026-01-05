// frontend/src/services/adminService.js
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Not authenticated');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const adminService = {
  // Lấy danh sách users
  getUsers: async (page = 1, limit = 20, search = '') => {
    const params = new URLSearchParams();
    params.set('page', page);
    params.set('limit', limit);
    if (search) params.set('search', search);

    const res = await fetch(`${API_BASE}/api/admin/users?${params.toString()}`, {
      headers: getAuthHeaders()
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Failed to fetch users' }));
      throw new Error(errorData.error || 'Failed to fetch users');
    }

    return res.json();
  },

  // Xóa user
  deleteUser: async (userId) => {
    const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Failed to delete user' }));
      throw new Error(errorData.error || 'Failed to delete user');
    }

    return res.json();
  },

  // Lấy danh sách reviews
  getReviews: async (page = 1, limit = 20, cafeId = null) => {
    const params = new URLSearchParams();
    params.set('page', page);
    params.set('limit', limit);
    if (cafeId) params.set('cafe_id', cafeId);

    const res = await fetch(`${API_BASE}/api/admin/reviews?${params.toString()}`, {
      headers: getAuthHeaders()
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Failed to fetch reviews' }));
      throw new Error(errorData.error || 'Failed to fetch reviews');
    }

    return res.json();
  },

  // Xóa review
  deleteReview: async (reviewId) => {
    const res = await fetch(`${API_BASE}/api/admin/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Failed to delete review' }));
      throw new Error(errorData.error || 'Failed to delete review');
    }

    return res.json();
  },

  // Lấy danh sách cafes (để chọn khi tạo promotion)
  getCafes: async (search = '', limit = 50) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    params.set('limit', limit);

    const res = await fetch(`${API_BASE}/api/admin/cafes?${params.toString()}`, {
      headers: getAuthHeaders()
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Failed to fetch cafes' }));
      throw new Error(errorData.error || 'Failed to fetch cafes');
    }

    return res.json();
  },

  // Lấy thống kê
  getStats: async () => {
    const res = await fetch(`${API_BASE}/api/admin/stats`, {
      headers: getAuthHeaders()
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Failed to fetch stats' }));
      throw new Error(errorData.error || 'Failed to fetch stats');
    }

    return res.json();
  }
};

export default adminService;

