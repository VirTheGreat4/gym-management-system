-- 1. Ensure Demo Gym Tenant Exists
INSERT INTO gyms (id, owner_id, name, theme_color, logo_url, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'JLAB Fitness Gym',
  '#60A5FA',
  NULL,
  NOW()
)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, theme_color = EXCLUDED.theme_color;

-- 2. Seed Custom Badges (Student Badge with 50% discount)
INSERT INTO custom_badges (id, name, color, discount_percent, description, created_at)
VALUES
  ('00000000-0000-0000-0000-0000000000b1', 'Student', 'blue', 50, 'Student discount promo (50% off)', NOW())
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, discount_percent = EXCLUDED.discount_percent;

-- 3. Seed Subscription Plans (1 Month Plan costing 1200 Pesos)
INSERT INTO subscription_plans (id, name, duration_days, price, category, description, created_at)
VALUES
  ('00000000-0000-0000-0000-0000000000p1', '1 Month Membership', 30, 1200, 'Standard', '1 Month full access to gym equipment and facilities', NOW())
ON CONFLICT (id) DO UPDATE
SET price = EXCLUDED.price, duration_days = EXCLUDED.duration_days;

-- 4. Clear Previous Demo Members for Idempotent Seeding
DELETE FROM members WHERE gym_id = '00000000-0000-0000-0000-000000000001';

-- 5. Populate Members (including permanent member Virgilio Flor E. Guaño)
INSERT INTO members (gym_id, name, phone, badges, plan_type, amount_paid, payment_method, join_date, expiration_date, created_at)
VALUES
  -- Permanent Student Member: Virgilio Flor E. Guaño (Avail 1 Month @ 50% Student Discount = 600 PHP)
  ('00000000-0000-0000-0000-000000000001', 'Virgilio Flor E. Guaño', '09754100345', ARRAY['Student'], '1 Month Membership', 600, 'Cash', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '25 days', NOW() - INTERVAL '5 days'),

  -- Active Members (Safe Horizon)
  ('00000000-0000-0000-0000-000000000001', 'Marcus Vance', '09171112233', ARRAY[]::text[], '1 Month Membership', 1200, 'Cash', CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE + INTERVAL '30 days', NOW() - INTERVAL '60 days'),
  ('00000000-0000-0000-0000-000000000001', 'Elena Rostova', '09182223344', ARRAY[]::text[], '1 Month Membership', 1200, 'GCash', CURRENT_DATE - INTERVAL '45 days', CURRENT_DATE + INTERVAL '45 days', NOW() - INTERVAL '45 days'),
  ('00000000-0000-0000-0000-000000000001', 'Carlos Mendoza', '09193334455', ARRAY[]::text[], '1 Month Membership', 1200, 'Cash', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '75 days', NOW() - INTERVAL '15 days'),

  -- Expiring Critical Cohort (Triggers AI Retention Hub: 0 to 3 Days Remaining)
  ('00000000-0000-0000-0000-000000000001', 'Aaliyah Patel', '09226667788', ARRAY[]::text[], '1 Month Membership', 1200, 'Cash', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE, NOW() - INTERVAL '30 days'),
  ('00000000-0000-0000-0000-000000000001', 'Brandon Hayes', '09237778899', ARRAY[]::text[], '1 Month Membership', 1200, 'GCash', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '1 day', NOW() - INTERVAL '30 days'),

  -- Expired / Lapsed Cohort (Triggers Win-Back Offers: -1 to -3 Days Overdue)
  ('00000000-0000-0000-0000-000000000001', 'Fiona Gallagher', '09261110022', ARRAY[]::text[], '1 Month Membership', 1200, 'Cash', CURRENT_DATE - INTERVAL '31 days', CURRENT_DATE - INTERVAL '1 day', NOW() - INTERVAL '31 days');
