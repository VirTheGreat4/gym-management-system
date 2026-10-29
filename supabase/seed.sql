-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Tables Schema

CREATE TABLE IF NOT EXISTS custom_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT DEFAULT 'blue',
  discount_percent NUMERIC DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  duration_days INT NOT NULL,
  price NUMERIC NOT NULL,
  category TEXT DEFAULT 'Standard',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gym_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'JLAB Fitness Gym',
  theme_color TEXT DEFAULT '#60A5FA',
  logo_url TEXT,
  schedule JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  badges TEXT[] DEFAULT '{}',
  plan_type TEXT,
  amount_paid NUMERIC DEFAULT 0,
  payment_method TEXT DEFAULT 'Cash',
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiration_date DATE NOT NULL,
  is_banned BOOLEAN DEFAULT FALSE,
  ban_reason TEXT,
  warning_count INT DEFAULT 0,
  violation_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all expected columns exist on members table if it already existed
ALTER TABLE members ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}';
ALTER TABLE members ADD COLUMN IF NOT EXISTS plan_type TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS amount_paid NUMERIC DEFAULT 0;
ALTER TABLE members ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'Cash';
ALTER TABLE members ADD COLUMN IF NOT EXISTS join_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS expiration_date DATE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS ban_reason TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS warning_count INT DEFAULT 0;
ALTER TABLE members ADD COLUMN IF NOT EXISTS violation_notes TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Enable Row Level Security (RLS) with open read/write policies for anon role
ALTER TABLE custom_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read/write on custom_badges" ON custom_badges;
DROP POLICY IF EXISTS "Allow public read/write on subscription_plans" ON subscription_plans;
DROP POLICY IF EXISTS "Allow public read/write on gym_settings" ON gym_settings;
DROP POLICY IF EXISTS "Allow public read/write on members" ON members;

CREATE POLICY "Allow public read/write on custom_badges" ON custom_badges FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on subscription_plans" ON subscription_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on gym_settings" ON gym_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on members" ON members FOR ALL USING (true) WITH CHECK (true);

-- 2. Seed Custom Badges
INSERT INTO custom_badges (id, name, color, discount_percent, description, created_at)
VALUES
  ('00000000-0000-0000-0000-0000000000b0', 'Standard', 'zinc', 0, 'Standard regular membership badge', NOW()),
  ('00000000-0000-0000-0000-0000000000b1', 'Student', 'blue', 50, 'Student discount promo (50% off)', NOW())
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, discount_percent = EXCLUDED.discount_percent;

-- 3. Seed Subscription Plans
INSERT INTO subscription_plans (id, name, duration_days, price, category, description, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000010', '1 Month Membership', 30, 1200, 'Standard', '1 Month full access to gym equipment and facilities', NOW())
ON CONFLICT (id) DO UPDATE
SET price = EXCLUDED.price, duration_days = EXCLUDED.duration_days;

-- 4. Seed Gym Settings
INSERT INTO gym_settings (id, name, theme_color, logo_url, updated_at)
VALUES
  ('00000000-0000-0000-0000-0000000000e1', 'JLAB Fitness Gym', '#60A5FA', NULL, NOW())
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name;

-- 5. Seed Members
DELETE FROM members WHERE id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000007'
);

INSERT INTO members (id, name, phone, badges, plan_type, amount_paid, payment_method, join_date, expiration_date, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Virgilio Flor E. Guaño', '09754100345', ARRAY['Student'], '1 Month Membership', 600, 'Cash', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '25 days', NOW() - INTERVAL '5 days'),
  ('00000000-0000-0000-0000-000000000002', 'Marcus Vance', '09171112233', ARRAY[]::text[], '1 Month Membership', 1200, 'Cash', CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE + INTERVAL '30 days', NOW() - INTERVAL '60 days'),
  ('00000000-0000-0000-0000-000000000003', 'Elena Rostova', '09182223344', ARRAY[]::text[], '1 Month Membership', 1200, 'GCash', CURRENT_DATE - INTERVAL '45 days', CURRENT_DATE + INTERVAL '45 days', NOW() - INTERVAL '45 days'),
  ('00000000-0000-0000-0000-000000000004', 'Carlos Mendoza', '09193334455', ARRAY[]::text[], '1 Month Membership', 1200, 'Cash', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '75 days', NOW() - INTERVAL '15 days'),
  ('00000000-0000-0000-0000-000000000005', 'Aaliyah Patel', '09226667788', ARRAY[]::text[], '1 Month Membership', 1200, 'Cash', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE, NOW() - INTERVAL '30 days'),
  ('00000000-0000-0000-0000-000000000006', 'Brandon Hayes', '09237778899', ARRAY[]::text[], '1 Month Membership', 1200, 'GCash', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '1 day', NOW() - INTERVAL '30 days'),
  ('00000000-0000-0000-0000-000000000007', 'Fiona Gallagher', '09261110022', ARRAY[]::text[], '1 Month Membership', 1200, 'Cash', CURRENT_DATE - INTERVAL '31 days', CURRENT_DATE - INTERVAL '1 day', NOW() - INTERVAL '31 days')
ON CONFLICT (id) DO NOTHING;
