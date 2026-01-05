# 🎬 Kịch bản Demo - Coffee Shop Finder

Kịch bản này hướng dẫn cách demo hệ thống Coffee Shop Finder trong lớp học.

**Thời gian:** 15-20 phút
**Đối tượng:** Sinh viên/Giảng viên

---

## 📋 Chuẩn bị

### Trước khi demo

1. ✅ Đảm bảo backend và frontend đã chạy
2. ✅ Đăng nhập với tài khoản admin
3. ✅ Chuẩn bị dữ liệu mẫu (cafes, promotions)
4. ✅ Mở trình duyệt ở chế độ fullscreen
5. ✅ Chuẩn bị slide giới thiệu (nếu có)

### Dữ liệu mẫu cần có

- Ít nhất 5-10 quán cà phê trong database
- 2-3 promotions đang active
- 1-2 reviews mẫu

---

## 🎯 Kịch bản Demo

### Phần 1: Giới thiệu (2 phút)

**Nội dung:**
- Giới thiệu ứng dụng: "Coffee Shop Finder - Ứng dụng tìm kiếm và đánh giá quán cà phê"
- Các tính năng chính:
  - Tìm kiếm quán cà phê
  - Xem bản đồ
  - Đánh giá và yêu thích
  - Xem khuyến mãi
  - Quản lý profile

**Slide (nếu có):**
- Logo ứng dụng
- Screenshot trang chủ
- Danh sách tính năng

---

### Phần 2: Demo tính năng người dùng (10 phút)

#### 2.1. Đăng nhập/Đăng ký (1 phút)

**Thao tác:**
1. Mở trang `/auth`
2. **Nếu chưa có tài khoản:**
   - Click tab "Đăng ký"
   - Điền thông tin: username, email, password
   - Click "Đăng ký"
   - Hiển thị: "Đăng ký thành công" → Tự động chuyển về trang chủ

3. **Nếu đã có tài khoản:**
   - Click tab "Đăng nhập"
   - Điền email và password
   - Click "Đăng nhập"
   - Tự động chuyển về trang chủ

**Điểm nhấn:**
- Form validation (email format, password length)
- Thông báo lỗi rõ ràng
- Tự động redirect sau khi đăng nhập thành công

---

#### 2.2. Trang chủ - Tìm kiếm quán (2 phút)

**Thao tác:**
1. Trang chủ hiển thị:
   - Bản đồ bên trái
   - Danh sách quán bên phải
   - Header với search bar

2. **Tìm kiếm theo từ khóa:**
   - Gõ "starbucks" vào search bar
   - Nhấn Enter hoặc click nút search
   - Hiển thị kết quả trên bản đồ và danh sách
   - Click vào một quán → Bản đồ zoom vào quán đó

3. **Tìm quán gần vị trí:**
   - Click nút "Vị trí của tôi" (hoặc "My Location")
   - Cho phép trình duyệt truy cập vị trí
   - Hiển thị marker vị trí hiện tại (màu xanh)
   - Tự động tìm quán trong bán kính 2km
   - Hiển thị khoảng cách từ vị trí hiện tại

**Điểm nhấn:**
- Bản đồ tương tác mượt mà
- Markers hiển thị rõ ràng
- Khoảng cách được tính chính xác
- Infinite scroll cho danh sách quán

---

#### 2.3. Bộ lọc và sắp xếp (1 phút)

**Thao tác:**
1. **Sắp xếp:**
   - Click dropdown "Sắp xếp"
   - Chọn: "Theo khoảng cách", "Theo đánh giá", "Theo tên"
   - Danh sách tự động cập nhật

2. **Bộ lọc:**
   - Filter theo đánh giá: >= 4.0, >= 3.5, etc.
   - Filter theo khoảng cách: < 500m, < 1km, < 2km, < 5km
   - Click "Xóa bộ lọc" để reset

**Điểm nhấn:**
- Filters hoạt động ngay lập tức
- Có thể kết hợp nhiều filters
- UI rõ ràng, dễ sử dụng

---

#### 2.4. Yêu thích (1 phút)

**Thao tác:**
1. Click icon ❤ trên một quán trong danh sách
2. Hiển thị: "Thêm vào yêu thích thành công"
3. Icon ❤ chuyển sang màu đỏ (filled)
4. Click vào "Yêu thích" trong header
5. Xem danh sách quán yêu thích
6. Click "Xóa yêu thích" để xóa

**Điểm nhấn:**
- Thông báo thành công/lỗi rõ ràng
- UI cập nhật ngay lập tức
- Danh sách yêu thích dễ quản lý

---

#### 2.5. Đánh giá quán (2 phút)

**Thao tác:**
1. Click vào một quán trong danh sách
2. Click nút "Đánh giá" hoặc "Reviews"
3. Trang Review hiển thị:
   - Form đánh giá (nếu chưa có)
   - Danh sách reviews của quán (nếu có)

4. **Tạo đánh giá:**
   - Chọn rating (1-5 sao)
   - Viết comment
   - Check "Công khai" (nếu muốn)
   - Check "Thân thiện với trẻ em" (nếu có)
   - Click "Gửi đánh giá"
   - Hiển thị: "Đánh giá đã được lưu"

5. **Xem reviews:**
   - Xem average rating và số lượng reviews
   - Xem các reviews công khai của users khác
   - Có thể xóa review của mình

**Điểm nhấn:**
- Form validation
- Average rating tự động cập nhật
- Reviews hiển thị đẹp với stars và tags

---

#### 2.6. Khuyến mãi (1 phút)

**Thao tác:**
1. Click icon 🔔 (notification bell) trong header
2. Dropdown hiển thị danh sách promotions
3. Click vào một promotion
4. Bản đồ tự động zoom vào quán có promotion
5. Hiển thị thông tin promotion:
   - Title, description
   - Discount type và value
   - Thời gian còn lại

**Điểm nhấn:**
- Notification badge hiển thị số lượng promotions
- Dropdown đẹp, dễ sử dụng
- Tự động navigate đến quán

---

#### 2.7. Profile (1 phút)

**Thao tác:**
1. Click "Profile" trong header
2. Xem thông tin:
   - Username, email
   - Avatar
   - Join date
   - Danh sách reviews của mình

3. **Cập nhật profile:**
   - Click "Edit Profile"
   - Thay đổi username
   - Upload avatar (chọn file từ máy)
   - Click "Lưu"

4. **Đổi mật khẩu:**
   - Click "Đổi mật khẩu"
   - Nhập mật khẩu hiện tại và mật khẩu mới
   - Click "Đổi mật khẩu"

**Điểm nhấn:**
- Form validation
- Avatar preview
- Password security

---

#### 2.8. Chỉ đường (1 phút)

**Thao tác:**
1. Click nút "Chỉ đường" trên một quán
2. Modal hiển thị các options:
   - Google Maps
   - Apple Maps
   - Waze
   - Goong Maps
3. Click vào một option
4. Mở ứng dụng bản đồ tương ứng với route đã được tính toán

**Điểm nhấn:**
- Hỗ trợ nhiều ứng dụng bản đồ
- Tự động lấy vị trí hiện tại làm điểm xuất phát

---

### Phần 3: Demo Admin Dashboard (5 phút)

#### 3.1. Truy cập Admin Dashboard (30 giây)

**Thao tác:**
1. Đăng nhập với tài khoản admin
2. Click nút "Admin" trong header
3. Hoặc truy cập trực tiếp: `/admin`

**Lưu ý:** Nếu không phải admin, sẽ bị redirect về trang chủ.

---

#### 3.2. Xem thống kê (1 phút)

**Thao tác:**
1. Trang Admin Dashboard hiển thị 4 thẻ thống kê:
   - Total Users
   - Total Reviews
   - Active Promotions
   - Total Cafes

2. Giải thích các số liệu:
   - Tổng số người dùng đã đăng ký
   - Tổng số đánh giá đã được tạo
   - Số khuyến mãi đang hoạt động
   - Tổng số quán trong database

---

#### 3.3. Quản lý Users (1 phút)

**Thao tác:**
1. Click tab "Users"
2. Xem danh sách users:
   - Username, email
   - Avatar
   - Ngày tạo

3. **Tìm kiếm:**
   - Gõ username hoặc email vào search box
   - Kết quả tự động filter

4. **Xóa user:**
   - Click nút "Xóa" trên một user
   - Confirm dialog
   - User bị xóa (cùng với favorites và reviews)

---

#### 3.4. Quản lý Reviews (1 phút)

**Thao tác:**
1. Click tab "Reviews"
2. Xem danh sách reviews:
   - Username, cafe name
   - Rating, comment
   - Ngày tạo

3. **Lọc theo cafe:**
   - Chọn cafe từ dropdown
   - Chỉ hiển thị reviews của cafe đó

4. **Xóa review:**
   - Click nút "Xóa"
   - Confirm dialog
   - Review bị xóa

---

#### 3.5. Quản lý Promotions (1.5 phút)

**Thao tác:**
1. Click tab "Promotions"
2. Xem danh sách promotions:
   - Title, cafe name
   - Discount type và value
   - Thời gian (start - end)
   - Trạng thái (active/inactive)

3. **Tạo promotion mới:**
   - Click "Tạo Promotion"
   - Chọn cafe từ dropdown
   - Điền thông tin:
     - Title: "Giảm 20%"
     - Description: "Giảm 20% cho tất cả đồ uống"
     - Discount Type: "percentage"
     - Discount Value: 20
     - Start Date: Hôm nay
     - End Date: 30 ngày sau
     - Is Active: true
   - Click "Tạo"
   - Hiển thị: "Khuyến mãi đã được tạo"

4. **Cập nhật promotion:**
   - Click "Sửa" trên một promotion
   - Thay đổi thông tin
   - Click "Cập nhật"

5. **Xóa promotion:**
   - Click "Xóa"
   - Confirm dialog
   - Promotion bị xóa

---

### Phần 4: Đa ngôn ngữ (1 phút)

**Thao tác:**
1. Click nút ngôn ngữ trong header (hiển thị flag)
2. Chọn ngôn ngữ:
   - 🇻🇳 Tiếng Việt
   - 🇬🇧 English
   - 🇯🇵 日本語
3. Toàn bộ giao diện tự động chuyển đổi ngôn ngữ
4. Demo các trang:
   - Homepage
   - Profile
   - Admin Dashboard

**Điểm nhấn:**
- Chuyển đổi ngôn ngữ mượt mà
- Tất cả text đều được dịch
- Format date theo locale

---

### Phần 5: Tổng kết và Q&A (2 phút)

**Nội dung:**
- Tóm tắt các tính năng đã demo
- Nhấn mạnh các điểm nổi bật:
  - Tìm kiếm thông minh
  - Bản đồ tương tác
  - Đánh giá và yêu thích
  - Quản lý admin
  - Đa ngôn ngữ

**Q&A:**
- Trả lời câu hỏi của sinh viên
- Giải thích thêm về các tính năng

---

## 💡 Tips cho người demo

1. **Chuẩn bị trước:**
   - Test tất cả tính năng trước khi demo
   - Chuẩn bị dữ liệu mẫu phong phú
   - Kiểm tra internet connection (cho maps API)

2. **Trong khi demo:**
   - Nói rõ ràng, chậm rãi
   - Giải thích từng bước
   - Highlight các điểm nổi bật
   - Xử lý lỗi một cách tự nhiên (nếu có)

3. **Sau khi demo:**
   - Cho sinh viên thời gian thử nghiệm
   - Thu thập feedback
   - Ghi chú các bugs hoặc cải tiến

---

## 🎯 Kết luận

Kịch bản demo này giúp giới thiệu đầy đủ các tính năng của hệ thống trong 15-20 phút. Tùy vào thời gian và đối tượng, có thể điều chỉnh thời gian cho từng phần.

---

**Last Updated:** 2024-12-24
**Version:** 1.0.0

