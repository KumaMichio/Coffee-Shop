-- ============================
-- DROP & CREATE TABLES
-- ============================
-- Chạy câu lệnh này riêng trước:
-- DROP DATABASE IF EXISTS coffee_app;
-- CREATE DATABASE coffee_app;

-- Sau đó kết nối vào database coffee_app và chạy phần còn lại:
DROP DATABASE IF EXISTS coffee_app;
CREATE DATABASE coffee_app;
\c coffee_app
-- ============================
-- USERS TABLE (Xác thực)
-- ============================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index cho tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ============================
-- CAFES TABLE
-- ============================
-- Các quán cà phê được lưu từ kết quả tìm kiếm hoặc yêu thích
CREATE TABLE cafes (
  id SERIAL PRIMARY KEY,
  provider VARCHAR(20) NOT NULL,             -- 'goong' | 'google'
  provider_place_id TEXT NOT NULL,           -- id của place bên provider (dùng TEXT vì có thể dài)
  name TEXT NOT NULL,
  address TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  rating NUMERIC(2,1),
  user_rating_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, provider_place_id)
);

-- Index hỗ trợ query theo vị trí
CREATE INDEX IF NOT EXISTS idx_cafes_lat_lng ON cafes(lat, lng);

-- ============================
-- FAVORITES TABLE (Yêu thích)
-- ============================
-- Bảng trung gian: user yêu thích cafe nào
CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cafe_id INTEGER NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, cafe_id)  -- Mỗi user chỉ yêu thích 1 lần
);

-- Index cho query nhanh
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_cafe_id ON favorites(cafe_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_cafe ON favorites(user_id, cafe_id);

-- ============================
-- REVIEWS TABLE (Đánh giá)
-- ============================
-- Bảng lưu đánh giá của user cho các quán cà phê
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
  UNIQUE(user_id, cafe_id)  -- Mỗi user chỉ đánh giá 1 lần cho mỗi quán
);

-- Index cho query nhanh
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_cafe_id ON reviews(cafe_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_cafe ON reviews(user_id, cafe_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);