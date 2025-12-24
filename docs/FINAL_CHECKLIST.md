# ✅ Checklist Kiểm tra Tổng hợp - Coffee Shop Finder

Checklist này dùng để kiểm tra toàn bộ hệ thống trước khi phát hành chính thức.

**Ngày kiểm tra:** _______________
**Người kiểm tra:** _______________

---

## 📋 Mục lục

- [Chuẩn bị](#-chuẩn-bị)
- [Backend](#-backend)
- [Frontend](#-frontend)
- [Database](#-database)
- [Tài liệu](#-tài-liệu)
- [Testing](#-testing)
- [Security](#-security)
- [Performance](#-performance)
- [Deployment](#-deployment)

---

## 🔧 Chuẩn bị

### Môi trường

- [ ] Node.js v18+ đã được cài đặt
- [ ] PostgreSQL v14+ đã được cài đặt và chạy
- [ ] Git đã được cài đặt
- [ ] Code editor (VS Code, etc.) đã được cài đặt

### Dependencies

- [ ] Backend dependencies đã được cài đặt (`npm install` trong `backend/`)
- [ ] Frontend dependencies đã được cài đặt (`npm install` trong `frontend/`)
- [ ] Không có lỗi khi cài đặt

### Environment Variables

- [ ] File `.env` trong `backend/` đã được tạo và cấu hình đầy đủ
- [ ] File `.env` trong `frontend/` đã được tạo và cấu hình đầy đủ
- [ ] Tất cả API keys đã được cấu hình:
  - [ ] `GOONG_API_KEY` / `GOONG_REST_API_KEY`
  - [ ] `GOOGLE_PLACES_API_KEY`
  - [ ] `JWT_SECRET`
  - [ ] Database connection strings

---

## 🔙 Backend

### Server

- [ ] Backend server khởi động thành công (`npm run dev`)
- [ ] Server chạy tại port 5000 (hoặc port đã cấu hình)
- [ ] Không có lỗi trong console khi khởi động
- [ ] Database connection thành công

### API Endpoints

- [ ] Tất cả API endpoints hoạt động:
  - [ ] `POST /api/auth/register`
  - [ ] `POST /api/auth/login`
  - [ ] `GET /api/auth/me`
  - [ ] `GET /api/cafes/nearby`
  - [ ] `GET /api/cafes/search`
  - [ ] `GET /api/cafes`
  - [ ] `GET /api/favorites`
  - [ ] `POST /api/favorites`
  - [ ] `DELETE /api/favorites/:id`
  - [ ] `POST /api/reviews`
  - [ ] `GET /api/reviews/cafe/:id`
  - [ ] `GET /api/profile`
  - [ ] `PUT /api/profile`
  - [ ] `GET /api/promotions/all`
  - [ ] `GET /api/admin/stats`
  - [ ] `GET /api/admin/users`
  - [ ] `GET /api/admin/reviews`

### Error Handling

- [ ] Tất cả API endpoints có error handling
- [ ] Error messages rõ ràng, dễ hiểu
- [ ] HTTP status codes đúng (200, 201, 400, 401, 404, 500)

### Authentication

- [ ] JWT token được tạo đúng khi đăng nhập/đăng ký
- [ ] JWT token được verify đúng ở các protected routes
- [ ] Token hết hạn được xử lý đúng (401)
- [ ] Invalid token được xử lý đúng (401)

### Validation

- [ ] Input validation hoạt động đúng:
  - [ ] Email format validation
  - [ ] Password length validation
  - [ ] Username length validation
  - [ ] Rating range validation (1-5)
  - [ ] Required fields validation

---

## 🎨 Frontend

### Build

- [ ] Frontend build thành công (`npm run build`)
- [ ] Không có lỗi khi build
- [ ] Không có warnings nghiêm trọng

### Pages

- [ ] Tất cả pages render đúng:
  - [ ] `/auth` - Trang đăng nhập/đăng ký
  - [ ] `/` - Trang chủ
  - [ ] `/favorites` - Trang yêu thích
  - [ ] `/review/:cafeId` - Trang đánh giá
  - [ ] `/profile` - Trang profile
  - [ ] `/admin` - Trang admin (chỉ admin)

### Components

- [ ] Tất cả components hoạt động đúng:
  - [ ] `MapView` - Hiển thị bản đồ
  - [ ] `SearchBar` - Tìm kiếm
  - [ ] `FilterBar` - Bộ lọc
  - [ ] `FavoritesList` - Danh sách yêu thích
  - [ ] `ReviewForm` - Form đánh giá
  - [ ] `LanguageDropdown` - Chuyển đổi ngôn ngữ
  - [ ] `DirectionsModal` - Modal chỉ đường

### Routing

- [ ] Protected routes hoạt động đúng:
  - [ ] Redirect về `/auth` nếu chưa đăng nhập
  - [ ] Admin route chỉ cho phép admin truy cập
  - [ ] User thường không thể truy cập `/admin`

### State Management

- [ ] State được quản lý đúng:
  - [ ] Authentication state
  - [ ] Language state (i18n)
  - [ ] Cafe list state
  - [ ] Filter state

### UI/UX

- [ ] Responsive design hoạt động đúng:
  - [ ] Desktop (1920x1080)
  - [ ] Laptop (1366x768)
  - [ ] Tablet (768x1024)
  - [ ] Mobile (375x667)

- [ ] Loading states hiển thị đúng
- [ ] Error states hiển thị đúng
- [ ] Empty states hiển thị đúng
- [ ] Success messages hiển thị đúng

### i18n

- [ ] Tất cả text đều được dịch:
  - [ ] Tiếng Việt
  - [ ] Tiếng Anh
  - [ ] Tiếng Nhật
- [ ] Không có text hardcode
- [ ] Format date theo locale
- [ ] Ngôn ngữ được lưu trong localStorage

---

## 🗄️ Database

### Schema

- [ ] Database schema đã được tạo đúng (`database.sql`)
- [ ] Tất cả bảng đã được tạo:
  - [ ] `users`
  - [ ] `cafes`
  - [ ] `favorites`
  - [ ] `reviews`
  - [ ] `promotions`

### Constraints

- [ ] Primary keys đã được định nghĩa
- [ ] Foreign keys đã được định nghĩa
- [ ] Unique constraints đã được định nghĩa
- [ ] Not null constraints đã được định nghĩa

### Indexes

- [ ] Indexes đã được tạo cho các cột thường query:
  - [ ] `users.email`
  - [ ] `users.username`
  - [ ] `cafes.provider, cafes.provider_place_id`
  - [ ] `favorites.user_id, favorites.cafe_id`
  - [ ] `reviews.cafe_id`
  - [ ] `reviews.user_id`

### Data

- [ ] Dữ liệu mẫu đã được seed (nếu cần):
  - [ ] Cafes mẫu
  - [ ] Promotions mẫu
  - [ ] Users mẫu (admin, user thường)

---

## 📚 Tài liệu

### README

- [ ] `README.md` đã được cập nhật:
  - [ ] Hướng dẫn cài đặt
  - [ ] Hướng dẫn cấu hình
  - [ ] Hướng dẫn chạy ứng dụng
  - [ ] Cấu trúc dự án

### API Documentation

- [ ] `docs/API_SPECIFICATION.md` đã được tạo và đầy đủ:
  - [ ] Tất cả endpoints đã được mô tả
  - [ ] Request/Response examples
  - [ ] Error codes

### Features Documentation

- [ ] `docs/FEATURES.md` đã được cập nhật:
  - [ ] Tất cả tính năng đã được mô tả
  - [ ] Trạng thái implementation

### Test Documentation

- [ ] `docs/TEST_PLAN.md` đã được tạo
- [ ] `docs/UAT_TEST_PLAN.md` đã được tạo

### Instructor Guide

- [ ] `docs/INSTRUCTOR_GUIDE.md` đã được tạo:
  - [ ] Hướng dẫn tạo admin account
  - [ ] Hướng dẫn quản lý lớp học

### Demo Script

- [ ] `docs/DEMO_SCRIPT.md` đã được tạo:
  - [ ] Kịch bản demo đầy đủ
  - [ ] Tips cho người demo

---

## 🧪 Testing

### Unit Tests

- [ ] Backend unit tests đã được viết và pass:
  - [ ] Auth tests
  - [ ] Cafe tests
  - [ ] Favorite tests
  - [ ] Review tests
  - [ ] Profile tests

- [ ] Frontend unit tests đã được viết và pass:
  - [ ] Component tests
  - [ ] Service tests

### Integration Tests

- [ ] Integration tests đã được viết và pass:
  - [ ] API integration tests
  - [ ] Database integration tests

### UAT

- [ ] UAT đã được thực hiện:
  - [ ] Tất cả test cases đã được test
  - [ ] Pass rate >= 80%
  - [ ] Critical bugs đã được fix

### Manual Testing

- [ ] Manual testing đã được thực hiện:
  - [ ] Tất cả tính năng chính
  - [ ] Edge cases
  - [ ] Error cases

---

## 🔒 Security

### Authentication

- [ ] Passwords được hash bằng bcryptjs
- [ ] JWT tokens được ký bằng secret key
- [ ] JWT tokens có expiration (7 days)
- [ ] Protected routes được bảo vệ đúng

### Authorization

- [ ] Admin routes chỉ cho phép admin truy cập
- [ ] Users chỉ có thể xóa reviews/favorites của chính mình
- [ ] Admin có thể xóa bất kỳ user/review nào

### Input Validation

- [ ] SQL injection được ngăn chặn (parameterized queries)
- [ ] XSS được ngăn chặn (input sanitization)
- [ ] Email format validation
- [ ] Password strength validation

### CORS

- [ ] CORS được cấu hình đúng
- [ ] Chỉ cho phép frontend truy cập

### Environment Variables

- [ ] Sensitive data không được hardcode
- [ ] `.env` files không được commit vào git
- [ ] `.gitignore` đã được cấu hình đúng

---

## ⚡ Performance

### Backend

- [ ] API response time < 1s cho hầu hết endpoints
- [ ] Database queries được optimize
- [ ] Indexes đã được tạo cho các cột thường query

### Frontend

- [ ] Page load time < 3s
- [ ] Images được optimize
- [ ] Code splitting (nếu có)

### Database

- [ ] Database connection pool được cấu hình đúng
- [ ] Queries không bị N+1 problem

---

## 🚀 Deployment

### Production Environment

- [ ] Production environment variables đã được cấu hình
- [ ] API keys production đã được cấu hình
- [ ] Database production đã được setup

### Build

- [ ] Frontend build production thành công
- [ ] Backend có thể chạy production mode

### Monitoring

- [ ] Error logging đã được setup (nếu có)
- [ ] Performance monitoring đã được setup (nếu có)

---

## ✅ Tổng kết

### Checklist hoàn thành

- [ ] Tất cả items trong checklist đã được kiểm tra
- [ ] Tất cả critical issues đã được fix
- [ ] Tất cả tài liệu đã được cập nhật

### Kết luận

- [ ] Hệ thống đã sẵn sàng phát hành
- [ ] Cần sửa lỗi trước khi phát hành
- [ ] Cần cải thiện tính năng

### Ghi chú

```
[Ghi chú về các vấn đề còn lại, cải tiến cần thiết, etc.]
```

---

**Ngày hoàn thành:** _______________
**Người kiểm tra:** _______________
**Chữ ký:** _______________

---

**Last Updated:** 2024-12-24
**Version:** 1.0.0

