-- Seed data for cafes
-- This script creates sample cafes in the database with real locations from Google Maps/Goong
-- These are popular coffee shops in Hanoi (Hà Nội)
-- Coordinates are real locations from Google Maps

-- Set encoding to UTF8 to handle Vietnamese characters
SET client_encoding = 'UTF8';

INSERT INTO cafes (provider, provider_place_id, name, address, lat, lng, rating, user_rating_count)
VALUES
  -- Hanoi Cafes (from sample data with real coordinates)
  ('google', 'google_hn_001', 'Cà phê Hồ Gươm', 'Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội', 21.0285, 105.8520, 4.5, 1250),
  ('google', 'google_hn_002', 'Tranquil Books & Coffee', 'Nguyễn Biểu, Ba Đình, Hà Nội', 21.0400, 105.8420, 4.7, 2100),
  ('google', 'google_hn_003', 'The Coffee House Xã Đàn', 'Xã Đàn, Đống Đa, Hà Nội', 21.0145, 105.8288, 4.3, 1800),
  ('google', 'google_hn_004', 'Highlands Coffee Vincom', 'Bà Triệu, Hai Bà Trưng, Hà Nội', 21.0164, 105.8485, 4.2, 1650),
  ('google', 'google_hn_005', 'Laika Cafe', 'Đường Láng, Đống Đa, Hà Nội', 21.0150, 105.8131, 4.1, 1200),
  ('google', 'google_hn_006', 'Cafe AHA Hoàn Kiếm', 'Cầu Gỗ, Hoàn Kiếm, Hà Nội', 21.0333, 105.8511, 4.4, 1950),
  ('google', 'google_hn_007', 'Remember Cafe', 'Hàng Bè, Hoàn Kiếm, Hà Nội', 21.0338, 105.8524, 4.6, 2400),
  ('google', 'google_hn_008', 'Cong Caphe Truc Bach', 'Trúc Bạch, Ba Đình, Hà Nội', 21.0432, 105.8411, 4.5, 2200),
  ('google', 'google_hn_009', 'Xofa Cafe', 'Tống Duy Tân, Hoàn Kiếm, Hà Nội', 21.0296, 105.8449, 4.6, 2800),
  ('google', 'google_hn_010', 'Vintage 1976 Cafe', 'Hàng Bún, Ba Đình, Hà Nội', 21.0408, 105.8425, 4.5, 1900),
  ('google', 'google_hn_011', 'Simple Coffee', 'Yên Lãng, Đống Đa, Hà Nội', 21.0124, 105.8137, 4.0, 1100),
  ('google', 'google_hn_012', 'Koi Cafe', 'Phố Huế, Hai Bà Trưng, Hà Nội', 21.0147, 105.8530, 4.1, 1350),
  ('google', 'google_hn_013', 'Ding Tea Bà Triệu', 'Bà Triệu, Hai Bà Trưng, Hà Nội', 21.0135, 105.8499, 4.0, 1450),
  ('google', 'google_hn_014', 'Lofita - Love at First Taste', 'Ho Tung Mau, Cau Giay, Ha Noi', 21.0383, 105.7747, 4.6, 2100),
  ('google', 'google_hn_015', 'Nhã Nam Book N Coffee', 'Phan Kế Bính, Ba Đình, Hà Nội', 21.0345, 105.8117, 4.5, 1750),
  ('google', 'google_hn_016', 'Cup Of Tea Cafe & Bistro', 'Nguyễn Đình Thi, Tây Hồ, Hà Nội', 21.0438, 105.8199, 4.7, 2300),
  ('google', 'google_hn_017', '1992s Cafe', 'Hoàng Cầu, Đống Đa, Hà Nội', 21.0210, 105.8204, 4.3, 1600),
  ('google', 'google_hn_018', 'Trill Rooftop Cafe', 'Hoàng Đạo Thúy, Cầu Giấy, Hà Nội', 21.0134, 105.8001, 4.4, 1850),
  ('google', 'google_hn_019', 'Serein Cafe', 'Long Biên, Hà Nội', 21.0398, 105.8547, 4.6, 2000),
  ('google', 'google_hn_020', 'Eden Coffee', 'Nhà Thờ Lớn, Hoàn Kiếm, Hà Nội', 21.0284, 105.8498, 4.2, 1400),
  
  -- More Hanoi Cafes (Goong provider)
  ('goong', 'goong_hn_001', 'Cafe Giang - Egg Coffee', '39 P. Nguyễn Hữu Huân, Hàng Bạc, Hoàn Kiếm, Hà Nội', 21.0315, 105.8512, 4.7, 3200),
  ('goong', 'goong_hn_002', 'Cafe Dinh - Old Quarter', '13 P. Đinh Tiên Hoàng, Hàng Trống, Hoàn Kiếm, Hà Nội', 21.0295, 105.8552, 4.5, 2100),
  ('goong', 'goong_hn_003', 'Loading T Cafe', '8 P. Chả Cá, Hàng Đào, Hoàn Kiếm, Hà Nội', 21.0325, 105.8492, 4.6, 1800),
  ('goong', 'goong_hn_004', 'Cafe Pho Co', '11 P. Hàng Gai, Hàng Gai, Hoàn Kiếm, Hà Nội', 21.0285, 105.8532, 4.4, 1500),
  ('goong', 'goong_hn_005', 'The Note Coffee', '64 P. Lương Văn Can, Hàng Đào, Hoàn Kiếm, Hà Nội', 21.0305, 105.8522, 4.5, 1900)
ON CONFLICT (provider, provider_place_id) 
DO UPDATE SET 
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  rating = EXCLUDED.rating,
  user_rating_count = EXCLUDED.user_rating_count,
  updated_at = NOW();

-- Display summary
DO $$
DECLARE
  cafe_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO cafe_count FROM cafes;
  RAISE NOTICE 'Successfully seeded % cafes into the database', cafe_count;
END
$$;

