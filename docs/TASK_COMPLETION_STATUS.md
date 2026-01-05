# 📊 Trạng thái hoàn thành các nhiệm vụ Sprint

Dựa trên file `idea.md` và codebase hiện tại.

---

## ✅ 1. 認証機能 — Chức năng xác thực

### ✅ 1. 新規登録 API 実装 — API đăng ký tài khoản
**Trạng thái: HOÀN THÀNH 100%**

**File:** `backend/src/api/auth.js` (dòng 18-92)

**Đã implement:**
- ✅ Nhận username/email/password
- ✅ Kiểm tra định dạng email (regex validation)
- ✅ Kiểm tra username (3-50 ký tự)
- ✅ Kiểm tra password (tối thiểu 6 ký tự)
- ✅ Kiểm tra email đã tồn tại
- ✅ Kiểm tra username đã tồn tại
- ✅ Hash mật khẩu bằng bcryptjs (salt rounds: 10)
- ✅ Lưu vào database (bảng `users`)
- ✅ Tự động tạo JWT token sau đăng ký

**Phụ trách:** Hùng ✅

---

### ✅ 2. ログイン API 実装 — API đăng nhập
**Trạng thái: HOÀN THÀNH 100%**

**File:** `backend/src/api/auth.js` (dòng 94-142)

**Đã implement:**
- ✅ Xác thực email/password
- ✅ Tìm user theo email
- ✅ So sánh password với bcrypt
- ✅ Trả về JWT token nếu đúng
- ✅ Trả về thông tin user (id, username, email)
- ✅ Error handling cho trường hợp sai thông tin

**Phụ trách:** Hùng ✅

---

### ✅ 3. FE ログイン・登録画面実装 — UI đăng ký/đăng nhập
**Trạng thái: HOÀN THÀNH 100%**

**Files:** 
- `frontend/src/pages/Auth.js`
- `frontend/src/components/LoginForm.js`
- `frontend/src/components/RegisterForm.js`

**Đã implement:**
- ✅ Form đăng nhập với email/password
- ✅ Form đăng ký với username/email/password
- ✅ Tabs để chuyển đổi giữa đăng nhập/đăng ký
- ✅ Validate input phía client
- ✅ Gọi API đăng ký/đăng nhập
- ✅ Tự động chuyển trang khi thành công (navigate to '/')
- ✅ Hiển thị thông báo lỗi
- ✅ Protected routes (yêu cầu đăng nhập)

**Phụ trách:** Hùng ✅

---

## ✅ 2. お気に入り機能 — Chức năng yêu thích

### ✅ 4. お気に入り登録 API 作成 — API thêm quán vào danh sách yêu thích
**Trạng thái: HOÀN THÀNH 100%**

**File:** `backend/src/api/favorite.js` (dòng 27-64)

**Đã implement:**
- ✅ API `POST /api/favorites` với authentication
- ✅ Thêm quán từ danh sách (có nút ♥ trên mỗi quán)
- ✅ Icon hiển thị trạng thái (nút ♥ màu đỏ)
- ✅ Lưu quán vào database nếu chưa có
- ✅ Thêm vào bảng `favorites`
- ✅ Xử lý duplicate (unique constraint)
- ✅ Trả về thông báo thành công

**Frontend:** `frontend/src/pages/Home.js` (dòng 194-237)
- ✅ Nút thêm yêu thích trên mỗi quán trong danh sách
- ✅ Thông báo thành công/lỗi

**Phụ trách:** Minh Đức ✅

---

### ✅ 5. お気に入り削除 API 作成 — API xóa quán khỏi yêu thích
**Trạng thái: HOÀN THÀNH 100%**

**File:** `backend/src/api/favorite.js` (dòng 66-89)

**Đã implement:**
- ✅ API `DELETE /api/favorites/:cafeId` với authentication
- ✅ Xóa khỏi bảng `favorites`
- ✅ Cập nhật ngay lập tức (không cần reload)
- ✅ Trả về thông báo thành công
- ✅ Error handling (404 nếu không tìm thấy)

**Frontend:** `frontend/src/components/FavoritesList.js` (dòng 27-35)
- ✅ Nút "Xóa yêu thích" trên mỗi card
- ✅ Cập nhật UI ngay sau khi xóa

**Phụ trách:** Minh Đức ✅

---

### ✅ 6. お気に入り一覧表示 FE 実装 — UI danh sách yêu thích
**Trạng thái: HOÀN THÀNH 100%**

**Files:**
- `frontend/src/pages/Favorites.js`
- `frontend/src/components/FavoritesList.js`

**Đã implement:**
- ✅ Lấy danh sách quán yêu thích theo user_id (API `GET /api/favorites`)
- ✅ Hiển thị dạng list với Ant Design List/Card
- ✅ Grid layout responsive (1-4 cột tùy màn hình)
- ✅ Hiển thị thông tin quán: tên, địa chỉ, rating, số đánh giá
- ✅ Empty state khi chưa có quán nào
- ✅ Loading state
- ✅ Nút quay lại trang chủ

**Phụ trách:** Minh Đức ✅

---

## ✅ 3. 地図・ナビ機能 — Chức năng bản đồ – điều hướng

### ✅ 7. 現在地取得 API 連携 — Lấy vị trí hiện tại
**Trạng thái: HOÀN THÀNH 100%**

**Files:**
- `frontend/src/pages/Home.js` (dòng 38-82, 142-188)
- `backend/src/api/map.js` (dòng 13-53)

**Đã implement:**
- ✅ Lấy tọa độ user bằng Geolocation API (navigator.geolocation)
- ✅ Kiểm tra quyền truy cập vị trí
- ✅ Fallback về Hà Nội nếu không lấy được
- ✅ Tích hợp với Goong Maps (API `/api/map/current-location`)
- ✅ Hiển thị marker vị trí hiện tại trên bản đồ (màu xanh)
- ✅ Nút "📍 Vị trí của tôi" để lấy lại vị trí

**Phụ trách:** Thái Đức ✅

---

### ✅ 8. 2km圏内カフェ検索 API — Tìm quán trong bán kính 2km
**Trạng thái: HOÀN THÀNH 100%** (và hơn thế)

**Files:**
- `backend/src/api/cafe.js` (dòng 23-50)
- `backend/src/repositories/cafeRepository.js`
- `frontend/src/pages/Home.js`

**Đã implement:**
- ✅ API `GET /api/cafes/nearby` với parameters: lat, lng, radius (mặc định 2000m), sort
- ✅ Tìm quán trong bán kính (có thể điều chỉnh, mặc định 2km)
- ✅ Tích hợp Goong Maps API
- ✅ Tích hợp Google Places API
- ✅ Hiển thị dạng bản đồ (với markers)
- ✅ Hiển thị dạng danh sách (list)
- ✅ Tính khoảng cách từ vị trí hiện tại
- ✅ Lọc kết quả theo bán kính chính xác

**Lưu ý:** Code hiện tại hỗ trợ radius tùy chỉnh (không chỉ 2km), và có nút "Vị trí của tôi" tìm trong 10km.

**Phụ trách:** Thái Đức ✅

---

### ❌ 9. 経路案内リンク生成 — Hiển thị đường đi đến quán
**Trạng thái: CHƯA HOÀN THÀNH**

**Mô tả yêu cầu:**
- Tạo route đến quán
- Mở được trên Google Maps

**Hiện tại:**
- ❌ Không có chức năng tạo link Google Maps
- ❌ Không có nút "Chỉ đường" hoặc "Xem trên Google Maps"
- ❌ Không có link điều hướng đến quán

**Cần implement:**
- Thêm nút/link "Chỉ đường" trên mỗi quán
- Tạo URL Google Maps Directions: `https://www.google.com/maps/dir/?api=1&destination=lat,lng`
- Hoặc Goong Directions API

**Phụ trách:** Việt ❌

---

## ⚠️ 4. 検索・フィルター機能 — Tìm kiếm & Bộ lọc

### ✅ 10. 並び替え機能 — Sắp xếp theo (khoảng cách/đánh giá/giá)
**Trạng thái: HOÀN THÀNH 80%** (thiếu sắp xếp theo giá)

**Files:**
- `backend/src/api/cafe.js` (dòng 9-21)
- `frontend/src/components/SearchBar.js` (dòng 29-37)
- `frontend/src/pages/Home.js` (dòng 131-140)

**Đã implement:**
- ✅ UI chọn tiêu chí sắp xếp (select dropdown)
- ✅ Sắp xếp theo khoảng cách (`distance`)
- ✅ Sắp xếp theo đánh giá (`rating`)
- ✅ Sắp xếp theo tên (`name`)
- ✅ Cập nhật list theo lựa chọn ngay lập tức
- ❌ **THIẾU:** Sắp xếp theo giá (price)

**Lưu ý:** API không trả về thông tin giá, cần tích hợp thêm từ Google/Goong Places API.

**Phụ trách:** Bình ⚠️ (80% - thiếu giá)

---

### ❌ 11. 絞り込み UI 実装 — UI bộ lọc
**Trạng thái: CHƯA HOÀN THÀNH**

**Mô tả yêu cầu:**
- Lọc theo đánh giá
- Lọc theo khoảng cách
- Lọc theo đang mở (opening hours)

**Hiện tại:**
- ❌ Không có UI bộ lọc riêng
- ❌ Chỉ có sắp xếp (sort), không có filter
- ❌ Không có filter theo rating (ví dụ: chỉ hiển thị quán >= 4 sao)
- ❌ Không có filter theo khoảng cách (ví dụ: chỉ hiển thị quán < 1km)
- ❌ Không có filter theo trạng thái mở cửa (opening hours)

**Cần implement:**
- Thêm UI filter với các options:
  - Rating: >= 4.0, >= 3.5, >= 3.0, tất cả
  - Khoảng cách: < 500m, < 1km, < 2km, tất cả
  - Trạng thái: Đang mở, Tất cả
- Tích hợp opening hours từ Google/Goong Places API

**Phụ trách:** Bình ❌

---

## ❌ 5. 機能テスト — Test chức năng

### ❌ 12. テスト項目整理・実施 — Thiết kế & chạy test
**Trạng thái: CHƯA HOÀN THÀNH**

**Mô tả yêu cầu:**
- Test yêu thích
- Test bản đồ – điều hướng
- Test tìm kiếm
- Test bộ lọc
- Test error-case

**Hiện tại:**
- ❌ Chỉ có test mặc định của React (`App.test.js` - test placeholder)
- ❌ Không có test cho API backend
- ❌ Không có test cho chức năng yêu thích
- ❌ Không có test cho bản đồ
- ❌ Không có test cho tìm kiếm
- ❌ Không có test cho bộ lọc (vì chưa có)
- ❌ Không có test error-case

**Cần implement:**
- Backend: Jest tests cho các API endpoints
- Frontend: React Testing Library tests cho các components
- Integration tests cho các flow chính

**Phụ trách:** Bình ❌

---

## ⚠️ 6. 改善タスク — Nhiệm vụ cải thiện

### ⚠️ 13. Sprint01 フィードバック改善対応 — Fix theo góp ý Sprint01
**Trạng thái: HOÀN THÀNH MỘT PHẦN**

**Các điểm cải thiện yêu cầu:**

#### ✅ Tìm kiếm theo tên/địa chỉ
**Trạng thái: HOÀN THÀNH**

**File:** `backend/src/api/cafe.js` (dòng 52-81)

- ✅ API `GET /api/cafes/search` với parameter `query`
- ✅ Tìm kiếm theo tên quán
- ✅ Tìm kiếm theo địa chỉ
- ✅ Tích hợp với Goong và Google Places API

---

#### ⚠️ Hover info quán
**Trạng thái: HOÀN THÀNH MỘT PHẦN**

**Hiện tại:**
- ✅ Có CSS hover effects (`.cafe-item:hover`)
- ✅ Có popup trên marker khi click (Goong Maps popup)
- ❌ **THIẾU:** Hover info trên danh sách quán (tooltip/popover hiển thị thông tin chi tiết khi hover)

**Cần cải thiện:**
- Thêm tooltip/popover khi hover vào quán trong danh sách
- Hiển thị thông tin: rating, khoảng cách, địa chỉ đầy đủ

---

#### ✅ Mượt thao tác bản đồ
**Trạng thái: HOÀN THÀNH**

**File:** `frontend/src/components/MapView.js`

- ✅ Sử dụng Goong Maps JS library (smooth interactions)
- ✅ Auto-center khi chọn quán
- ✅ Smooth transitions
- ✅ Markers được update mượt mà

---

#### ⚠️ Đổi màu marker
**Trạng thái: HOÀN THÀNH MỘT PHẦN**

**Hiện tại:**
- ✅ Marker màu xanh cho vị trí hiện tại (custom HTML element)
- ✅ Marker xám mặc định cho các quán (Goong default)
- ❌ **THIẾU:** Marker màu khác nhau cho các loại quán (ví dụ: màu đỏ cho yêu thích, màu vàng cho rating cao)

**Cần cải thiện:**
- Marker màu đỏ cho quán đã yêu thích
- Marker màu vàng cho quán rating >= 4.5
- Hoặc marker khác màu theo provider (Goong vs Google)

**Phụ trách:** Việt ⚠️ (50% - có marker custom nhưng chưa đủ màu sắc)

---

## 📊 TỔNG KẾT

### ✅ Đã hoàn thành hoàn toàn (9/13):
1. ✅ API đăng ký tài khoản
2. ✅ API đăng nhập
3. ✅ UI đăng ký/đăng nhập
4. ✅ API thêm quán vào yêu thích
5. ✅ API xóa quán khỏi yêu thích
6. ✅ UI danh sách yêu thích
7. ✅ Lấy vị trí hiện tại
8. ✅ Tìm quán trong bán kính 2km
9. ✅ Tìm kiếm theo tên/địa chỉ (Sprint01 feedback)

### ⚠️ Đã hoàn thành một phần (2/13):
10. ⚠️ Sắp xếp (thiếu sắp xếp theo giá)
11. ⚠️ Fix Sprint01 feedback (thiếu hover info và đổi màu marker đầy đủ)

### ❌ Chưa hoàn thành (2/13):
12. ❌ Hiển thị đường đi đến quán
13. ❌ UI bộ lọc
14. ❌ Test chức năng

---

## 📈 Tỷ lệ hoàn thành: **69%** (9/13 hoàn toàn + 2/13 một phần)

### Ưu tiên tiếp theo:
1. **Cao:** Hiển thị đường đi đến quán (nhiệm vụ 9)
2. **Cao:** UI bộ lọc (nhiệm vụ 11)
3. **Trung bình:** Test chức năng (nhiệm vụ 12)
4. **Thấp:** Hoàn thiện các cải thiện Sprint01 (hover info, marker màu sắc)




