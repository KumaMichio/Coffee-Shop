# 📚 Đặc tả API - Coffee Shop Finder

Tài liệu này mô tả chi tiết tất cả các API endpoints của hệ thống Coffee Shop Finder.

**Base URL:** `http://localhost:5000/api` (Development)

---

## 🔐 1. Authentication APIs

### 1.1. Đăng ký tài khoản

**Endpoint:** `POST /api/auth/register`

**Authentication:** Không cần

**Request Body:**
```json
{
  "username": "string (3-50 ký tự)",
  "email": "string (email format)",
  "password": "string (tối thiểu 6 ký tự)"
}
```

**Response Success (201):**
```json
{
  "message": "Đăng ký thành công",
  "token": "JWT_TOKEN",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Response Error (400):**
```json
{
  "error": "Email đã được sử dụng"
}
```

**Validation Rules:**
- `username`: 3-50 ký tự, không được trùng
- `email`: Định dạng email hợp lệ, không được trùng
- `password`: Tối thiểu 6 ký tự

---

### 1.2. Đăng nhập

**Endpoint:** `POST /api/auth/login`

**Authentication:** Không cần

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response Success (200):**
```json
{
  "message": "Đăng nhập thành công",
  "token": "JWT_TOKEN",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Response Error (401):**
```json
{
  "error": "Email hoặc mật khẩu không đúng"
}
```

---

### 1.3. Lấy thông tin user hiện tại

**Endpoint:** `GET /api/auth/me`

**Authentication:** Required (Bearer Token)

**Headers:**
```
Authorization: Bearer JWT_TOKEN
```

**Response Success (200):**
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user",
    "avatar_url": "https://example.com/avatar.jpg"
  }
}
```

**Response Error (401):**
```json
{
  "error": "Unauthorized"
}
```

---

## ☕ 2. Cafe APIs

### 2.1. Tìm quán gần vị trí

**Endpoint:** `GET /api/cafes/nearby`

**Authentication:** Không cần

**Query Parameters:**
- `lat` (required): Vĩ độ (float)
- `lng` (required): Kinh độ (float)
- `radius` (optional): Bán kính tìm kiếm (mét), mặc định: 2000m
- `sort` (optional): Sắp xếp (`distance`, `rating`, `name`), mặc định: `distance`

**Example:**
```
GET /api/cafes/nearby?lat=21.028511&lng=105.804817&radius=2000&sort=rating
```

**Response Success (200):**
```json
[
  {
    "id": 1,
    "provider": "goong",
    "provider_place_id": "abc123",
    "name": "Cafe ABC",
    "address": "123 Đường ABC, Hà Nội",
    "lat": 21.028511,
    "lng": 105.804817,
    "rating": 4.5,
    "user_rating": 4.7,
    "review_count": 15,
    "distance": 500
  }
]
```

---

### 2.2. Tìm kiếm quán

**Endpoint:** `GET /api/cafes/search`

**Authentication:** Không cần

**Query Parameters:**
- `query` (required): Từ khóa tìm kiếm
- `lat` (optional): Vĩ độ để tính khoảng cách
- `lng` (optional): Kinh độ để tính khoảng cách
- `sort` (optional): Sắp xếp (`rating`, `distance`, `name`), mặc định: `rating`

**Example:**
```
GET /api/cafes/search?query=starbucks&lat=21.028511&lng=105.804817&sort=rating
```

**Response Success (200):**
```json
[
  {
    "id": 1,
    "provider": "google",
    "provider_place_id": "ChIJ...",
    "name": "Starbucks Coffee",
    "address": "123 Đường XYZ, Hà Nội",
    "lat": 21.030000,
    "lng": 105.810000,
    "rating": 4.3,
    "user_rating": 4.5,
    "review_count": 20,
    "distance": 1200
  }
]
```

---

### 2.3. Lấy tất cả cafes từ database

**Endpoint:** `GET /api/cafes`

**Authentication:** Không cần

**Response Success (200):**
```json
[
  {
    "id": 1,
    "provider": "goong",
    "provider_place_id": "abc123",
    "name": "Cafe ABC",
    "address": "123 Đường ABC, Hà Nội",
    "lat": 21.028511,
    "lng": 105.804817,
    "rating": 4.5,
    "user_rating": 4.7,
    "review_count": 15
  }
]
```

---

## ❤️ 3. Favorites APIs

### 3.1. Lấy danh sách quán yêu thích

**Endpoint:** `GET /api/favorites`

**Authentication:** Required (Bearer Token)

**Response Success (200):**
```json
{
  "message": "Lấy danh sách yêu thích thành công",
  "favorites": [
    {
      "id": 1,
      "cafe_id": 5,
      "cafe": {
        "id": 5,
        "name": "Cafe XYZ",
        "address": "456 Đường XYZ",
        "lat": 21.030000,
        "lng": 105.810000,
        "rating": 4.5,
        "user_rating": 4.6,
        "review_count": 10
      },
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### 3.2. Thêm quán vào yêu thích

**Endpoint:** `POST /api/favorites`

**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "provider": "goong",
  "provider_place_id": "abc123",
  "name": "Cafe ABC",
  "address": "123 Đường ABC",
  "lat": 21.028511,
  "lng": 105.804817,
  "rating": 4.5,
  "user_rating_count": 100
}
```

**Response Success (201):**
```json
{
  "message": "Thêm vào yêu thích thành công",
  "cafeId": 1,
  "favoriteId": 1
}
```

**Response Error (400):**
```json
{
  "error": "Quán đã có trong danh sách yêu thích"
}
```

---

### 3.3. Xóa quán khỏi yêu thích

**Endpoint:** `DELETE /api/favorites/:cafeId`

**Authentication:** Required (Bearer Token)

**Path Parameters:**
- `cafeId`: ID của quán (integer)

**Response Success (200):**
```json
{
  "message": "Xóa khỏi yêu thích thành công"
}
```

**Response Error (404):**
```json
{
  "error": "Không tìm thấy trong danh sách yêu thích"
}
```

---

### 3.4. Kiểm tra quán đã yêu thích chưa

**Endpoint:** `GET /api/favorites/check/:cafeId`

**Authentication:** Required (Bearer Token)

**Path Parameters:**
- `cafeId`: ID của quán (integer)

**Response Success (200):**
```json
{
  "isFavorite": true
}
```

---

## ⭐ 4. Reviews APIs

### 4.1. Tạo/cập nhật đánh giá

**Endpoint:** `POST /api/reviews`

**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "cafe_id": 1,
  "cafe_data": {
    "provider": "goong",
    "provider_place_id": "abc123",
    "name": "Cafe ABC",
    "address": "123 Đường ABC",
    "lat": 21.028511,
    "lng": 105.804817
  },
  "rating": 5,
  "comment": "Quán rất tốt!",
  "is_public": true,
  "is_child_friendly": false
}
```

**Note:** Nếu `cafe_id` là số, không cần `cafe_data`. Nếu `cafe_id` là string (provider_place_id), cần `cafe_data`.

**Response Success (201):**
```json
{
  "message": "Đánh giá đã được lưu",
  "review": {
    "id": 1,
    "user_id": 1,
    "cafe_id": 1,
    "rating": 5,
    "comment": "Quán rất tốt!",
    "is_public": true,
    "is_child_friendly": false,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Validation Rules:**
- `cafe_id`: Bắt buộc
- `rating`: 1-5 (integer)
- `comment`: Tùy chọn, string
- `is_public`: Boolean, mặc định: true
- `is_child_friendly`: Boolean, mặc định: false

---

### 4.2. Lấy đánh giá của một quán

**Endpoint:** `GET /api/reviews/cafe/:cafeId`

**Authentication:** Required (Bearer Token)

**Path Parameters:**
- `cafeId`: ID của quán (integer hoặc `provider_provider_place_id`)

**Response Success (200):**
```json
{
  "reviews": [
    {
      "id": 1,
      "user_id": 1,
      "username": "john_doe",
      "rating": 5,
      "comment": "Quán rất tốt!",
      "is_public": true,
      "is_child_friendly": false,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "average_rating": 4.7,
  "review_count": 15
}
```

---

### 4.3. Lấy đánh giá của user hiện tại cho một quán

**Endpoint:** `GET /api/reviews/my/:cafeId`

**Authentication:** Required (Bearer Token)

**Path Parameters:**
- `cafeId`: ID của quán (integer hoặc `provider_provider_place_id`)

**Response Success (200):**
```json
{
  "review": {
    "id": 1,
    "user_id": 1,
    "cafe_id": 1,
    "rating": 5,
    "comment": "Quán rất tốt!",
    "is_public": true,
    "is_child_friendly": false,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Response khi chưa có review:**
```json
{
  "review": null
}
```

---

### 4.4. Xóa đánh giá

**Endpoint:** `DELETE /api/reviews/:cafeId`

**Authentication:** Required (Bearer Token)

**Path Parameters:**
- `cafeId`: ID của quán (integer)

**Response Success (200):**
```json
{
  "message": "Đánh giá đã được xóa"
}
```

**Response Error (404):**
```json
{
  "error": "Không tìm thấy đánh giá"
}
```

---

## 👤 5. Profile APIs

### 5.1. Lấy thông tin profile

**Endpoint:** `GET /api/profile`

**Authentication:** Required (Bearer Token)

**Query Parameters:**
- `page` (optional): Trang (mặc định: 1)
- `limit` (optional): Số items mỗi trang (mặc định: 10)

**Response Success (200):**
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "avatar_url": "https://example.com/avatar.jpg",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "reviews": [
    {
      "id": 1,
      "cafe_id": 1,
      "cafe_name": "Cafe ABC",
      "rating": 5,
      "comment": "Quán rất tốt!",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total_reviews": 10,
  "page": 1,
  "limit": 10
}
```

---

### 5.2. Cập nhật profile

**Endpoint:** `PUT /api/profile`

**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "username": "john_doe_new",
  "email": "john_new@example.com",
  "avatar_url": "https://example.com/new_avatar.jpg"
}
```

**Response Success (200):**
```json
{
  "message": "Cập nhật profile thành công",
  "user": {
    "id": 1,
    "username": "john_doe_new",
    "email": "john_new@example.com",
    "avatar_url": "https://example.com/new_avatar.jpg"
  }
}
```

**Validation Rules:**
- `username`: 3-50 ký tự, không được trùng
- `email`: Định dạng email hợp lệ, không được trùng
- `avatar_url`: URL hợp lệ hoặc base64 image

---

### 5.3. Upload avatar

**Endpoint:** `POST /api/profile/avatar`

**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "avatar_url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

hoặc

```json
{
  "avatar_url": "https://example.com/avatar.jpg"
}
```

**Response Success (200):**
```json
{
  "message": "Cập nhật avatar thành công",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "avatar_url": "data:image/png;base64,..."
  }
}
```

**Validation Rules:**
- Base64: Tối đa 10MB
- URL: Tối đa 2000 ký tự

---

### 5.4. Đổi mật khẩu

**Endpoint:** `PUT /api/profile/password`

**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "current_password": "old_password",
  "new_password": "new_password123"
}
```

**Response Success (200):**
```json
{
  "message": "Đổi mật khẩu thành công"
}
```

**Response Error (401):**
```json
{
  "error": "Mật khẩu hiện tại không đúng"
}
```

**Validation Rules:**
- `new_password`: Tối thiểu 6 ký tự

---

## 🎁 6. Promotions APIs

### 6.1. Lấy tất cả active promotions

**Endpoint:** `GET /api/promotions/all`

**Authentication:** Không cần

**Response Success (200):**
```json
{
  "promotions": [
    {
      "id": 1,
      "cafe_id": 1,
      "cafe_name": "Cafe ABC",
      "cafe_address": "123 Đường ABC",
      "cafe_lat": 21.028511,
      "cafe_lng": 105.804817,
      "title": "Giảm 20%",
      "description": "Giảm 20% cho tất cả đồ uống",
      "discount_type": "percentage",
      "discount_value": 20,
      "start_date": "2024-01-01T00:00:00Z",
      "end_date": "2024-12-31T23:59:59Z",
      "is_active": true
    }
  ]
}
```

---

### 6.2. Lấy promotions gần vị trí

**Endpoint:** `GET /api/promotions/nearby`

**Authentication:** Không cần

**Query Parameters:**
- `lat` (required): Vĩ độ (float)
- `lng` (required): Kinh độ (float)
- `radius` (optional): Bán kính (mét), mặc định: 5000m

**Response Success (200):**
```json
{
  "promotions": [
    {
      "id": 1,
      "cafe_id": 1,
      "cafe_name": "Cafe ABC",
      "title": "Giảm 20%",
      "discount_type": "percentage",
      "discount_value": 20,
      "distance": 500
    }
  ]
}
```

---

### 6.3. Lấy promotions của một quán

**Endpoint:** `GET /api/promotions/cafe/:cafeId`

**Authentication:** Không cần

**Path Parameters:**
- `cafeId`: ID của quán (integer)

**Response Success (200):**
```json
{
  "promotions": [
    {
      "id": 1,
      "title": "Giảm 20%",
      "description": "Giảm 20% cho tất cả đồ uống",
      "discount_type": "percentage",
      "discount_value": 20,
      "start_date": "2024-01-01T00:00:00Z",
      "end_date": "2024-12-31T23:59:59Z"
    }
  ]
}
```

---

### 6.4. Tạo promotion (Admin)

**Endpoint:** `POST /api/promotions`

**Authentication:** Required (Bearer Token - Admin)

**Request Body:**
```json
{
  "cafe_id": 1,
  "title": "Giảm 20%",
  "description": "Giảm 20% cho tất cả đồ uống",
  "discount_type": "percentage",
  "discount_value": 20,
  "start_date": "2024-01-01T00:00:00Z",
  "end_date": "2024-12-31T23:59:59Z",
  "is_active": true,
  "target_radius": 5000
}
```

**Discount Types:**
- `percentage`: Giảm theo phần trăm
- `fixed_amount`: Giảm số tiền cố định
- `free_item`: Tặng món miễn phí

**Response Success (201):**
```json
{
  "message": "Khuyến mãi đã được tạo",
  "promotion": {
    "id": 1,
    "cafe_id": 1,
    "title": "Giảm 20%",
    "discount_type": "percentage",
    "discount_value": 20,
    "start_date": "2024-01-01T00:00:00Z",
    "end_date": "2024-12-31T23:59:59Z"
  }
}
```

---

### 6.5. Cập nhật promotion (Admin)

**Endpoint:** `PUT /api/promotions/:id`

**Authentication:** Required (Bearer Token - Admin)

**Path Parameters:**
- `id`: ID của promotion (integer)

**Request Body:** (Tương tự như tạo, nhưng tất cả fields đều optional)

**Response Success (200):**
```json
{
  "message": "Khuyến mãi đã được cập nhật",
  "promotion": { ... }
}
```

---

### 6.6. Xóa promotion (Admin)

**Endpoint:** `DELETE /api/promotions/:id`

**Authentication:** Required (Bearer Token - Admin)

**Path Parameters:**
- `id`: ID của promotion (integer)

**Response Success (200):**
```json
{
  "message": "Khuyến mãi đã được xóa"
}
```

---

## 👨‍💼 7. Admin APIs

**Lưu ý:** Tất cả Admin APIs đều yêu cầu authentication và quyền admin.

### 7.1. Lấy thống kê tổng quan

**Endpoint:** `GET /api/admin/stats`

**Authentication:** Required (Bearer Token - Admin)

**Response Success (200):**
```json
{
  "total_users": 100,
  "total_reviews": 500,
  "active_promotions": 10,
  "total_cafes": 200
}
```

---

### 7.2. Lấy danh sách users

**Endpoint:** `GET /api/admin/users`

**Authentication:** Required (Bearer Token - Admin)

**Query Parameters:**
- `page` (optional): Trang (mặc định: 1)
- `limit` (optional): Số items mỗi trang (mặc định: 20)
- `search` (optional): Tìm kiếm theo username hoặc email

**Response Success (200):**
```json
{
  "users": [
    {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "avatar_url": "https://example.com/avatar.jpg",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

---

### 7.3. Xóa user

**Endpoint:** `DELETE /api/admin/users/:id`

**Authentication:** Required (Bearer Token - Admin)

**Path Parameters:**
- `id`: ID của user (integer)

**Response Success (200):**
```json
{
  "message": "User đã được xóa",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**Lưu ý:** Không thể xóa chính mình.

---

### 7.4. Lấy danh sách reviews

**Endpoint:** `GET /api/admin/reviews`

**Authentication:** Required (Bearer Token - Admin)

**Query Parameters:**
- `page` (optional): Trang (mặc định: 1)
- `limit` (optional): Số items mỗi trang (mặc định: 20)
- `cafe_id` (optional): Lọc theo cafe_id

**Response Success (200):**
```json
{
  "reviews": [
    {
      "id": 1,
      "user_id": 1,
      "username": "john_doe",
      "cafe_id": 1,
      "cafe_name": "Cafe ABC",
      "rating": 5,
      "comment": "Quán rất tốt!",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 500,
  "page": 1,
  "limit": 20
}
```

---

### 7.5. Xóa review

**Endpoint:** `DELETE /api/admin/reviews/:id`

**Authentication:** Required (Bearer Token - Admin)

**Path Parameters:**
- `id`: ID của review (integer)

**Response Success (200):**
```json
{
  "message": "Review đã được xóa"
}
```

---

### 7.6. Lấy danh sách cafes

**Endpoint:** `GET /api/admin/cafes`

**Authentication:** Required (Bearer Token - Admin)

**Query Parameters:**
- `search` (optional): Tìm kiếm theo tên hoặc địa chỉ
- `limit` (optional): Số items (mặc định: 50)

**Response Success (200):**
```json
{
  "cafes": [
    {
      "id": 1,
      "name": "Cafe ABC",
      "address": "123 Đường ABC",
      "lat": 21.028511,
      "lng": 105.804817,
      "provider": "goong",
      "provider_place_id": "abc123"
    }
  ]
}
```

---

## 🗺️ 8. Map APIs

### 8.1. Lấy vị trí hiện tại (Geocode)

**Endpoint:** `GET /api/map/current-location`

**Authentication:** Không cần

**Query Parameters:**
- `address` (optional): Địa chỉ cần geocode, mặc định: "Hồ Gươm, Hoàn Kiếm, Hà Nội"

**Response Success (200):**
```json
{
  "lat": 21.028511,
  "lng": 105.804817,
  "formatted_address": "Hồ Gươm, Hoàn Kiếm, Hà Nội, Việt Nam"
}
```

---

### 8.2. Geocode địa chỉ

**Endpoint:** `GET /api/map/geocode`

**Authentication:** Không cần

**Query Parameters:**
- `address` (required): Địa chỉ cần geocode

**Response Success (200):**
```json
{
  "results": [
    {
      "formatted_address": "123 Đường ABC, Hà Nội",
      "geometry": {
        "location": {
          "lat": 21.028511,
          "lng": 105.804817
        }
      }
    }
  ]
}
```

---

## 📝 9. Error Responses

Tất cả các API endpoints có thể trả về các lỗi sau:

### 400 Bad Request
```json
{
  "error": "Thông báo lỗi cụ thể"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "error": "Không tìm thấy"
}
```

### 500 Internal Server Error
```json
{
  "error": "Lỗi server"
}
```

---

## 🔑 10. Authentication

Hầu hết các API endpoints yêu cầu authentication thông qua JWT token.

**Cách sử dụng:**
1. Đăng ký/Đăng nhập để nhận JWT token
2. Gửi token trong header:
   ```
   Authorization: Bearer YOUR_JWT_TOKEN
   ```
3. Token có thời hạn 7 ngày

---

## 📊 11. Rate Limiting

Hiện tại chưa có rate limiting. Có thể thêm trong tương lai.

---

## 🔒 12. Security Notes

- Tất cả passwords được hash bằng bcryptjs (10 salt rounds)
- JWT tokens được ký bằng secret key
- CORS được cấu hình để chỉ cho phép frontend truy cập
- SQL injection được ngăn chặn bằng parameterized queries

---

**Last Updated:** 2024-12-24
**Version:** 1.0.0

