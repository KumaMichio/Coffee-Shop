-- Seed data for promotions
-- This script creates sample promotions for cafes in the database
-- Note: This will only create promotions if there are cafes in the database


-- Set encoding to UTF8 to handle Vietnamese characters
SET client_encoding = 'UTF8';

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
      start_date, end_date, is_active, target_radius, created_by
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
      5000,
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
        start_date, end_date, is_active, target_radius, created_by
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
        3000,
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
        start_date, end_date, is_active, target_radius, created_by
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
        7000,
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
        start_date, end_date, is_active, target_radius, created_by
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
        10000,
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

