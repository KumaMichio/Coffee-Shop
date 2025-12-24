# ☕ Coffee Shop Finder

Ứng dụng web tìm kiếm và đánh giá quán cà phê, được phát triển bằng React (Frontend) và Node.js/Express (Backend).

## 📋 Mục lục

- [Tính năng](#-tính-năng)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt](#-cài-đặt)
- [Cấu hình](#-cấu-hình)
- [Chạy ứng dụng](#-chạy-ứng-dụng)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Tài liệu tham khảo](#-tài-liệu-tham-khảo)

---

## ✨ Tính năng

### Người dùng thường
- ✅ Đăng ký/Đăng nhập tài khoản
- ✅ Tìm kiếm quán cà phê theo tên/địa chỉ
- ✅ Tìm quán cà phê gần vị trí hiện tại
- ✅ Xem bản đồ với markers của các quán
- ✅ Thêm/Xóa quán vào danh sách yêu thích
- ✅ Đánh giá và bình luận về quán
- ✅ Xem thông tin profile và lịch sử đánh giá
- ✅ Cập nhật profile, upload avatar, đổi mật khẩu
- ✅ Xem khuyến mãi của các quán
- ✅ Chỉ đường đến quán (Google Maps, Apple Maps, Waze, Goong Maps)
- ✅ Hỗ trợ đa ngôn ngữ (Tiếng Việt, Tiếng Anh, Tiếng Nhật)

### Admin
- ✅ Dashboard thống kê tổng quan
- ✅ Quản lý users (xem, xóa)
- ✅ Quản lý reviews (xem, xóa)
- ✅ Quản lý promotions (tạo, cập nhật, xóa)
- ✅ Quản lý cafes

---

## 🛠️ Công nghệ sử dụng

### Backend
- **Node.js** (v18+)
- **Express.js** (v5.1.0)
- **PostgreSQL** (v14+)
- **JWT** (jsonwebtoken) - Authentication
- **bcryptjs** - Password hashing
- **Goong Maps API** - Maps & Places
- **Google Places API** - Places search

### Frontend
- **React** (v19.2.0)
- **React Router DOM** (v6.28.0)
- **Ant Design** (v5.22.6) - UI Components
- **Goong Maps JS** (@goongmaps/goong-js) - Maps
- **Context API** - State management
- **i18n** - Internationalization

---

## 💻 Yêu cầu hệ thống

- **Node.js**: v18.0.0 trở lên
- **npm**: v9.0.0 trở lên
- **PostgreSQL**: v14.0 trở lên
- **Git**: Để clone repository

---

## 📦 Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd Coffee-Shop
```

### 2. Cài đặt Backend

```bash
cd backend
npm install
```

### 3. Cài đặt Frontend

```bash
cd ../frontend
npm install
```

### 4. Setup Database

Tạo database PostgreSQL:

```sql
CREATE DATABASE coffee_shop;
```

Chạy script tạo bảng:

```bash
# Từ thư mục root
psql -U postgres -d coffee_shop -f database.sql
```

Hoặc import file `database.sql` vào PostgreSQL bằng pgAdmin hoặc công cụ khác.

---

## ⚙️ Cấu hình

### Backend Environment Variables

Tạo file `.env` trong thư mục `backend/`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=coffee_shop
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-secret-key-change-this-in-production

# Goong Maps API
GOONG_API_KEY=your_goong_api_key
GOONG_REST_API_KEY=your_goong_rest_api_key

# Google Places API
GOOGLE_PLACES_API_KEY=your_google_places_api_key

# Server
PORT=5000
NODE_ENV=development
```

### Frontend Environment Variables

Tạo file `.env` trong thư mục `frontend/`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOONG_ACCESS_TOKEN=your_goong_access_token
```

### Lấy API Keys

1. **Goong Maps API:**
   - Đăng ký tại: https://goong.io/
   - Lấy Access Token và REST API Key từ dashboard

2. **Google Places API:**
   - Đăng ký tại: https://console.cloud.google.com/
   - Bật Places API
   - Tạo API Key

---

## 🚀 Chạy ứng dụng

### Development Mode

#### Backend

```bash
cd backend
npm run dev
```

Backend sẽ chạy tại: `http://localhost:5000`

#### Frontend

```bash
cd frontend
npm start
```

Frontend sẽ chạy tại: `http://localhost:3000`

### Production Mode

#### Build Frontend

```bash
cd frontend
npm run build
```

#### Start Backend

```bash
cd backend
npm start
```

---

## 📁 Cấu trúc dự án

```
Coffee-Shop/
├── backend/
│   ├── src/
│   │   ├── api/              # API routes
│   │   │   ├── auth.js
│   │   │   ├── cafe.js
│   │   │   ├── favorite.js
│   │   │   ├── review.js
│   │   │   ├── profile.js
│   │   │   ├── promotion.js
│   │   │   ├── admin.js
│   │   │   └── map.js
│   │   ├── middleware/        # Middleware (auth, etc.)
│   │   ├── repositories/     # Database repositories
│   │   ├── config.js         # Configuration
│   │   ├── db.js             # Database connection
│   │   ├── app.js            # Express app setup
│   │   └── server.js         # Server entry point
│   ├── migrations/           # Database migrations
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── services/        # API services
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/            # Custom hooks
│   │   ├── locales/          # i18n translations
│   │   └── App.js            # Main App component
│   └── package.json
├── docs/                     # Documentation
│   ├── API_SPECIFICATION.md
│   ├── FEATURES.md
│   ├── TEST_PLAN.md
│   ├── UAT_TEST_PLAN.md
│   ├── INSTRUCTOR_GUIDE.md
│   └── DEMO_SCRIPT.md
├── database.sql              # Database schema
└── README.md
```

---

## 📚 API Documentation

Xem chi tiết tại: [docs/API_SPECIFICATION.md](docs/API_SPECIFICATION.md)

### Base URL
- Development: `http://localhost:5000/api`
- Production: `https://your-domain.com/api`

### Authentication
Hầu hết các API endpoints yêu cầu JWT token trong header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Test Coverage

Xem chi tiết test plan tại: [docs/TEST_PLAN.md](docs/TEST_PLAN.md)

---

## 📖 Tài liệu tham khảo

- [FEATURES.md](docs/FEATURES.md) - Danh sách tính năng đã implement
- [API_SPECIFICATION.md](docs/API_SPECIFICATION.md) - Đặc tả API đầy đủ
- [TEST_PLAN.md](docs/TEST_PLAN.md) - Kế hoạch kiểm thử
- [UAT_TEST_PLAN.md](docs/UAT_TEST_PLAN.md) - Kế hoạch UAT
- [INSTRUCTOR_GUIDE.md](docs/INSTRUCTOR_GUIDE.md) - Hướng dẫn cho giảng viên
- [DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) - Kịch bản demo

---

## 🐛 Troubleshooting

### Lỗi kết nối database

- Kiểm tra PostgreSQL đã chạy chưa
- Kiểm tra thông tin kết nối trong `.env`
- Kiểm tra database đã được tạo chưa

### Lỗi API không hoạt động

- Kiểm tra backend đã chạy chưa (port 5000)
- Kiểm tra CORS configuration
- Kiểm tra API keys trong `.env`

### Lỗi bản đồ không hiển thị

- Kiểm tra Goong Access Token trong `.env` của frontend
- Kiểm tra console browser để xem lỗi cụ thể

---

## 👥 Đóng góp

Dự án này được phát triển bởi nhóm sinh viên cho môn học.

---

## 📄 License

ISC

---

## 📞 Liên hệ

Nếu có vấn đề hoặc câu hỏi, vui lòng liên hệ nhóm phát triển.

---

**Last Updated:** 2024-12-24
**Version:** 1.0.0
