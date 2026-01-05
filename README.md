# ☕ Coffee Shop Finder

Ứng dụng web tìm kiếm và đánh giá quán cà phê, được phát triển bằng React (Frontend) và Node.js/Express (Backend). Dự án hỗ trợ tìm kiếm quán cà phê gần vị trí, xem bản đồ, đánh giá, quản lý yêu thích và nhiều tính năng khác.

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

#### Tạo database PostgreSQL

Mở PostgreSQL shell hoặc pgAdmin và chạy:

```sql
CREATE DATABASE coffee_app;
```

#### Import schema và dữ liệu mẫu

Từ thư mục root của project, chạy:

```bash
# Import schema và tạo bảng
psql -U postgres -d coffee_app -f database.sql

# Hoặc nếu bạn muốn chạy từng file migration
psql -U postgres -d coffee_app -f backend/migrations/seed_cafes.sql
psql -U postgres -d coffee_app -f backend/migrations/seed_promotions.sql
```

**Lưu ý:** File `database.sql` sẽ tự động tạo database `coffee_app` nếu chưa tồn tại và import tất cả dữ liệu cần thiết.

---

## ⚙️ Cấu hình

### Backend Environment Variables

Tạo file `.env` trong thư mục `backend/`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=coffee_app
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
PORT=5001
NODE_ENV=development
```

### Frontend Environment Variables

Tạo file `.env` trong thư mục `frontend/`:

```env
REACT_APP_API_URL=http://localhost:5001/api
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

#### Bước 1: Khởi động Backend

```bash
cd backend
npm run dev
```

Backend sẽ chạy tại: `http://localhost:5001`

**Lưu ý:** Đảm bảo PostgreSQL đang chạy và database `coffee_app` đã được tạo.

#### Bước 2: Khởi động Frontend

Mở terminal mới và chạy:

```bash
cd frontend
npm start
```

Frontend sẽ chạy tại: `http://localhost:3000`

#### Bước 3: Truy cập ứng dụng

Mở trình duyệt và truy cập: `http://localhost:3000`

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

Backend sẽ serve cả frontend build và API tại port 5001.

### Kiểm tra hoạt động

- **API Health Check:** `http://localhost:5001/`
- **Frontend:** `http://localhost:3000`
- **API Base URL:** `http://localhost:5001/api`

### Tài khoản mặc định

- **Admin:** admin@admin.com / admin123
- **User mẫu:** Có thể đăng ký tài khoản mới

---

## 📁 Cấu trúc dự án

```
Coffee-Shop/
├── backend/
│   ├── src/
│   │   ├── api/              # API routes
│   │   │   ├── auth.js       # Authentication endpoints
│   │   │   ├── cafe.js       # Cafe management
│   │   │   ├── favorite.js   # Favorites management
│   │   │   ├── review.js     # Reviews management
│   │   │   ├── profile.js    # User profile
│   │   │   ├── promotion.js  # Promotions
│   │   │   ├── admin.js      # Admin endpoints
│   │   │   └── map.js        # Map services
│   │   ├── middleware/       # Middleware (auth, etc.)
│   │   ├── repositories/     # Database repositories
│   │   │   ├── cafeRepository.js
│   │   │   ├── favoriteRepository.js
│   │   │   ├── promotionRepository.js
│   │   │   ├── reviewRepository.js
│   │   │   └── userRepository.js
│   │   ├── __tests__/        # Unit tests
│   │   ├── config.js         # Configuration
│   │   ├── db.js             # Database connection
│   │   ├── app.js            # Express app setup
│   │   └── server.js         # Server entry point
│   ├── migrations/           # Database migrations & seeds
│   │   ├── seed_cafes.sql
│   │   └── seed_promotions.sql
│   ├── test/                 # Integration tests
│   ├── .env                  # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── AdminPromotionsList.js
│   │   │   ├── AdminReviewsList.js
│   │   │   ├── AdminUsersList.js
│   │   │   ├── DirectionsModal.js
│   │   │   ├── FavoritesList.js
│   │   │   ├── FilterBar.js
│   │   │   ├── LanguageSelector.js
│   │   │   ├── LoginForm.js
│   │   │   ├── MapView.js
│   │   │   ├── PromotionForm.js
│   │   │   ├── ReviewForm.js
│   │   │   ├── SearchBar.js
│   │   │   └── __tests__/
│   │   ├── pages/            # Page components
│   │   │   ├── Admin.js
│   │   │   ├── Auth.js
│   │   │   ├── Favorites.js
│   │   │   ├── Home.js
│   │   │   ├── Profile.js
│   │   │   └── Review.js
│   │   ├── services/         # API services
│   │   ├── contexts/         # React contexts
│   │   │   └── LanguageContext.js
│   │   ├── hooks/            # Custom hooks
│   │   │   └── useTranslation.js
│   │   ├── locales/          # i18n translations
│   │   │   ├── en.js
│   │   │   ├── ja.js
│   │   │   └── vi.js
│   │   ├── App.css
│   │   ├── App.js            # Main App component
│   │   └── index.js
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json
│   │   └── robots.txt
│   ├── .env                  # Environment variables
│   └── package.json
├── docs/                     # Documentation
│   └── API_SPECIFICATION.md
├── database.sql              # Database schema & initial data
├── .gitignore
└── README.md
```

---

## 📚 API Documentation

Xem chi tiết tại: [docs/API_SPECIFICATION.md](docs/API_SPECIFICATION.md)

### Base URL
- Development: `http://localhost:5001/api`
- Production: `https://your-domain.com/api`

### Authentication
Hầu hết các API endpoints yêu cầu JWT token trong header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Các endpoint chính
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `GET /api/cafes` - Lấy danh sách quán cà phê
- `POST /api/reviews` - Tạo review
- `GET /api/favorites` - Lấy danh sách yêu thích

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

Backend sử dụng Jest với coverage reporting. Test files nằm trong:
- `backend/src/__tests__/` - Unit tests
- `backend/test/` - Integration tests

Frontend sử dụng React Testing Library.

---

## 📖 Tài liệu tham khảo

- [API_SPECIFICATION.md](docs/API_SPECIFICATION.md) - Đặc tả API đầy đủ
- [database.sql](database.sql) - Schema database và dữ liệu mẫu

---

## 🐛 Troubleshooting

### Lỗi kết nối database
- Kiểm tra PostgreSQL đã chạy: `sudo systemctl status postgresql` (Linux) hoặc kiểm tra Services (Windows)
- Kiểm tra thông tin kết nối trong `backend/.env`
- Kiểm tra database `coffee_app` đã được tạo: `psql -U postgres -l`

### Lỗi "Port already in use"
- Backend: `lsof -ti:5001 | xargs kill -9` hoặc thay đổi PORT trong `.env`
- Frontend: `lsof -ti:3000 | xargs kill -9`

### Lỗi API không hoạt động
- Kiểm tra backend đã chạy: `curl http://localhost:5001/`
- Kiểm tra CORS: Frontend và backend phải chạy trên port khác nhau
- Kiểm tra API keys trong `.env` files

### Lỗi bản đồ không hiển thị
- Kiểm tra Goong Access Token trong `frontend/.env`
- Kiểm tra console browser để xem lỗi cụ thể
- Đảm bảo không vi phạm CORS policy

### Lỗi upload avatar
- Kiểm tra limit body size trong Express (đã set 10mb)
- Kiểm tra định dạng base64

### Lỗi đa ngôn ngữ
- Kiểm tra file locales có tồn tại và đúng format JSON
- Kiểm tra LanguageContext được setup đúng

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

**Last Updated:** January 5, 2026  
**Version:** 1.0.0
