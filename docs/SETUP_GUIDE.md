# Hướng dẫn chạy dự án Coffee-Shop (Có Authentication & Favorites)

## Cấu trúc dự án
- **Backend**: Node.js + Express + PostgreSQL
- **Frontend**: React + Ant Design + Leaflet Maps

## Yêu cầu hệ thống
- Node.js v14+ 
- PostgreSQL
- npm hoặc yarn

---

## 1. Cài đặt PostgreSQL và tạo Database

### Windows:
1. Tải PostgreSQL từ: https://www.postgresql.org/download/windows/
2. Cài đặt và nhớ mật khẩu cho user `postgres`
3. Mở Command Prompt/PowerShell tại thư mục dự án:

```powershell
# Tạo database bằng SQL
psql -U postgres
```

Trong psql console, chạy:
```sql
DROP DATABASE IF EXISTS coffee_app;
CREATE DATABASE coffee_app;
\c coffee_app
```

4. Copy nội dung từ `database.sql` (từ dòng CREATE TABLE trở đi) và paste vào psql console

Hoặc dùng **pgAdmin** (GUI):
- Mở pgAdmin → Create Database: `coffee_app`
- Query Tool → Copy/paste nội dung từ `database.sql` → Execute

---

## 2. Cài đặt Backend

```powershell
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env từ .env.example
copy .env.example .env
```

### Cấu hình file `.env`:
```env
PORT=5001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=coffee_app
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Secret (đổi thành chuỗi ngẫu nhiên trong production)
JWT_SECRET=my-super-secret-jwt-key-12345

# API Keys (optional - để tìm kiếm quán)
GOONG_REST_API_KEY=your_goong_api_key
GOOGLE_PLACES_API_KEY=your_google_api_key
```

### Chạy Backend:
```powershell
# Development mode (auto-reload)
npm run dev

# hoặc Production mode
npm start
```

Backend chạy tại: **http://localhost:5001**

---

## 3. Cài đặt Frontend

Mở terminal mới:

```powershell
cd frontend

# Cài đặt dependencies
npm install

# Tạo file .env (optional)
echo REACT_APP_API_URL=http://localhost:5001 > .env

# Chạy frontend
npm start
```

Frontend chạy tại: **http://localhost:3000**

---

## 4. Sử dụng ứng dụng

### Đăng ký / Đăng nhập:
1. Mở trình duyệt: http://localhost:3000
2. Màn hình đăng nhập sẽ hiện ra
3. Click **Đăng ký** → Điền username, email, password
4. Sau khi đăng ký thành công, bạn sẽ tự động đăng nhập

### Tìm kiếm quán cà phê:
- Tìm theo từ khóa hoặc xem quán gần vị trí hiện tại
- Click vào quán trên bản đồ để xem chi tiết

### Yêu thích quán:
- Click vào quán để xem chi tiết
- Click nút **❤️ Thêm vào yêu thích**
- Xem danh sách yêu thích: Click nút **Yêu thích** trên header

---

## 5. API Endpoints

### Authentication:
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập  
- `GET /api/auth/me` - Lấy thông tin user (cần token)

### Favorites (yêu cầu authentication):
- `GET /api/favorites` - Lấy danh sách yêu thích
- `POST /api/favorites` - Thêm quán vào yêu thích
- `DELETE /api/favorites/:cafeId` - Xóa khỏi yêu thích
- `GET /api/favorites/check/:cafeId` - Kiểm tra đã yêu thích chưa

### Cafes (existing):
- `GET /api/cafes/nearby` - Tìm quán gần vị trí
- `GET /api/cafes/search` - Tìm kiếm theo từ khóa

---

## 6. Cấu trúc Database

### Bảng `users`:
- `id`, `username`, `email`, `password_hash`
- Lưu thông tin người dùng

### Bảng `cafes`:
- `id`, `provider`, `provider_place_id`, `name`, `address`, `lat`, `lng`, `rating`
- Lưu thông tin quán cà phê

### Bảng `favorites`:
- `id`, `user_id`, `cafe_id`
- Bảng trung gian Many-to-Many

---

## 7. Troubleshooting

### Lỗi kết nối database:
- Kiểm tra PostgreSQL đã chạy: `psql --version`
- Kiểm tra thông tin trong file `.env`
- Đảm bảo database `coffee_app` đã được tạo

### Lỗi CORS:
- Backend đã cấu hình CORS, đảm bảo backend chạy trước frontend

### Lỗi JWT/Authentication:
- Xóa localStorage: F12 → Application → Local Storage → Clear
- Đăng nhập lại

### Port đã được sử dụng:
- Backend: Đổi PORT trong `.env`
- Frontend: Chạy với port khác: `PORT=3001 npm start`

---

## 8. Chạy Tests

```powershell
# Backend tests
cd backend
npm test

# Frontend tests  
cd frontend
npm test
```

---

## 9. Dependencies mới đã thêm

### Backend:
- `bcryptjs` - Hash mật khẩu
- `jsonwebtoken` - Tạo và verify JWT tokens

### Frontend:
- `antd` - Ant Design UI framework
- `react-router-dom` - Routing cho React

---

## Tech Stack
- **Backend**: Express.js, PostgreSQL, JWT Authentication
- **Frontend**: React, Ant Design, Leaflet Maps
- **Map Providers**: Goong Maps, Google Maps
