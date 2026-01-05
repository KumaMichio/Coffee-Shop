# 📋 Kế hoạch Test - Coffee Shop Finder

Tài liệu này mô tả chi tiết các test cases cho tất cả các tính năng của project.

---

## 📊 Tổng quan

### Test Coverage hiện tại:
- ✅ **Backend API Tests**: Auth, Cafe, Favorite (đã có)
- ✅ **Frontend Component Tests**: SearchBar, FilterBar, apiService (đã có)
- ❌ **Backend API Tests**: Review, Profile (chưa có)
- ❌ **Frontend Component Tests**: MapView, ReviewForm, LoginForm, RegisterForm, FavoritesList (chưa có)
- ❌ **Integration Tests**: End-to-end flows (chưa có)

---

## 🔐 1. AUTHENTICATION (Đăng ký/Đăng nhập)

### Backend Tests (`backend/src/api/__tests__/auth.test.js`)

#### ✅ Đã có:
- [x] POST /api/auth/register - Đăng ký thành công
- [x] POST /api/auth/register - Email đã tồn tại
- [x] POST /api/auth/register - Username đã tồn tại
- [x] POST /api/auth/register - Email format không hợp lệ
- [x] POST /api/auth/register - Password quá ngắn (< 6 ký tự)
- [x] POST /api/auth/login - Đăng nhập thành công
- [x] POST /api/auth/login - Email không tồn tại
- [x] POST /api/auth/login - Password sai
- [x] GET /api/auth/me - Token hợp lệ
- [x] GET /api/auth/me - Token thiếu
- [x] GET /api/auth/me - Token không hợp lệ

#### ⚠️ Cần bổ sung:
- [ ] POST /api/auth/register - Username quá ngắn (< 3 ký tự)
- [ ] POST /api/auth/register - Username quá dài (> 50 ký tự)
- [ ] POST /api/auth/register - Thiếu các trường bắt buộc
- [ ] POST /api/auth/login - Thiếu email hoặc password
- [ ] GET /api/auth/me - Token hết hạn
- [ ] GET /api/auth/me - Token bị thay đổi (tampered)

### Frontend Tests (`frontend/src/components/__tests__/`)

#### ❌ Chưa có - Cần tạo:

**LoginForm.test.js:**
- [ ] Render form với các input fields
- [ ] Validate email format khi submit
- [ ] Validate password required khi submit
- [ ] Gọi authService.login khi form submit thành công
- [ ] Hiển thị error message khi login thất bại
- [ ] Disable button khi đang loading
- [ ] Chuyển sang tab đăng ký khi click "新規登録"
- [ ] Navigate to home sau khi login thành công

**RegisterForm.test.js:**
- [ ] Render form với các input fields (username, email, password, confirmPassword)
- [ ] Validate username (3-50 ký tự)
- [ ] Validate email format
- [ ] Validate password (tối thiểu 6 ký tự)
- [ ] Validate confirmPassword phải khớp với password
- [ ] Gọi authService.register khi form submit thành công
- [ ] Hiển thị error message khi đăng ký thất bại
- [ ] Disable button khi đang loading
- [ ] Chuyển sang tab đăng nhập khi click "ログイン"
- [ ] Navigate to home sau khi đăng ký thành công

**Auth.test.js (Page):**
- [ ] Render cả LoginForm và RegisterForm trong tabs
- [ ] Chuyển đổi giữa tabs login và register
- [ ] Hiển thị background image
- [ ] Hiển thị title "Coffee Shop Finder"

---

## ☕ 2. CAFE SEARCH & NEARBY

### Backend Tests (`backend/src/api/__tests__/cafe.test.js`)

#### ✅ Đã có:
- [x] GET /api/cafes/nearby - Tìm quán gần thành công
- [x] GET /api/cafes/nearby - Thiếu lat/lng
- [x] GET /api/cafes/nearby - Sử dụng radius mặc định (2000m)
- [x] GET /api/cafes/search - Tìm kiếm thành công
- [x] GET /api/cafes/search - Thiếu query
- [x] GET /api/cafes/search - Sử dụng location mặc định

#### ⚠️ Cần bổ sung:
- [ ] GET /api/cafes/nearby - Radius quá lớn (> 50000m)
- [ ] GET /api/cafes/nearby - Lat/lng ngoài phạm vi hợp lệ
- [ ] GET /api/cafes/nearby - Sort theo rating
- [ ] GET /api/cafes/nearby - Sort theo name
- [ ] GET /api/cafes/nearby - Sort theo distance
- [ ] GET /api/cafes/search - Query rỗng hoặc chỉ có khoảng trắng
- [ ] GET /api/cafes/search - Query quá dài (> 200 ký tự)
- [ ] GET /api/cafes/search - Không tìm thấy kết quả
- [ ] GET /api/cafes/search - Sort options
- [ ] Error handling khi API provider (Google/Goong) lỗi

### Frontend Tests

#### ✅ Đã có:
- [x] SearchBar.test.js - Render và submit form
- [x] apiService.test.js - searchCafes và getNearbyCafes

#### ❌ Chưa có - Cần tạo:

**Home.test.js:**
- [ ] Render search bar và filter bar
- [ ] Gọi getNearbyCafes khi component mount với currentLocation
- [ ] Gọi searchCafes khi submit search form
- [ ] Hiển thị loading state khi đang fetch data
- [ ] Hiển thị error message khi fetch thất bại
- [ ] Hiển thị empty state khi không có kết quả
- [ ] Hiển thị danh sách cafes khi có kết quả
- [ ] Filter cafes theo rating
- [ ] Filter cafes theo distance
- [ ] Sort cafes theo rating/distance/name
- [ ] Pagination hoạt động đúng
- [ ] Click vào cafe card → select cafe và hiển thị trên map

---

## ❤️ 3. FAVORITES

### Backend Tests (`backend/src/api/__tests__/favorite.test.js`)

#### ✅ Đã có:
- [x] GET /api/favorites - Lấy danh sách yêu thích
- [x] POST /api/favorites - Thêm quán vào yêu thích
- [x] POST /api/favorites - Thiếu thông tin quán
- [x] POST /api/favorites - Quán đã có trong yêu thích
- [x] DELETE /api/favorites/:cafeId - Xóa thành công
- [x] DELETE /api/favorites/:cafeId - Không tìm thấy
- [x] DELETE /api/favorites/:cafeId - CafeId không hợp lệ
- [x] GET /api/favorites/check/:cafeId - Kiểm tra đã yêu thích

#### ⚠️ Cần bổ sung:
- [ ] GET /api/favorites - Không có quán yêu thích nào (empty array)
- [ ] POST /api/favorites - Thiếu authentication token
- [ ] POST /api/favorites - Cafe data không hợp lệ (thiếu lat/lng)
- [ ] DELETE /api/favorites/:cafeId - Không có quyền xóa (không phải của user)
- [ ] GET /api/favorites/check/:cafeId - CafeId không tồn tại

### Frontend Tests

#### ❌ Chưa có - Cần tạo:

**FavoritesList.test.js:**
- [ ] Render danh sách quán yêu thích
- [ ] Hiển thị empty state khi không có quán nào
- [ ] Hiển thị loading state khi đang fetch
- [ ] Hiển thị error message khi fetch thất bại
- [ ] Click nút xóa → gọi API delete và cập nhật UI
- [ ] Click vào cafe card → navigate to cafe detail hoặc select trên map

**Favorites.test.js (Page):**
- [ ] Render FavoritesList component
- [ ] Gọi API getFavorites khi component mount
- [ ] Hiển thị title "お気に入り"
- [ ] Nút quay lại trang chủ hoạt động

**Home.test.js (Favorite button):**
- [ ] Click nút yêu thích → gọi API saveFavorite
- [ ] Hiển thị success message khi thêm thành công
- [ ] Hiển thị error message khi thêm thất bại
- [ ] Nút yêu thích thay đổi trạng thái (filled/unfilled)

---

## ⭐ 4. REVIEWS (Đánh giá)

### Backend Tests

#### ❌ Chưa có - Cần tạo `backend/src/api/__tests__/review.test.js`:

**POST /api/reviews:**
- [ ] Tạo đánh giá mới thành công
- [ ] Cập nhật đánh giá đã tồn tại
- [ ] Thiếu cafe_id → 400
- [ ] Thiếu rating → 400
- [ ] Rating không hợp lệ (< 1 hoặc > 5) → 400
- [ ] Rating không phải số → 400
- [ ] Cafe_id là string (provider_place_id) → tạo cafe mới nếu chưa có
- [ ] Cafe_id là string nhưng thiếu cafe_data → 400
- [ ] Comment quá dài (> 1000 ký tự) → 400 (nếu có validation)
- [ ] Thiếu authentication token → 401
- [ ] is_public và is_child_friendly mặc định đúng

**GET /api/reviews/cafe/:cafeId:**
- [ ] Lấy tất cả reviews của một quán thành công
- [ ] CafeId là số → tìm trong DB
- [ ] CafeId là string (provider_provider_place_id) → parse và tìm
- [ ] Cafe chưa có trong DB → trả về reviews rỗng
- [ ] Tính average_rating và review_count đúng
- [ ] Chỉ hiển thị public reviews cho user khác
- [ ] Hiển thị cả private reviews cho chính user đó
- [ ] Thiếu authentication token → 401
- [ ] CafeId không hợp lệ → 400

**GET /api/reviews/my/:cafeId:**
- [ ] Lấy review của user hiện tại cho một quán
- [ ] Chưa có review → trả về null
- [ ] Đã có review → trả về review object
- [ ] CafeId là string → parse và tìm
- [ ] Thiếu authentication token → 401

**DELETE /api/reviews/:cafeId:**
- [ ] Xóa review thành công
- [ ] Không tìm thấy review → 404
- [ ] Không có quyền xóa (review của user khác) → 403 hoặc 404
- [ ] CafeId không hợp lệ → 400
- [ ] Thiếu authentication token → 401

### Frontend Tests

#### ❌ Chưa có - Cần tạo:

**ReviewForm.test.js:**
- [ ] Render form với rating selector và comment textarea
- [ ] Hiển thị rating hiện tại nếu đã có review
- [ ] Hiển thị comment hiện tại nếu đã có review
- [ ] Validate rating (1-5)
- [ ] Validate comment length (nếu có giới hạn)
- [ ] Gọi reviewService.submitReview khi submit
- [ ] Hiển thị loading state khi đang submit
- [ ] Hiển thị success message khi submit thành công
- [ ] Hiển thị error message khi submit thất bại
- [ ] Gọi onSuccess callback sau khi submit thành công
- [ ] Gọi onCancel callback khi click cancel
- [ ] Checkbox is_public hoạt động
- [ ] Checkbox is_child_friendly hoạt động

**Review.test.js (Page):**
- [ ] Render ReviewForm với cafe data
- [ ] Load existing review nếu đã có
- [ ] Hiển thị danh sách reviews của quán
- [ ] Hiển thị average rating và review count
- [ ] Hiển thị empty state khi chưa có review nào
- [ ] Xóa review → gọi API và cập nhật UI
- [ ] Navigate back hoạt động

**reviewService.test.js:**
- [ ] submitReview thành công
- [ ] submitReview với cafe_id là string → gửi kèm cafe_data
- [ ] submitReview lỗi authentication
- [ ] submitReview lỗi validation
- [ ] getCafeReviews thành công
- [ ] getCafeReviews lỗi
- [ ] getMyReview thành công
- [ ] deleteReview thành công

---

## 👤 5. PROFILE

### Backend Tests

#### ❌ Chưa có - Cần tạo `backend/src/api/__tests__/profile.test.js`:

**GET /api/profile:**
- [ ] Lấy thông tin profile thành công
- [ ] Lấy reviews của user với pagination
- [ ] Page và limit parameters hoạt động
- [ ] Thiếu authentication token → 401
- [ ] User không tồn tại → 404

**PUT /api/profile:**
- [ ] Cập nhật username thành công
- [ ] Cập nhật email thành công
- [ ] Cập nhật avatar_url thành công
- [ ] Cập nhật nhiều fields cùng lúc
- [ ] Username quá ngắn (< 3) → 400
- [ ] Username quá dài (> 50) → 400
- [ ] Email format không hợp lệ → 400
- [ ] Username đã được sử dụng bởi user khác → 400
- [ ] Email đã được sử dụng bởi user khác → 400
- [ ] Avatar URL quá dài (> 2000 ký tự) → 400
- [ ] Thiếu authentication token → 401

**POST /api/profile/avatar:**
- [ ] Upload avatar với URL thành công
- [ ] Upload avatar với base64 thành công
- [ ] Thiếu avatar_url → 400
- [ ] Avatar URL format không hợp lệ → 400
- [ ] Base64 image quá lớn (> 10MB) → 400
- [ ] Thiếu authentication token → 401

**PUT /api/profile/password:**
- [ ] Đổi mật khẩu thành công
- [ ] Thiếu current_password → 400
- [ ] Thiếu new_password → 400
- [ ] New password quá ngắn (< 6) → 400
- [ ] Current password sai → 401
- [ ] Thiếu authentication token → 401

### Frontend Tests

#### ❌ Chưa có - Cần tạo:

**Profile.test.js (Page):**
- [ ] Render profile information (username, email, avatar)
- [ ] Load user reviews với pagination
- [ ] Hiển thị empty state khi chưa có review
- [ ] Cập nhật username → gọi API và cập nhật UI
- [ ] Cập nhật email → gọi API và cập nhật UI
- [ ] Upload avatar → gọi API và cập nhật UI
- [ ] Đổi mật khẩu → gọi API và hiển thị success message
- [ ] Hiển thị error messages khi API lỗi
- [ ] Navigate back hoạt động

**profileService.test.js:**
- [ ] getProfile thành công
- [ ] updateProfile thành công
- [ ] uploadAvatar thành công
- [ ] changePassword thành công
- [ ] Các methods lỗi authentication

---

## 🗺️ 6. MAP FEATURES

### Backend Tests

#### ❌ Chưa có - Cần tạo `backend/src/api/__tests__/map.test.js`:

**GET /api/map/current-location:**
- [ ] Trả về location thành công
- [ ] Thiếu lat/lng → 400
- [ ] Lat/lng không hợp lệ → 400

### Frontend Tests

#### ❌ Chưa có - Cần tạo:

**MapView.test.js:**
- [ ] Render map container
- [ ] Initialize Goong Maps với access token
- [ ] Hiển thị markers cho các cafes
- [ ] Hiển thị marker vị trí hiện tại
- [ ] Center map khi center prop thay đổi
- [ ] Zoom to location khi zoomToLocation prop thay đổi
- [ ] Click marker → gọi onSelectCafe callback
- [ ] Hover marker → hiển thị popup với thông tin cafe
- [ ] Popup hiển thị: tên, rating, distance, ảnh
- [ ] Smooth transitions khi center/zoom thay đổi
- [ ] Cleanup markers khi cafes prop thay đổi
- [ ] Error handling khi map initialization fail

**DirectionsModal.test.js:**
- [ ] Render modal khi visible = true
- [ ] Ẩn modal khi visible = false
- [ ] Hiển thị thông tin cafe (tên, địa chỉ)
- [ ] Hiển thị các options: Google Maps, Apple Maps, Goong Maps
- [ ] Click Google Maps → mở link đúng format
- [ ] Click Apple Maps → mở link đúng format
- [ ] Click Goong Maps → mở link đúng format
- [ ] Click cancel → gọi onCancel callback
- [ ] Generate directions URL với origin và destination đúng

---

## 🔍 7. FILTER & SORT

### Frontend Tests

#### ✅ Đã có:
- [x] FilterBar.test.js - Render và thay đổi filters

#### ⚠️ Cần bổ sung:

**FilterBar.test.js:**
- [ ] Filter theo rating: >= 4.0, >= 3.5, >= 3.0
- [ ] Filter theo distance: < 500m, < 1km, < 2km
- [ ] Filter theo trạng thái mở cửa (nếu có)
- [ ] Clear filters → reset về null
- [ ] Multiple filters cùng lúc

**Home.test.js (Filter integration):**
- [ ] Apply rating filter → chỉ hiển thị cafes >= rating
- [ ] Apply distance filter → chỉ hiển thị cafes <= distance
- [ ] Combine multiple filters
- [ ] Clear filters → hiển thị tất cả cafes

---

## 🧪 8. INTEGRATION TESTS

### ❌ Chưa có - Cần tạo:

**E2E Test Scenarios:**

1. **User Registration & Login Flow:**
   - [ ] Đăng ký tài khoản mới → đăng nhập → truy cập trang chủ
   - [ ] Đăng ký với email đã tồn tại → hiển thị error
   - [ ] Đăng nhập với thông tin sai → hiển thị error

2. **Search & Filter Flow:**
   - [ ] Tìm kiếm quán → filter theo rating → sort theo distance
   - [ ] Click vào quán → hiển thị trên map → xem chi tiết

3. **Favorite Flow:**
   - [ ] Thêm quán vào yêu thích → kiểm tra trong danh sách yêu thích
   - [ ] Xóa quán khỏi yêu thích → kiểm tra đã bị xóa

4. **Review Flow:**
   - [ ] Tạo đánh giá cho quán → kiểm tra hiển thị trong profile
   - [ ] Cập nhật đánh giá → kiểm tra thay đổi
   - [ ] Xóa đánh giá → kiểm tra đã bị xóa

5. **Map Interaction Flow:**
   - [ ] Lấy vị trí hiện tại → tìm quán gần → hiển thị trên map
   - [ ] Hover vào marker → hiển thị popup
   - [ ] Click marker → select quán → hiển thị chi tiết

6. **Profile Update Flow:**
   - [ ] Cập nhật username → kiểm tra thay đổi
   - [ ] Upload avatar → kiểm tra hiển thị
   - [ ] Đổi mật khẩu → đăng xuất → đăng nhập với mật khẩu mới

---

## 🛠️ 9. ERROR HANDLING & EDGE CASES

### Backend Error Tests:

- [ ] Database connection error
- [ ] API provider (Google/Goong) timeout
- [ ] API provider rate limit
- [ ] Invalid JSON in request body
- [ ] SQL injection attempts (security)
- [ ] XSS attempts (security)
- [ ] JWT token tampering
- [ ] Missing environment variables

### Frontend Error Tests:

- [ ] Network error khi gọi API
- [ ] API trả về 500 error
- [ ] API trả về 401 (unauthorized)
- [ ] API trả về 404 (not found)
- [ ] Geolocation permission denied
- [ ] Geolocation timeout
- [ ] Map initialization fail
- [ ] Image load error (fallback)

---

## 📝 10. TEST UTILITIES & HELPERS

### Cần tạo:

**Backend:**
- [ ] `testHelpers.js` - Mock data factories
- [ ] `testSetup.js` - Database setup/teardown
- [ ] `testDatabase.js` - Test database connection

**Frontend:**
- [ ] `testUtils.js` - Render helpers với providers
- [ ] `mockApiService.js` - Mock API responses
- [ ] `mockAuth.js` - Mock authentication state

---

## 🎯 11. TEST COVERAGE GOALS

### Current Coverage:
- Backend: ~60% (Auth, Cafe, Favorite)
- Frontend: ~30% (SearchBar, FilterBar, apiService)

### Target Coverage:
- **Backend: 80%+**
  - All API endpoints
  - All error cases
  - All edge cases
  
- **Frontend: 70%+**
  - All components
  - All user interactions
  - All error states

### Priority:
1. **High**: Review API tests, Profile API tests
2. **High**: MapView component tests, ReviewForm tests
3. **Medium**: Integration tests cho các flows chính
4. **Low**: E2E tests với Cypress/Playwright

---

## 🚀 12. CHẠY TESTS

### Backend:
```bash
cd backend
npm test                    # Chạy tất cả tests
npm test -- --watch        # Watch mode
npm test -- auth.test.js   # Chạy test file cụ thể
npm test -- --coverage     # Với coverage report
```

### Frontend:
```bash
cd frontend
npm test                    # Chạy tất cả tests
npm test -- --watch        # Watch mode
npm test -- SearchBar      # Chạy test file cụ thể
npm test -- --coverage     # Với coverage report
```

### CI/CD:
- [ ] Setup GitHub Actions để chạy tests tự động
- [ ] Setup test coverage reporting (Codecov)
- [ ] Fail build nếu coverage < threshold

---

## 📚 13. TÀI LIỆU THAM KHẢO

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/react)
- [Supertest](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Last Updated:** 2024
**Maintained by:** Development Team

