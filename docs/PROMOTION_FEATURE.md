# Tính năng Thông báo Khuyến mãi

## Tổng quan

Tính năng thông báo khuyến mãi cho phép quản trị viên hoặc chủ quán đăng thông tin khuyến mãi, và hệ thống sẽ tự động gửi thông báo đến người dùng trong khu vực phù hợp.

## Cài đặt Database

Chạy migration để tạo bảng `promotions`:

```bash
# Kết nối vào PostgreSQL
psql -U your_username -d coffee_app

# Chạy migration
\i backend/migrations/add_promotions_table.sql
```

Hoặc chạy trực tiếp SQL:

```sql
-- Xem file backend/migrations/add_promotions_table.sql
```

## Cấu trúc Database

### Bảng `promotions`

- `id`: ID khuyến mãi
- `cafe_id`: ID quán cà phê (FK đến `cafes`)
- `title`: Tên chương trình khuyến mãi
- `description`: Mô tả chi tiết
- `discount_type`: Loại giảm giá (`percentage`, `fixed_amount`, `free_item`)
- `discount_value`: Giá trị giảm giá
- `start_date`: Thời gian bắt đầu
- `end_date`: Thời gian kết thúc
- `is_active`: Trạng thái hoạt động
- `target_radius`: Bán kính hiển thị (mét, mặc định 5000m = 5km)
- `created_by`: ID người tạo (FK đến `users`)
- `created_at`, `updated_at`: Timestamps

## API Endpoints

### Public Endpoints (không cần auth)

#### GET `/api/promotions/nearby`
Lấy promotions gần vị trí

**Query Parameters:**
- `lat` (required): Vĩ độ
- `lng` (required): Kinh độ
- `radius` (optional): Bán kính tìm kiếm (mét, mặc định 5000)

**Response:**
```json
{
  "promotions": [
    {
      "id": 1,
      "cafe_id": 1,
      "title": "Giảm 20% tất cả đồ uống",
      "description": "Áp dụng cho tất cả đồ uống trong menu",
      "discount_type": "percentage",
      "discount_value": 20,
      "start_date": "2024-01-01T00:00:00Z",
      "end_date": "2024-01-31T23:59:59Z",
      "cafe_name": "Cà phê ABC",
      "cafe_address": "123 Đường XYZ",
      "distance": 1200.5
    }
  ]
}
```

#### GET `/api/promotions/cafe/:cafeId`
Lấy promotions của một quán cụ thể

#### GET `/api/promotions/:id`
Lấy promotion theo ID

### Protected Endpoints (cần auth)

#### POST `/api/promotions`
Tạo promotion mới

**Request Body:**
```json
{
  "cafe_id": 1,
  "title": "Giảm 20% tất cả đồ uống",
  "description": "Áp dụng cho tất cả đồ uống trong menu",
  "discount_type": "percentage",
  "discount_value": 20,
  "start_date": "2024-01-01T00:00:00Z",
  "end_date": "2024-01-31T23:59:59Z",
  "is_active": true,
  "target_radius": 5000
}
```

#### PUT `/api/promotions/:id`
Cập nhật promotion

#### DELETE `/api/promotions/:id`
Xóa promotion (soft delete)

#### GET `/api/promotions`
Lấy tất cả promotions (cho admin)

## Frontend Components

### PromotionNotification Component

Component tự động hiển thị thông báo khuyến mãi dựa trên vị trí hiện tại của người dùng.

**Props:**
- `currentLocation`: Object chứa `lat` và `lng`
- `onPromotionClick`: Callback khi người dùng click vào promotion

**Tính năng:**
- Tự động load promotions gần vị trí (trong bán kính 5km)
- Hiển thị notification cho promotion mới
- Modal chi tiết khi click vào notification
- Tự động center map vào quán khi click promotion

### Sử dụng trong Home Page

Component đã được tích hợp vào `Home.js`:

```jsx
<PromotionNotification
  currentLocation={currentLocation}
  onPromotionClick={(promotion) => {
    // Xử lý khi click promotion
  }}
/>
```

## Service Layer

### promotionService

File: `frontend/src/services/promotionService.js`

**Methods:**
- `getPromotionsNearby({ lat, lng, radius })`: Lấy promotions gần vị trí
- `getPromotionsByCafe(cafeId)`: Lấy promotions của một quán
- `getPromotionById(promotionId)`: Lấy promotion theo ID
- `createPromotion(promotionData)`: Tạo promotion mới (cần auth)
- `updatePromotion(promotionId, updateData)`: Cập nhật promotion (cần auth)
- `deletePromotion(promotionId)`: Xóa promotion (cần auth)

## Ví dụ sử dụng

### Tạo promotion mới (Backend/Admin)

```javascript
const promotionData = {
  cafe_id: 1,
  title: "Giảm 20% tất cả đồ uống",
  description: "Áp dụng cho tất cả đồ uống trong menu",
  discount_type: "percentage",
  discount_value: 20,
  start_date: "2024-01-01T00:00:00Z",
  end_date: "2024-01-31T23:59:59Z",
  is_active: true,
  target_radius: 5000
};

const response = await fetch('http://localhost:5001/api/promotions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(promotionData)
});
```

### Lấy promotions gần vị trí (Frontend)

```javascript
import promotionService from '../services/promotionService';

const promotions = await promotionService.getPromotionsNearby({
  lat: 21.0285,
  lng: 105.8542,
  radius: 5000
});
```

## Lưu ý

1. **Vị trí người dùng**: Component chỉ hoạt động khi có `currentLocation` hợp lệ
2. **Bán kính mặc định**: 5km (5000 mét)
3. **Thời gian hiển thị**: Notification tự động đóng sau 8 giây
4. **Tránh spam**: Mỗi promotion chỉ hiển thị 1 lần cho mỗi session
5. **Tính khoảng cách**: Sử dụng Haversine formula để tính khoảng cách chính xác

## Tương lai

- [ ] Push notifications (Web Push API)
- [ ] Trang Admin để quản lý promotions
- [ ] Thống kê hiệu quả promotions
- [ ] Lọc promotions theo loại giảm giá
- [ ] Lịch sử promotions đã xem

