// frontend/src/services/profileService.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Lấy thông tin profile
export const getProfile = async (page = 1, limit = 10) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/api/profile?page=${page}&limit=${limit}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Không thể lấy thông tin profile');
  }

  return response.json();
};

// Cập nhật profile
export const updateProfile = async (profileData) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/api/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Không thể cập nhật profile');
  }

  return response.json();
};

// Đổi mật khẩu
export const changePassword = async (currentPassword, newPassword) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/api/profile/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Không thể đổi mật khẩu');
  }

  return response.json();
};

export default {
  getProfile,
  updateProfile,
  changePassword
};

