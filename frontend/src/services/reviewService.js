// frontend/src/services/reviewService.js
import apiService from './apiService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Tạo hoặc cập nhật đánh giá
export const submitReview = async (cafeId, reviewData, cafe = null) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  // Đảm bảo rating là số nguyên
  const rating = typeof reviewData.rating === 'number' 
    ? Math.round(reviewData.rating) 
    : parseInt(reviewData.rating);

  if (isNaN(rating) || rating < 1 || rating > 5) {
    throw new Error('Rating phải là số từ 1 đến 5');
  }

  const requestBody = {
    cafe_id: cafeId,
    rating: rating,
    comment: reviewData.comment || null,
    is_public: reviewData.is_public !== false,
    is_child_friendly: reviewData.is_child_friendly || false,
    images: reviewData.images || []
  };

  // Nếu cafe_id không phải là số và có cafe data, gửi kèm cafe_data
  if (isNaN(parseInt(cafeId)) && cafe) {
    requestBody.cafe_data = {
      provider: cafe.provider,
      provider_place_id: cafe.provider_place_id,
      name: cafe.name,
      address: cafe.address,
      lat: cafe.lat,
      lng: cafe.lng,
      rating: cafe.rating || null,
      user_rating_count: cafe.user_rating_count || null
    };
  }

  const response = await fetch(`${API_URL}/api/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Không thể gửi đánh giá');
  }

  return response.json();
};

// Lấy đánh giá của một quán
export const getCafeReviews = async (cafeId) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/api/reviews/cafe/${cafeId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Không thể lấy đánh giá');
  }

  return response.json();
};

// Lấy đánh giá của user hiện tại cho một quán
export const getMyReview = async (cafeId) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/api/reviews/my/${cafeId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Không thể lấy đánh giá');
  }

  return response.json();
};

// Xóa đánh giá
export const deleteReview = async (cafeId) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/api/reviews/${cafeId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Không thể xóa đánh giá');
  }

  return response.json();
};

export default {
  submitReview,
  getCafeReviews,
  getMyReview,
  deleteReview
};

