-- Migration: Add images column to reviews table
-- Run this in PgAdmin Query Tool for coffee_app database

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_reviews_with_images ON reviews USING GIN(images) WHERE array_length(images, 1) > 0;

-- Verify the change
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'reviews' AND column_name = 'images';
