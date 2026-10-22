-- 1. Ensure Demo Gym Tenant Exists
INSERT INTO gyms (id, owner_id, name, theme_color, logo_url, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'Iron Pulse Fitness',
  '#60A5FA',
  NULL,
  NOW()
)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, theme_color = EXCLUDED.theme_color;

-- 2. Clear Previous Demo Members for Idempotent Seeding
DELETE FROM members WHERE gym_id = '00000000-0000-0000-0000-000000000001';

-- 3. Populate Realistic Member Cohorts (Active, Expiring Soon, and Lapsed)
INSERT INTO members (gym_id, name, phone, join_date, expiration_date, created_at)
VALUES
  -- Active Members (Safe Horizon)
  ('00000000-0000-0000-0000-000000000001', 'Marcus Vance', '+639171112233', CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE + INTERVAL '30 days', NOW() - INTERVAL '60 days'),
  ('00000000-0000-0000-0000-000000000001', 'Elena Rostova', '+639182223344', CURRENT_DATE - INTERVAL '45 days', CURRENT_DATE + INTERVAL '45 days', NOW() - INTERVAL '45 days'),
  ('00000000-0000-0000-0000-000000000001', 'Carlos Mendoza', '+639193334455', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '75 days', NOW() - INTERVAL '15 days'),
  ('00000000-0000-0000-0000-000000000001', 'Sarah Jenkins', '+639204445566', CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE + INTERVAL '15 days', NOW() - INTERVAL '90 days'),
  ('00000000-0000-0000-0000-000000000001', 'David Kim', '+639215556677', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '80 days', NOW() - INTERVAL '10 days'),

  -- Expiring Critical Cohort (Triggers AI Retention Hub: 0 to 3 Days Remaining)
  ('00000000-0000-0000-0000-000000000001', 'Aaliyah Patel', '+639226667788', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE, NOW() - INTERVAL '30 days'),
  ('00000000-0000-0000-0000-000000000001', 'Brandon Hayes', '+639237778899', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '1 day', NOW() - INTERVAL '30 days'),
  ('00000000-0000-0000-0000-000000000001', 'Chloe Bennett', '+639248889900', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '2 days', NOW() - INTERVAL '30 days'),
  ('00000000-0000-0000-0000-000000000001', 'Derek O''Connor', '+639259990011', CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE + INTERVAL '3 days', NOW() - INTERVAL '60 days'),

  -- Expired / Lapsed Cohort (Triggers Win-Back Offers: -1 to -3 Days Overdue)
  ('00000000-0000-0000-0000-000000000001', 'Fiona Gallagher', '+639261110022', CURRENT_DATE - INTERVAL '31 days', CURRENT_DATE - INTERVAL '1 day', NOW() - INTERVAL '31 days'),
  ('00000000-0000-0000-0000-000000000001', 'George Miller', '+639272220033', CURRENT_DATE - INTERVAL '32 days', CURRENT_DATE - INTERVAL '2 days', NOW() - INTERVAL '32 days');
