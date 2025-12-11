-- Migration: Add avatar_url column to users table
-- Run this migration to add avatar_url support

ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;




