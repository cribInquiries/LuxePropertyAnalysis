-- Run all migration scripts in order
-- This ensures the database is properly set up with all required tables

-- 1. Create profiles table
\i scripts/001_create_profiles.sql

-- 2. Create property analyses table  
\i scripts/002_create_property_analyses.sql

-- 3. Create saved properties table
\i scripts/003_create_saved_properties.sql

-- 4. Create user settings table
\i scripts/004_create_user_settings.sql

-- 5. Create user activity log table
\i scripts/005_create_user_activity_log.sql

-- 6. Create property images table (if exists)
-- \i scripts/005_create_property_images.sql

-- 7. Enhance property analyses (if exists)
-- \i scripts/006_enhance_property_analyses.sql
