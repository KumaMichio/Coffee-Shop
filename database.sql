-- ============================
-- DROP & CREATE TABLES
-- ============================
-- Chay cau lenh nay rieng truoc:
-- DROP DATABASE IF EXISTS coffee_app;
-- CREATE DATABASE coffee_app;

-- Sau do ket noi vao database coffee_app va chay phan con lai:

-- Set encoding to UTF8
SET client_encoding = 'UTF8';

-- ============================
-- USERS TABLE
-- ============================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index cho tim kiem nhanh
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Create default admin user
-- Email: admin@admin.com
-- Password: admin123
INSERT INTO users (username, email, password_hash, role)
VALUES (
  'admin',
  'admin@admin.com',
  '$2a$10$oEq/RUNt9f8jdsqU59weAO54ALsUF88hMwthtn9Nz4QWxC.7IeXS6',
  'admin'
);

-- ============================
-- CAFES TABLE
-- ============================
-- Cac quan ca phe duoc luu tu ket qua tim kiem hoac yeu thich
CREATE TABLE cafes (
  id SERIAL PRIMARY KEY,
  provider VARCHAR(20) NOT NULL,
  provider_place_id TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  rating NUMERIC(2,1),
  user_rating_count INTEGER,
  price_level INTEGER CHECK (price_level >= 1 AND price_level <= 4), -- 1: $, 2: $$, 3: $$$, 4: $$$$
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, provider_place_id)
);

-- Index ho tro query theo vi tri
CREATE INDEX IF NOT EXISTS idx_cafes_lat_lng ON cafes(lat, lng);

-- ============================
-- FAVORITES TABLE
-- ============================
-- Bang trung gian: user yeu thich cafe nao
CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cafe_id INTEGER NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, cafe_id)  -- Moi user chi yeu thich 1 lan
);

-- Index cho query nhanh
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_cafe_id ON favorites(cafe_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_cafe ON favorites(user_id, cafe_id);

-- ============================
-- REVIEWS TABLE
-- ============================
-- Bang luu danh gia cua user cho cac quan ca phe
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cafe_id INTEGER NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  is_child_friendly BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, cafe_id)  -- Moi user chi danh gia 1 lan cho moi quan
);

-- Index cho query nhanh
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_cafe_id ON reviews(cafe_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_cafe ON reviews(user_id, cafe_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- ============================
-- REVIEWS TABLE MIGRATION: Add images column
-- ============================
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- ============================
-- PROMOTIONS TABLE (Khuyen mai)
-- ============================
-- Bang luu thong tin khuyen mai cua cac quan ca phe
CREATE TABLE promotions (
  id SERIAL PRIMARY KEY,
  cafe_id INTEGER REFERENCES cafes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL,
  discount_value NUMERIC(10,2),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (end_date > start_date),
  CHECK (discount_value >= 0)
);

-- Index cho query nhanh
CREATE INDEX IF NOT EXISTS idx_promotions_cafe_id ON promotions(cafe_id);
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON promotions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_promotions_created_by ON promotions(created_by);

-- Index cho tim kiem promotions theo thoi gian va trang thai
CREATE INDEX IF NOT EXISTS idx_promotions_active_dates ON promotions(is_active, start_date, end_date) 
  WHERE is_active = TRUE;

-- ============================
-- SEED DATA
-- ============================

-- ============================
-- SEED CAFES DATA
-- ============================
-- Seed data for cafes
-- This script creates sample cafes in the database with real locations from Google Maps/Goong
-- These are popular coffee shops in Hanoi (Hà Nội)
-- Coordinates are real locations from Google Maps

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

-- Display cafes summary
DO $$
DECLARE
  cafe_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO cafe_count FROM cafes;
  RAISE NOTICE 'Successfully seeded % cafes into the database', cafe_count;
END
$$;

-- ============================
-- SEED PROMOTIONS DATA
-- ============================
-- Seed data for promotions
-- This script creates sample promotions for cafes in the database
-- Note: This will only create promotions if there are cafes in the database

-- Get admin user ID (assuming admin@admin.com exists)
DO $$
DECLARE
  admin_user_id INTEGER;
  cafe_record RECORD;
  promotion_count INTEGER := 0;
  cafe_count INTEGER := 0;
  inserted_count INTEGER;
BEGIN
  -- Get admin user ID
  SELECT id INTO admin_user_id FROM users WHERE email = 'admin@admin.com' LIMIT 1;
  
  IF admin_user_id IS NULL THEN
    RAISE NOTICE 'Admin user not found. Please create admin user first.';
    RETURN;
  END IF;

  -- Check if there are cafes
  SELECT COUNT(*) INTO cafe_count FROM cafes;
  
  IF cafe_count = 0 THEN
    RAISE NOTICE 'No cafes found in database. Please search for cafes first using the app.';
    RETURN;
  END IF;

  RAISE NOTICE 'Found % cafes in database. Creating promotions...', cafe_count;

  -- Create promotions for each cafe (limit to first 10 cafes to avoid too many)
  FOR cafe_record IN 
    SELECT id, name FROM cafes ORDER BY id LIMIT 10
  LOOP
    -- Promotion 1: Percentage discount
    INSERT INTO promotions (
      cafe_id, title, description, discount_type, discount_value,
      start_date, end_date, is_active, created_by
    )
    SELECT
      cafe_record.id,
      '20% Off All Drinks',
      'Enjoy 20% discount on all drinks. Valid for dine-in and takeaway.',
      'percentage',
      20,
      NOW() - INTERVAL '1 day',
      NOW() + INTERVAL '7 days',
      TRUE,
      admin_user_id
    WHERE NOT EXISTS (
      SELECT 1 FROM promotions 
      WHERE cafe_id = cafe_record.id 
      AND title = '20% Off All Drinks'
    );
    
    GET DIAGNOSTICS inserted_count = ROW_COUNT;
    IF inserted_count > 0 THEN
      promotion_count := promotion_count + 1;
    END IF;

    -- Promotion 2: Fixed amount discount (for every 2nd cafe)
    IF MOD(cafe_record.id, 2) = 0 THEN
      INSERT INTO promotions (
        cafe_id, title, description, discount_type, discount_value,
        start_date, end_date, is_active, created_by
      )
      SELECT
        cafe_record.id,
        '50,000 VND Off',
        'Get 50,000 VND off on orders over 200,000 VND.',
        'fixed_amount',
        50000,
        NOW(),
        NOW() + INTERVAL '14 days',
        TRUE,
        admin_user_id
      WHERE NOT EXISTS (
        SELECT 1 FROM promotions 
        WHERE cafe_id = cafe_record.id 
        AND title = '50,000 VND Off'
      );

      GET DIAGNOSTICS inserted_count = ROW_COUNT;
      IF inserted_count > 0 THEN
        promotion_count := promotion_count + 1;
      END IF;
    END IF;

    -- Promotion 3: Free item (for every 3rd cafe)
    IF MOD(cafe_record.id, 3) = 0 THEN
      INSERT INTO promotions (
        cafe_id, title, description, discount_type, discount_value,
        start_date, end_date, is_active, created_by
      )
      SELECT
        cafe_record.id,
        'Buy 2 Get 1 Free',
        'Buy any 2 drinks and get 1 free drink of equal or lesser value.',
        'free_item',
        1,
        NOW() + INTERVAL '2 days',
        NOW() + INTERVAL '30 days',
        TRUE,
        admin_user_id
      WHERE NOT EXISTS (
        SELECT 1 FROM promotions 
        WHERE cafe_id = cafe_record.id 
        AND title = 'Buy 2 Get 1 Free'
      );

      GET DIAGNOSTICS inserted_count = ROW_COUNT;
      IF inserted_count > 0 THEN
        promotion_count := promotion_count + 1;
      END IF;
    END IF;

    -- Promotion 4: Weekend special (for cafes with id divisible by 5)
    IF MOD(cafe_record.id, 5) = 0 THEN
      INSERT INTO promotions (
        cafe_id, title, description, discount_type, discount_value,
        start_date, end_date, is_active, created_by
      )
      SELECT
        cafe_record.id,
        'Weekend Special - 15% Off',
        'Weekend special promotion. 15% off on all items every Saturday and Sunday.',
        'percentage',
        15,
        NOW() - INTERVAL '3 days',
        NOW() + INTERVAL '60 days',
        TRUE,
        admin_user_id
      WHERE NOT EXISTS (
        SELECT 1 FROM promotions 
        WHERE cafe_id = cafe_record.id 
        AND title = 'Weekend Special - 15% Off'
      );

      GET DIAGNOSTICS inserted_count = ROW_COUNT;
      IF inserted_count > 0 THEN
        promotion_count := promotion_count + 1;
      END IF;
    END IF;
  END LOOP;

  RAISE NOTICE 'Successfully created % new promotions for cafes', promotion_count;
END
$$;