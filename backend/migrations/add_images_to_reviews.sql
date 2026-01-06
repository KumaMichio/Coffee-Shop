-- Migration: Add images column to reviews table
-- Run this in PgAdmin Query Tool for coffee_app database

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Add index for better query performance

-- Verify the change
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'reviews' AND column_name = 'images';

