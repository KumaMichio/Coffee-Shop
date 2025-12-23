# Tài khoản Admin Mặc định

## Thông tin đăng nhập

- **Email**: `admin@admin.com`
- **Password**: `admin123`
- **Username**: `admin`
- **Role**: `admin`

## Cài đặt

### 1. Chạy migration để thêm cột role và tạo user admin

```bash
# Kết nối vào PostgreSQL
psql -U your_username -d coffee_app

# Chạy migration
\i backend/migrations/add_admin_role.sql
```

Hoặc nếu tạo lại database từ đầu:

```bash
psql -U your_username -f database.sql
```

File `database.sql` đã bao gồm:
- Cột `role` trong bảng `users`
- User admin mặc định với email `admin@admin.com` và password `admin123`

### 2. Kiểm tra user admin đã được tạo

```sql
SELECT id, username, email, role FROM users WHERE email = 'admin@admin.com';
```

## Tính năng

### Tự động redirect

Khi đăng nhập bằng tài khoản admin:
- Tự động redirect đến `/admin` thay vì `/`
- User thường vẫn redirect đến `/` như bình thường

### Phân quyền

- Admin có thể truy cập trang `/admin`
- Admin có thể tạo, xóa promotions
- Admin có thể xem và xóa tất cả reviews
- Admin có thể quản lý users (xem, xóa)

## Thay đổi mật khẩu admin

Nếu muốn thay đổi mật khẩu admin, có thể:

1. **Qua Profile page** (nếu đã đăng nhập):
   - Vào Profile → Change Password

2. **Qua SQL**:
   ```sql
   -- Generate new password hash (ví dụ: newpassword123)
   -- Chạy trong Node.js:
   -- const bcrypt = require('bcryptjs');
   -- bcrypt.hash('newpassword123', 10).then(hash => console.log(hash));
   
   UPDATE users 
   SET password_hash = '$2a$10$...' -- Thay bằng hash mới
   WHERE email = 'admin@admin.com';
   ```

## Bảo mật

⚠️ **Lưu ý quan trọng**:
- Đổi mật khẩu admin ngay sau khi deploy production
- Không commit file `.env` chứa JWT_SECRET
- Sử dụng mật khẩu mạnh cho tài khoản admin

