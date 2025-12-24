# 📋 Danh sách nhiệm vụ Sprint
## 1. 認証機能 — Chức năng xác thực
### 1. 新規登録 API 実装 — API đăng ký tài khoản

Mô tả:

Nhận username/email/password

Kiểm tra định dạng và trùng lặp

Hash mật khẩu và lưu DB
Phụ trách: Hùng


### 2. ログイン API 実装 — API đăng nhập

Mô tả:

Xác thực email/password

Trả về JWT/Session nếu đúng
Phụ trách: Hùng


### 3. FE ログイン・登録画面実装 — UI đăng ký/đăng nhập

Mô tả:

Tạo form FE

Validate input

Gọi API & chuyển trang khi thành công
Phụ trách: Hùng


## 2. お気に入り機能 — Chức năng yêu thích
### 4. お気に入り登録 API 作成 — API thêm quán vào danh sách yêu thích

Mô tả:

Thêm từ trang chi tiết/danh sách

Icon hiển thị trạng thái (heart)
Phụ trách: Minh Đức


### 5. お気に入り削除 API 作成 — API xóa quán khỏi yêu thích

Mô tả:

Xóa khỏi danh sách

Cập nhật ngay lập tức
Phụ trách: Minh Đức


### 6. お気に入り一覧表示 FE 実装 — UI danh sách yêu thích

Mô tả:

Lấy danh sách quán yêu thích theo user_id

Hiển thị dạng list
Phụ trách: Minh Đức


## 3. 地図・ナビ機能 — Chức năng bản đồ – điều hướng
### 7. 現在地取得 API 連携 — Lấy vị trí hiện tại

Mô tả:

Lấy tọa độ user bằng Goong/Google Maps

Kiểm tra quyền truy cập vị trí
Phụ trách: Thái Đức


### 8. 2km圏内カフェ検索 API — Tìm quán trong bán kính 2km

Mô tả:

Tìm và hiển thị quán trong 2km

Hiển thị dạng bản đồ hoặc danh sách
Phụ trách: Thái Đức


### 9. 経路案内リンク生成 — Hiển thị đường đi đến quán

Mô tả:

Tạo route đến quán

Mở được trên Google Maps
Phụ trách: Việt


## 4. 検索・フィルター機能 — Tìm kiếm & Bộ lọc
### 10. 並び替え機能 — Sắp xếp theo (khoảng cách/đánh giá/giá)

Mô tả:

UI chọn tiêu chí

Cập nhật list theo lựa chọn
Phụ trách: Bình


### 11. 絞り込み UI 実装 — UI bộ lọc

Mô tả:

Lọc theo đánh giá/khoảng cách/đang mở
Phụ trách: Bình


## 5. 機能テスト — Test chức năng
### 12. テスト項目整理・実施 — Thiết kế & chạy test

Bao gồm:

Test yêu thích

Test bản đồ – điều hướng

Test tìm kiếm

Test bộ lọc

Test error-case
Phụ trách: Bình


## 6. 改善タスク — Nhiệm vụ cải thiện
### 13. Sprint01 フィードバック改善対応 — Fix theo góp ý Sprint01

Các điểm cải thiện:

Tìm kiếm theo tên/địa chỉ

Hover info quán

Mượt thao tác bản đồ

Đổi màu marker
Phụ trách: Việt