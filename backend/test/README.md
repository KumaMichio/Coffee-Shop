# 🧪 Test Documentation

Tài liệu này mô tả cấu trúc và cách chạy các unit tests cho backend API.

## 📁 Cấu trúc Test

```
backend/test/
├── setup.js              # Test utilities và mocks
├── auth/
│   └── auth.test.js      # Authentication tests
├── cafe/
│   └── cafe.test.js      # Cafe search & management tests
├── favorite/
│   └── favorite.test.js  # Favorites management tests
├── review/
│   └── review.test.js    # Reviews management tests
├── profile/
│   └── profile.test.js   # Profile management tests
├── promotion/
│   └── promotion.test.js # Promotions management tests
├── admin/
│   └── admin.test.js     # Admin dashboard tests
└── map/
    └── map.test.js       # Map services tests
```

## 🚀 Chạy Tests

### Chạy tất cả tests

```bash
cd backend
npm test
```

### Chạy test theo tính năng

```bash
# Authentication tests
npm test -- auth

# Cafe tests
npm test -- cafe

# Favorite tests
npm test -- favorite

# Review tests
npm test -- review

# Profile tests
npm test -- profile

# Promotion tests
npm test -- promotion

# Admin tests
npm test -- admin

# Map tests
npm test -- map
```

### Chạy test với coverage

```bash
npm test -- --coverage
```

### Watch mode

```bash
npm test -- --watch
```

## 📝 Test Coverage

### Authentication (auth.test.js)
- ✅ POST /api/auth/register - Đăng ký thành công
- ✅ POST /api/auth/register - Validation errors
- ✅ POST /api/auth/login - Đăng nhập thành công
- ✅ POST /api/auth/login - Invalid credentials
- ✅ GET /api/auth/me - Lấy thông tin user

### Cafe (cafe.test.js)
- ✅ GET /api/cafes/nearby - Tìm quán gần
- ✅ GET /api/cafes/search - Tìm kiếm quán
- ✅ GET /api/cafes - Lấy tất cả cafes
- ✅ Validation và error handling

### Favorite (favorite.test.js)
- ✅ GET /api/favorites - Lấy danh sách yêu thích
- ✅ POST /api/favorites - Thêm vào yêu thích
- ✅ DELETE /api/favorites/:id - Xóa khỏi yêu thích
- ✅ GET /api/favorites/check/:id - Kiểm tra đã yêu thích

### Review (review.test.js)
- ✅ POST /api/reviews - Tạo đánh giá
- ✅ GET /api/reviews/cafe/:id - Lấy đánh giá của quán
- ✅ GET /api/reviews/my/:id - Lấy đánh giá của user
- ✅ DELETE /api/reviews/:id - Xóa đánh giá
- ✅ Validation và error handling

### Profile (profile.test.js)
- ✅ GET /api/profile - Lấy thông tin profile
- ✅ PUT /api/profile - Cập nhật profile
- ✅ POST /api/profile/avatar - Upload avatar
- ✅ PUT /api/profile/password - Đổi mật khẩu
- ✅ Validation và error handling

### Promotion (promotion.test.js)
- ✅ GET /api/promotions/all - Lấy tất cả promotions
- ✅ GET /api/promotions/nearby - Lấy promotions gần
- ✅ GET /api/promotions/cafe/:id - Lấy promotions của quán
- ✅ POST /api/promotions - Tạo promotion
- ✅ PUT /api/promotions/:id - Cập nhật promotion
- ✅ DELETE /api/promotions/:id - Xóa promotion

### Admin (admin.test.js)
- ✅ GET /api/admin/stats - Thống kê
- ✅ GET /api/admin/users - Danh sách users
- ✅ DELETE /api/admin/users/:id - Xóa user
- ✅ GET /api/admin/reviews - Danh sách reviews
- ✅ DELETE /api/admin/reviews/:id - Xóa review
- ✅ GET /api/admin/cafes - Danh sách cafes
- ✅ Authorization checks

### Map (map.test.js)
- ✅ GET /api/map/current-location - Lấy vị trí hiện tại
- ✅ GET /api/map/geocode - Geocode địa chỉ
- ✅ Error handling

## 🛠️ Test Utilities

File `setup.js` cung cấp các utilities:

- `createMockToken()` - Tạo JWT token cho testing
- `createMockUser()` - Tạo mock user object
- `createMockCafe()` - Tạo mock cafe object
- `createMockReview()` - Tạo mock review object
- `createMockPromotion()` - Tạo mock promotion object

## 📊 Best Practices

1. **Isolation**: Mỗi test case độc lập, không phụ thuộc vào test khác
2. **Mocking**: Mock tất cả external dependencies (database, APIs)
3. **Clear naming**: Test names mô tả rõ ràng test case
4. **Assertions**: Kiểm tra cả success và error cases
5. **Coverage**: Aim for 80%+ code coverage

## 🐛 Troubleshooting

### Tests fail với database connection errors

- Tests sử dụng mocks, không cần database thật
- Kiểm tra mocks đã được setup đúng chưa

### Tests fail với authentication errors

- Đảm bảo mock token được tạo đúng
- Kiểm tra middleware mocks

### Tests timeout

- Tăng timeout trong Jest config nếu cần
- Kiểm tra async/await được sử dụng đúng

---

**Last Updated:** 2024-12-24
**Version:** 1.0.0

