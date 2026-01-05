# 🧪 Kế hoạch UAT (User Acceptance Testing) - Coffee Shop Finder

Tài liệu này mô tả chi tiết kế hoạch kiểm thử chấp nhận người dùng (UAT) cho hệ thống Coffee Shop Finder.

**Mục tiêu:** Đảm bảo hệ thống đáp ứng đầy đủ yêu cầu của người dùng và hoạt động ổn định trước khi phát hành.

---

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Phạm vi kiểm thử](#-phạm-vi-kiểm-thử)
- [Môi trường kiểm thử](#-môi-trường-kiểm-thử)
- [Test Cases](#-test-cases)
- [Checklist hoàn thành](#-checklist-hoàn-thành)
- [Báo cáo lỗi](#-báo-cáo-lỗi)

---

## 🎯 Tổng quan

### Mục tiêu UAT

1. ✅ Xác nhận tất cả tính năng hoạt động đúng như mong đợi
2. ✅ Kiểm tra tính dễ sử dụng (usability)
3. ✅ Kiểm tra hiệu năng cơ bản
4. ✅ Kiểm tra tính tương thích với các trình duyệt
5. ✅ Xác nhận không có lỗi nghiêm trọng (critical bugs)

### Đối tượng kiểm thử

- **Người dùng thường:** Sinh viên, người dùng cuối
- **Admin:** Giảng viên, quản trị viên

### Thời gian ước tính

- **Tổng thời gian:** 2-3 giờ
- **Mỗi test case:** 5-10 phút

---

## 🔍 Phạm vi kiểm thử

### Tính năng cần kiểm thử

1. ✅ Authentication (Đăng ký/Đăng nhập)
2. ✅ Tìm kiếm quán cà phê
3. ✅ Bản đồ và điều hướng
4. ✅ Yêu thích (Favorites)
5. ✅ Đánh giá (Reviews)
6. ✅ Profile
7. ✅ Khuyến mãi (Promotions)
8. ✅ Admin Dashboard
9. ✅ Đa ngôn ngữ (i18n)

### Tính năng không kiểm thử trong UAT

- ❌ Unit tests (đã có trong development)
- ❌ Integration tests (đã có trong development)
- ❌ Performance tests (nằm ngoài phạm vi UAT)

---

## 💻 Môi trường kiểm thử

### Yêu cầu hệ thống

- **Backend:** `http://localhost:5000`
- **Frontend:** `http://localhost:3000`
- **Database:** PostgreSQL (đã có dữ liệu mẫu)

### Trình duyệt cần kiểm thử

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

### Thiết bị

- ✅ Desktop (1920x1080)
- ✅ Laptop (1366x768)
- ✅ Tablet (768x1024) - Optional
- ✅ Mobile (375x667) - Optional

---

## 📝 Test Cases

### 1. Authentication

#### TC-AUTH-001: Đăng ký tài khoản mới

**Mô tả:** Người dùng đăng ký tài khoản mới thành công.

**Các bước:**
1. Truy cập `/auth`
2. Click tab "Đăng ký"
3. Điền thông tin:
   - Username: `test_user_001`
   - Email: `test001@example.com`
   - Password: `password123`
4. Click "Đăng ký"

**Kết quả mong đợi:**
- ✅ Hiển thị thông báo "Đăng ký thành công"
- ✅ Tự động chuyển về trang chủ
- ✅ Đã đăng nhập với tài khoản mới

**Trạng thái:** ⬜ Chưa test / ✅ Pass / ❌ Fail

---

#### TC-AUTH-002: Đăng ký với email đã tồn tại

**Mô tả:** Người dùng cố gắng đăng ký với email đã được sử dụng.

**Các bước:**
1. Truy cập `/auth`
2. Click tab "Đăng ký"
3. Điền email đã tồn tại: `admin@example.com`
4. Điền username và password
5. Click "Đăng ký"

**Kết quả mong đợi:**
- ✅ Hiển thị lỗi "Email đã được sử dụng"
- ✅ Không tạo tài khoản mới
- ✅ Vẫn ở trang đăng ký

**Trạng thái:** ⬜ Chưa test / ✅ Pass / ❌ Fail

---

#### TC-AUTH-003: Đăng nhập thành công

**Mô tả:** Người dùng đăng nhập với thông tin đúng.

**Các bước:**
1. Truy cập `/auth`
2. Click tab "Đăng nhập"
3. Điền email và password đúng
4. Click "Đăng nhập"

**Kết quả mong đợi:**
- ✅ Hiển thị thông báo "Đăng nhập thành công"
- ✅ Tự động chuyển về trang chủ
- ✅ Header hiển thị username

**Trạng thái:** ⬜ Chưa test / ✅ Pass / ❌ Fail

---

#### TC-AUTH-004: Đăng nhập với thông tin sai

**Mô tả:** Người dùng đăng nhập với email/password sai.

**Các bước:**
1. Truy cập `/auth`
2. Click tab "Đăng nhập"
3. Điền email hoặc password sai
4. Click "Đăng nhập"

**Kết quả mong đợi:**
- ✅ Hiển thị lỗi "Email hoặc mật khẩu không đúng"
- ✅ Không đăng nhập được
- ✅ Vẫn ở trang đăng nhập

**Trạng thái:** ⬜ Chưa test / ✅ Pass / ❌ Fail

---

### 2. Tìm kiếm quán cà phê

#### TC-SEARCH-001: Tìm kiếm theo từ khóa

**Mô tả:** Tìm kiếm quán cà phê bằng từ khóa.

**Các bước:**
1. Đăng nhập
2. Ở trang chủ, gõ "starbucks" vào search bar
3. Nhấn Enter hoặc click nút search

**Kết quả mong đợi:**
- ✅ Hiển thị danh sách quán có tên chứa "starbucks"
- ✅ Bản đồ hiển thị markers cho các quán
- ✅ Click vào quán → Bản đồ zoom vào quán đó

**Trạng thái:** ⬜ Chưa test / ✅ Pass / ❌ Fail

---

#### TC-SEARCH-002: Tìm quán gần vị trí hiện tại

**Mô tả:** Tìm quán cà phê trong bán kính 2km từ vị trí hiện tại.

**Các bước:**
1. Đăng nhập
2. Click nút "Vị trí của tôi" (hoặc "My Location")
3. Cho phép trình duyệt truy cập vị trí

**Kết quả mong đợi:**
- ✅ Hiển thị marker vị trí hiện tại (màu xanh)
- ✅ Tự động tìm quán trong bán kính 2km
- ✅ Hiển thị khoảng cách từ vị trí hiện tại
- ✅ Bản đồ tự động zoom vào vị trí hiện tại

**Trạng thái:** ⬜ Chưa test / ✅ Pass / ❌ Fail

---

#### TC-SEARCH-003: Sắp xếp kết quả

**Mô tả:** Sắp xếp danh sách quán theo các tiêu chí.

**Các bước:**
1. Đăng nhập
2. Tìm kiếm hoặc lấy vị trí hiện tại
3. Click dropdown "Sắp xếp"
4. Chọn: "Theo khoảng cách", "Theo đánh giá", "Theo tên"

**Kết quả mong đợi:**
- ✅ Danh sách tự động sắp xếp theo tiêu chí đã chọn
- ✅ Thứ tự hiển thị đúng (tăng dần hoặc giảm dần)

**Trạng thái:** ⬜ Chưa test / ✅ Pass / ❌ Fail

---

#### TC-SEARCH-004: Bộ lọc kết quả

**Mô tả:** Lọc quán theo đánh giá và khoảng cách.

**Các bước:**
1. Đăng nhập
2. Tìm kiếm hoặc lấy vị trí hiện tại
3. Chọn filter: "Đánh giá >= 4.0"
4. Chọn filter: "Khoảng cách < 1km"

**Kết quả mong đợi:**
- ✅ Chỉ hiển thị quán có rating >= 4.0
- ✅ Chỉ hiển thị quán trong bán kính < 1km
- ✅ Click "Xóa bộ lọc" → Hiển thị tất cả quán

**Trạng thái:** ⬜ Chưa test / ✅ Pass / ❌ Fail

---

### 3. Yêu thích (Favorites)

#### TC-FAV-001: Thêm quán vào yêu thích

**Mô tả:** Thêm quán cà phê vào danh sách yêu thích.

**Các bước:**
1. Đăng nhập
2. Tìm một quán cà phê
3. Click icon ❤ trên quán đó

**Kết quả mong đợi:**
- ✅ Hiển thị thông báo "Thêm vào yêu thích thành công"
- ✅ Icon ❤ chuyển sang màu đỏ (filled)
- ✅ Quán xuất hiện trong trang "Yêu thích"

**Trạng thái:** ⬜ Chưa test / ✅ Pass / ❌ Fail

---

#### TC-FAV-002: Xem danh sách yêu thích

**Mô tả:** Xem tất cả quán đã thêm vào yêu thích.

**Các bước:**
1. Đăng nhập
2. Click "Yêu thích" trong header
3. Xem danh sách quán yêu thích

**Kết quả mong đợi:**
- ✅ Hiển thị tất cả quán đã yêu thích
- ✅ Hiển thị thông tin: tên, địa chỉ, rating, khoảng cách
- ✅ Empty state nếu chưa có quán nào

**Trạng thái:** ⬜ Chưa test / ✅ Pass / ❌ Fail

---

#### TC-FAV-003: Xóa quán khỏi yêu thích

**Mô tả:** Xóa quán khỏi danh sách yêu thích.

**Các bước:**
1. Đăng nhập
2. Vào trang "Yêu thích"
3. Click "Xóa yêu thích" trên một quán

**Kết quả mong đợi:**
- ✅ Hiển thị thông báo "Xóa khỏi yêu thích thành công"
- ✅ Quán biến mất khỏi danh sách
- ✅ Icon ❤ trên trang chủ chuyển về trạng thái unfilled

**Trạng thái:** ⬜ Chưa test / ✅ Pass / ❌ Fail

---

### 4. Đánh giá (Reviews)

#### TC-REV-001: Tạo đánh giá mới

**Mô tả:** Tạo đánh giá cho một quán cà phê.

**Các bước:**
1. Đăng nhập
2. Click vào một quán
3. Click "Đánh giá" hoặc "Reviews"
4. Chọn rating (1-5 sao)
5. Viết comment
6. Check "Công khai" (nếu muốn)
7. Click "Gửi đánh giá"

**Kết quả mong đợi:**
- ✅ Hiển thị thông báo "Đánh giá đã được lưu"
- ✅ Review xuất hiện trong danh sách reviews của quán
- ✅ Average rating tự động cập nhật

**Trạng thái:** ⬜ Chưa test / ✅ Pass / ❌ Fail

---

#### TC-REV-002: Xem đánh giá của quán

**Mô tả:** Xem tất cả đánh giá của một quán.

**Các bước:**
1. Đăng nhập
2. Click vào một quán
3. Click "Đánh giá" hoặc "Reviews"
4. Xem danh sách reviews

**Kết quả mong đợi:**
- ✅ Hiển thị average rating và số lượng reviews
- ✅ Hiển thị danh sách reviews với: username, rating, comment, ngày đăng
- ✅ Tag "子育て対応" cho reviews thân thiện với trẻ em
- ✅ Empty state nếu chưa có review nào

**Trạng thái:** ⬜ Chưa test / ✅ Pass / ❌ Fail

---

#### TC-REV-003: Xóa đánh giá

**Mô tả:** Xóa đánh giá của chính mình.

**Các bước:**
1. Đăng nhập
2. Vào trang Review của một quán đã đánh giá
3. Click "Xóa đánh giá"

**Kết quả mong đợi:**
- ✅ Hiển thị thông báo "Đánh giá đã được xóa"
- ✅ Review biến mất khỏi danh sách
- ✅ Average rating tự động cập nhật

**Trạng thái:** ⬜ Chưa test / ✅ Pass / ❌ Fail

---

### 5. Profile

#### TC-PROF-001: Xem thông tin profile

**Mô tả:** Xem thông tin profile của chính mình.

**Các bước:**
1. Đăng nhập
2. Click "Profile" trong header
3. Xem thông tin: username, email, avatar, join date

**Kết quả mong đợi:**
- ✅ Hiển thị đầy đủ thông tin user
- ✅ Hiển thị avatar (nếu có)
- ✅ Hiển thị danh sách reviews của mình

**Trạng thái:** ⬜ Chưa test / ✅ Pass / ❌ Fail

---

#### TC-PROF-002: Cập nhật profile

**Mô tả:** Cập nhật username và email.

**Các bước:**
1. Đăng nhập
2. Vào trang Profile
3. Click "Edit Profile"
4. Thay đổi username
5. Click "Lưu"

**Kết quả mong đợi:**
- ✅ Hiển thị thông báo "Cập nhật profile thành công"
- ✅ Username được cập nhật
- ✅ Header hiển thị username mới

**Trạng thái:** ⬜ Chưa test / ✅ Pass / ❌ Fail

---

#### TC-PROF-003: Upload avatar

**Mô tả:** Upload ảnh đại diện.

**Các bước:**
1. Đăng nhập
2. Vào trang Profile
3. Click "Edit Profile"
4. Click vào avatar
5. Chọn file ảnh từ máy tính
6. Click "Lưu"

**Kết quả mong đợi:**
- ✅ Hiển thị preview avatar mới
- ✅ Avatar được cập nhật
- ✅ Hiển thị avatar mới ở header

**Trạng thái:** ⬜ Chưa test / ✅ Pass / ❌ Fail

---

#### TC-PROF-004: Đổi mật khẩu

**Mô tả:** Đổi mật khẩu của tài khoản.

**Các bước:**
1. Đăng nhập
2. Vào trang Profile
3. Click "Đổi mật khẩu"
4. Nhập mật khẩu hiện tại
5. Nhập mật khẩu mới
6. Click "Đổi mật khẩu"

**Kết quả mong đợi:**
- ✅ Hiển thị thông báo "Đổi mật khẩu thành công"
- ✅ Có thể đăng nhập với mật khẩu mới
- ✅ Không thể đăng nhập với mật khẩu cũ

**Trạng thái:** ⬜ Chưa test / ✅ Pass / ❌ Fail

---

### 6. Khuyến mãi (Promotions)

#### TC-PROM-001: Xem danh sách promotions

**Mô tả:** Xem tất cả promotions đang active.

**Các bước:**
1. Đăng nhập
2. Click icon 🔔 (notification bell) trong header
3. Xem dropdown danh sách promotions

**Kết quả mong đợi:**
- ✅ Hiển thị danh sách promotions
- ✅ Hiển thị thông tin: title, cafe name, discount, thời gian còn lại
- ✅ Badge hiển thị số lượng promotions

**Trạng thái:** ⬜ Chưa test / ✅ Pass / ❌ Fail

---

#### TC-PROM-002: Click vào promotion

**Mô tả:** Click vào một promotion để xem chi tiết.

**Các bước:**
1. Đăng nhập
2. Click icon 🔔
3. Click vào một promotion trong dropdown

**Kết quả mong đợi:**
- ✅ Bản đồ tự động zoom vào quán có promotion
- ✅ Quán được highlight trên bản đồ
- ✅ Hiển thị thông tin promotion chi tiết

**Trạng thái:** ⬜ Chưa test / ✅ Pass / ❌ Fail

---

### 7. Admin Dashboard

#### TC-ADMIN-001: Truy cập Admin Dashboard

**Mô tả:** Admin truy cập Admin Dashboard.

**Các bước:**
1. Đăng nhập với tài khoản admin
2. Click nút "Admin" trong header

**Kết quả mong đợi:**
- ✅ Truy cập được Admin Dashboard
- ✅ Hiển thị 4 thẻ thống kê
- ✅ Hiển thị các tabs: Promotions, Reviews, Users

**Trạng thái:** ⬜ Chưa test / ✅ Pass / ❌ Fail

---

#### TC-ADMIN-002: User thường không thể truy cập Admin Dashboard

**Mô tả:** User thường không thể truy cập Admin Dashboard.

**Các bước:**
1. Đăng nhập với tài khoản user thường
2. Thử truy cập `/admin` trực tiếp

**Kết quả mong đợi:**
- ✅ Bị redirect về trang chủ
- ✅ Không hiển thị nút "Admin" trong header

**Trạng thái:** ⬜ Chưa test / ✅ Pass / ❌ Fail

---

#### TC-ADMIN-003: Tạo promotion mới

**Mô tả:** Admin tạo promotion mới.

**Các bước:**
1. Đăng nhập với tài khoản admin
2. Vào Admin Dashboard
3. Click tab "Promotions"
4. Click "Tạo Promotion"
5. Điền thông tin promotion
6. Click "Tạo"

**Kết quả mong đợi:**
- ✅ Hiển thị thông báo "Khuyến mãi đã được tạo"
- ✅ Promotion xuất hiện trong danh sách
- ✅ Promotion hiển thị trong dropdown notifications

**Trạng thái:** ⬜ Chưa test / ✅ Pass / ❌ Fail

---

#### TC-ADMIN-004: Xóa user

**Mô tả:** Admin xóa user.

**Các bước:**
1. Đăng nhập với tài khoản admin
2. Vào Admin Dashboard
3. Click tab "Users"
4. Click "Xóa" trên một user
5. Confirm dialog

**Kết quả mong đợi:**
- ✅ Hiển thị thông báo "User đã được xóa"
- ✅ User biến mất khỏi danh sách
- ✅ Không thể xóa chính mình

**Trạng thái:** ⬜ Chưa test / ✅ Pass / ❌ Fail

---

### 8. Đa ngôn ngữ (i18n)

#### TC-I18N-001: Chuyển đổi ngôn ngữ

**Mô tả:** Chuyển đổi giao diện sang ngôn ngữ khác.

**Các bước:**
1. Đăng nhập
2. Click nút ngôn ngữ trong header
3. Chọn: Tiếng Việt / English / 日本語

**Kết quả mong đợi:**
- ✅ Toàn bộ giao diện chuyển đổi ngôn ngữ
- ✅ Format date theo locale
- ✅ Ngôn ngữ được lưu và giữ nguyên khi reload

**Trạng thái:** ⬜ Chưa test / ✅ Pass / ❌ Fail

---

#### TC-I18N-002: Kiểm tra tất cả trang với các ngôn ngữ

**Mô tả:** Kiểm tra tất cả trang hiển thị đúng với các ngôn ngữ.

**Các bước:**
1. Đăng nhập
2. Chuyển đổi ngôn ngữ
3. Kiểm tra các trang:
   - Homepage
   - Profile
   - Favorites
   - Review
   - Admin Dashboard

**Kết quả mong đợi:**
- ✅ Tất cả text đều được dịch
- ✅ Không có text hardcode
- ✅ Format date đúng theo locale

**Trạng thái:** ⬜ Chưa test / ✅ Pass / ❌ Fail

---

## ✅ Checklist hoàn thành

### Trước khi bắt đầu UAT

- [ ] Backend đã chạy và hoạt động
- [ ] Frontend đã chạy và hoạt động
- [ ] Database đã có dữ liệu mẫu
- [ ] API keys đã được cấu hình
- [ ] Tài khoản admin đã được tạo
- [ ] Tài khoản user thường đã được tạo

### Sau khi hoàn thành UAT

- [ ] Tất cả test cases đã được thực hiện
- [ ] Tất cả bugs đã được ghi lại
- [ ] Báo cáo UAT đã được tạo
- [ ] Feedback đã được thu thập

---

## 🐛 Báo cáo lỗi

### Template báo cáo lỗi

**Test Case ID:** TC-XXX-XXX
**Mức độ:** Critical / High / Medium / Low
**Mô tả:** Mô tả ngắn gọn lỗi
**Các bước tái hiện:**
1. ...
2. ...
3. ...

**Kết quả thực tế:** ...
**Kết quả mong đợi:** ...
**Screenshot:** (nếu có)
**Trình duyệt:** Chrome / Firefox / Safari / Edge
**OS:** Windows / macOS / Linux

---

## 📊 Tổng kết UAT

### Thống kê

- **Tổng số test cases:** 25+
- **Đã test:** ___
- **Pass:** ___
- **Fail:** ___
- **Pass Rate:** ___%

### Kết luận

- [ ] Hệ thống đã sẵn sàng phát hành
- [ ] Cần sửa lỗi trước khi phát hành
- [ ] Cần cải thiện tính năng

---

**Last Updated:** 2024-12-24
**Version:** 1.0.0

