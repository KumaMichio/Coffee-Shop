-- ============================================
-- TABLE: cafes
-- ============================================

DROP TABLE IF EXISTS cafes;

CREATE TABLE cafes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  rating NUMERIC(2,1),
  open_time VARCHAR(20),
  close_time VARCHAR(20),
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SAMPLE DATA (Hanoi – 20+ cafes)
-- TẤT CẢ UTF-8 AN TOÀN CHO PostgreSQL
-- ============================================

INSERT INTO cafes (name, address, lat, lng, rating, open_time, close_time, image_url, description)
VALUES
('Cà phê Hồ Gươm', 'Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội', 21.0285, 105.8520, 4.5, '07:00', '22:00',
 'https://example.com/cafe1.jpg', 'Quán view hồ thoáng mát'),
('Tranquil Books & Coffee', 'Nguyễn Biểu, Ba Đình, Hà Nội', 21.0400, 105.8420, 4.7, '08:00', '23:00',
 'https://example.com/cafe2.jpg', 'Không gian vintage yên tĩnh'),
('The Coffee House Xã Đàn', 'Xã Đàn, Đống Đa, Hà Nội', 21.0145, 105.8288, 4.3, '07:00', '22:30',
 'https://example.com/cafe3.jpg', 'Chuỗi cửa hàng lớn, ổn định'),
('Highlands Coffee Vincom', 'Bà Triệu, Hai Bà Trưng, Hà Nội', 21.0164, 105.8485, 4.2, '08:00', '22:00',
 'https://example.com/cafe4.jpg', 'Không gian rộng và view đẹp'),

('Laika Cafe', 'Đường Láng, Đống Đa, Hà Nội', 21.0150, 105.8131, 4.1, '07:30', '23:00',
 'https://example.com/laika.jpg', 'Không gian trẻ trung, giá hợp lý'),
('Cafe AHA Hoàn Kiếm', 'Cầu Gỗ, Hoàn Kiếm, Hà Nội', 21.0333, 105.8511, 4.4, '06:30', '22:30',
 'https://example.com/aha.jpg', 'Chuỗi caffe Việt nổi tiếng'),
('Remember Cafe', 'Hàng Bè, Hoàn Kiếm, Hà Nội', 21.0338, 105.8524, 4.6, '08:00', '23:00',
 'https://example.com/remember.jpg', 'Không gian hoài cổ'),
('Cong Caphe Truc Bach', 'Trúc Bạch, Ba Đình, Hà Nội', 21.0432, 105.8411, 4.5, '07:00', '23:00',
 'https://example.com/cong.jpg', 'Phong cách bao cấp, decor đẹp'),

('Xofa Cafe', 'Tống Duy Tân, Hoàn Kiếm, Hà Nội', 21.0296, 105.8449, 4.6, '00:00', '23:59',
 'https://example.com/xofa.jpg', 'Café mở 24/7 nổi tiếng'),
('Vintage 1976 Cafe', 'Hàng Bún, Ba Đình, Hà Nội', 21.0408, 105.8425, 4.5, '08:00', '22:30',
 'https://example.com/vintage.jpg', 'Nhiều góc chụp ảnh'),
('Simple Coffee', 'Yên Lãng, Đống Đa, Hà Nội', 21.0124, 105.8137, 4.0, '07:30', '22:30',
 'https://example.com/simple.jpg', 'Không gian đơn giản, nhẹ nhàng'),
('Koi Cafe', 'Phố Huế, Hai Bà Trưng, Hà Nội', 21.0147, 105.8530, 4.1, '09:00', '22:30',
 'https://example.com/koi.jpg', 'Trà sữa và cafe Nhật Bản'),

('Ding Tea Bà Triệu', 'Bà Triệu, Hai Bà Trưng, Hà Nội', 21.0135, 105.8499, 4.0, '08:00', '22:00',
 'https://example.com/dingtea.jpg', 'Thương hiệu trà sữa nổi tiếng'),
('Lofita – Love at First Taste', 'Hồ Tùng Mậu, Cầu Giấy, Hà Nội', 21.0383, 105.7747, 4.6, '08:00', '22:00',
 'https://example.com/lofita.jpg', 'Không gian rooftop cực đẹp'),
('Nhã Nam Book N Coffee', 'Phan Kế Bính, Ba Đình, Hà Nội', 21.0345, 105.8117, 4.5, '08:00', '22:00',
 'https://example.com/nhanam.jpg', 'Cafe sách yên tĩnh'),
('Cup Of Tea Cafe & Bistro', 'Nguyễn Đình Thi, Tây Hồ, Hà Nội', 21.0438, 105.8199, 4.7, '08:00', '22:00',
 'https://example.com/cot.jpg', 'View Hồ Tây cực chill'),

('1992s Cafe', 'Hoàng Cầu, Đống Đa, Hà Nội', 21.0210, 105.8204, 4.3, '07:30', '22:30',
 'https://example.com/1992.jpg', 'Không gian trẻ trung, đồ uống ngon'),
('Trill Rooftop Cafe', 'Hoàng Đạo Thúy, Cầu Giấy, Hà Nội', 21.0134, 105.8001, 4.4, '08:00', '23:00',
 'https://example.com/trill.jpg', 'Rooftop có view thành phố đẹp'),
('Serein Cafe', 'Long Biên, Hà Nội', 21.0398, 105.8547, 4.6, '07:00', '22:30',
 'https://example.com/serein.jpg', 'View cầu Long Biên cực chill'),
('Eden Coffee', 'Nhà Thờ Lớn, Hoàn Kiếm, Hà Nội', 21.0284, 105.8498, 4.2, '08:00', '23:00',
 'https://example.com/eden.jpg', 'View Nhà Thờ đẹp nhất khu vực');
