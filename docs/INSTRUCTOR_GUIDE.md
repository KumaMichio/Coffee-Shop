# 📖 Hướng dẫn sử dụng cho Giảng viên

Tài liệu này hướng dẫn giảng viên cách sử dụng hệ thống Coffee Shop Finder trong lớp học.

---

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Chuẩn bị](#-chuẩn-bị)
- [Tài khoản Admin](#-tài-khoản-admin)
- [Hướng dẫn sử dụng các tính năng](#-hướng-dẫn-sử-dụng-các-tính-năng)
- [Quản lý lớp học](#-quản-lý-lớp-học)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Tổng quan

Coffee Shop Finder là một ứng dụng web cho phép:
- Người dùng tìm kiếm và đánh giá quán cà phê
- Admin quản lý users, reviews, promotions

Hệ thống hỗ trợ 3 ngôn ngữ: Tiếng Việt, Tiếng Anh, Tiếng Nhật.

---

## 🔧 Chuẩn bị

### 1. Cài đặt hệ thống

Xem hướng dẫn chi tiết trong [README.md](../README.md)

### 2. Tạo tài khoản Admin

Sau khi setup database, tạo tài khoản admin bằng cách chạy SQL:

```sql
-- Tạo user admin (password: admin123)
INSERT INTO users (username, email, password_hash, role)
VALUES (
  'admin',
  'admin@example.com',
  '$2a$10$rK8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X',
  'admin'
);
```

**Lưu ý:** Hash trên là ví dụ. Để tạo password hash thực tế, có thể:
1. Đăng ký tài khoản thông thường
2. Cập nhật role thành 'admin' trong database:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your_email@example.com';
   ```

### 3. Chuẩn bị dữ liệu mẫu

Có thể chạy các script seed trong `backend/migrations/`:
- `seed_cafes.sql` - Thêm cafes mẫu
- `seed_promotions.sql` - Thêm promotions mẫu

---

## 👨‍💼 Tài khoản Admin

### Đăng nhập Admin Dashboard

1. Mở trình duyệt, truy cập: `http://localhost:3000`
2. Đăng nhập với tài khoản admin
3. Click vào nút "Admin" (chỉ hiển thị cho admin)
4. Hoặc truy cập trực tiếp: `http://localhost:3000/admin`

### Quyền Admin

Admin có thể:
- Xem thống kê tổng quan
- Quản lý users (xem danh sách, xóa user)
- Quản lý reviews (xem danh sách, xóa review)
- Quản lý promotions (tạo, cập nhật, xóa)
- Xem danh sách cafes

---

## 📚 Hướng dẫn sử dụng các tính năng

### 1. Quản lý Users

**Truy cập:** Admin Dashboard → Tab "Users"

**Chức năng:**
- Xem danh sách tất cả users
- Tìm kiếm users theo username hoặc email
- Xóa user (có confirm dialog)
- Pagination để xem nhiều users

**Lưu ý:**
- Không thể xóa chính mình
- Khi xóa user, tất cả favorites và reviews của user đó cũng bị xóa (CASCADE)

### 2. Quản lý Reviews

**Truy cập:** Admin Dashboard → Tab "Reviews"

**Chức năng:**
- Xem danh sách tất cả reviews
- Lọc reviews theo cafe
- Xóa review không phù hợp
- Pagination

### 3. Quản lý Promotions

**Truy cập:** Admin Dashboard → Tab "Promotions"

**Tạo Promotion mới:**
1. Click nút "Tạo Promotion"
2. Chọn cafe từ dropdown
3. Điền thông tin:
   - Title: Tiêu đề khuyến mãi
   - Description: Mô tả chi tiết
   - Discount Type: 
     - `percentage`: Giảm theo phần trăm (ví dụ: 20%)
     - `fixed_amount`: Giảm số tiền cố định (ví dụ: 50000 VNĐ)
     - `free_item`: Tặng món miễn phí
   - Discount Value: Giá trị giảm
   - Start Date: Ngày bắt đầu
   - End Date: Ngày kết thúc
   - Is Active: Có kích hoạt không
   - Target Radius: Bán kính hiển thị (mét)
4. Click "Tạo"

**Cập nhật Promotion:**
- Click nút "Sửa" trên promotion cần sửa
- Thay đổi thông tin
- Click "Cập nhật"

**Xóa Promotion:**
- Click nút "Xóa" (có confirm dialog)

### 4. Xem thống kê

**Truy cập:** Admin Dashboard → Trang chủ

Hiển thị 4 thẻ thống kê:
- Total Users: Tổng số người dùng
- Total Reviews: Tổng số đánh giá
- Active Promotions: Số khuyến mãi đang hoạt động
- Total Cafes: Tổng số quán cà phê

---

## 🎓 Quản lý lớp học

### Tạo tài khoản cho sinh viên

**Cách 1: Sinh viên tự đăng ký**
- Hướng dẫn sinh viên đăng ký tài khoản tại trang `/auth`
- Mỗi sinh viên tự tạo tài khoản với email của mình

**Cách 2: Tạo hàng loạt (nếu cần)**
- Có thể tạo script SQL để insert nhiều users cùng lúc
- Hoặc sử dụng API `POST /api/auth/register` để tạo programmatically

### Phân công bài tập

**Bài tập 1: Tìm kiếm và đánh giá quán**
1. Yêu cầu sinh viên tìm ít nhất 3 quán cà phê gần vị trí
2. Thêm 2 quán vào yêu thích
3. Viết đánh giá cho 1 quán

**Bài tập 2: Quản lý Profile**
1. Cập nhật username
2. Upload avatar
3. Đổi mật khẩu

**Bài tập 3: Sử dụng Admin Dashboard (cho admin)**
1. Xem thống kê
2. Tạo 1 promotion mới
3. Xem danh sách reviews

### Kiểm tra kết quả

**Xem reviews của sinh viên:**
- Admin Dashboard → Reviews → Lọc theo user hoặc cafe

**Xem favorites của sinh viên:**
- Có thể query database trực tiếp:
  ```sql
  SELECT u.username, c.name as cafe_name
  FROM favorites f
  JOIN users u ON f.user_id = u.id
  JOIN cafes c ON f.cafe_id = c.id
  ORDER BY u.username;
  ```

---

## 🐛 Troubleshooting

### Sinh viên không thể đăng nhập

**Kiểm tra:**
1. Backend đã chạy chưa? (`http://localhost:5000`)
2. Database connection có lỗi không?
3. Email/password có đúng không?

**Giải pháp:**
- Reset password: Có thể update trực tiếp trong database (nhưng cần hash password)
- Hoặc hướng dẫn sinh viên dùng chức năng "Quên mật khẩu" (nếu có)

### Bản đồ không hiển thị

**Nguyên nhân:**
- Goong Access Token không hợp lệ hoặc hết hạn
- API key bị giới hạn quota

**Giải pháp:**
- Kiểm tra token trong `.env` của frontend
- Kiểm tra quota trên Goong dashboard

### Không tìm thấy quán cà phê

**Nguyên nhân:**
- Vị trí hiện tại không có quán gần
- API key Google Places hoặc Goong bị lỗi

**Giải pháp:**
- Thử tìm kiếm với từ khóa cụ thể (ví dụ: "starbucks")
- Kiểm tra API keys trong `.env` của backend

### Admin Dashboard không truy cập được

**Kiểm tra:**
1. User có role = 'admin' không?
   ```sql
   SELECT id, username, email, role FROM users WHERE email = 'your_email@example.com';
   ```
2. JWT token có hợp lệ không?
3. Backend có chạy không?

**Giải pháp:**
- Cập nhật role thành 'admin':
  ```sql
  UPDATE users SET role = 'admin' WHERE email = 'your_email@example.com';
  ```
- Đăng xuất và đăng nhập lại

---

## 📝 Ghi chú cho Giảng viên

### Best Practices

1. **Trước khi bắt đầu lớp:**
   - Test tất cả tính năng chính
   - Chuẩn bị dữ liệu mẫu (cafes, promotions)
   - Tạo tài khoản admin và test admin dashboard

2. **Trong lớp học:**
   - Hướng dẫn sinh viên đăng ký tài khoản
   - Demo các tính năng chính
   - Giải đáp thắc mắc

3. **Sau lớp học:**
   - Kiểm tra kết quả bài tập của sinh viên
   - Thu thập feedback
   - Báo cáo bugs nếu có

### Demo Script

Xem kịch bản demo chi tiết tại: [DEMO_SCRIPT.md](DEMO_SCRIPT.md)

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra [README.md](../README.md) và [Troubleshooting](#-troubleshooting)
2. Xem logs của backend và frontend
3. Liên hệ nhóm phát triển

---

**Last Updated:** 2024-12-24
**Version:** 1.0.0

