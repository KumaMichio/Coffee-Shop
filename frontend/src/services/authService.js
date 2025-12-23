// frontend/src/services/authService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

class AuthService {
  // Đăng ký
  async register(username, email, password) {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Đăng ký thất bại');
    }

    // Lưu token và user vào localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.user && data.user.role) {
        localStorage.setItem('userRole', data.user.role);
      }
    }

    return data;
  }

  // Đăng nhập
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Đăng nhập thất bại');
    }

    // Lưu token và user vào localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.user && data.user.role) {
        localStorage.setItem('userRole', data.user.role);
      }
    }

    return data;
  }

  // Đăng xuất
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
  }

  // Kiểm tra có phải admin không
  isAdmin() {
    const userRole = localStorage.getItem('userRole');
    const user = this.getCurrentUser();
    return userRole === 'admin' || (user && user.role === 'admin');
  }

  // Lấy token hiện tại
  getToken() {
    return localStorage.getItem('token');
  }

  // Lấy thông tin user hiện tại
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Kiểm tra đã đăng nhập chưa
  isAuthenticated() {
    return !!this.getToken();
  }

  // Lấy thông tin user từ server
  async getMe() {
    const token = this.getToken();
    if (!token) {
      throw new Error('Chưa đăng nhập');
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Lỗi lấy thông tin user');
    }

    return data.user;
  }
}

export default new AuthService();
