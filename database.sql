-- ============================
-- DROP & CREATE TABLES
-- ============================
DROP DATABASE IF EXISTS coffee_app;
CREATE DATABASE coffee_app;
\c coffee_app;

-- Các quán cà phê được lưu khi user đánh dấu "yêu thích" hoặc lưu từ kết quả search
CREATE TABLE cafes (
  id SERIAL PRIMARY KEY,
  provider        VARCHAR(20) NOT NULL,             -- 'goong' | 'google'
  provider_place_id VARCHAR(128) NOT NULL,          -- id của place bên provider
  name            TEXT NOT NULL,
  address         TEXT,
  lat             DOUBLE PRECISION NOT NULL,
  lng             DOUBLE PRECISION NOT NULL,
  rating          NUMERIC(2,1),
  user_rating_count INTEGER,
  is_favorite     BOOLEAN NOT NULL DEFAULT TRUE,    -- mặc định là quán yêu thích
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, provider_place_id)
);

-- Index hỗ trợ query theo vị trí nếu cần sau này
CREATE INDEX IF NOT EXISTS idx_cafes_lat_lng ON cafes(lat, lng);
CREATE INDEX IF NOT EXISTS idx_cafes_favorite ON cafes(is_favorite);