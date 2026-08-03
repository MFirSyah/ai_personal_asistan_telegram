-- Migration 005: 5-Wave Supercharged Feature Package

-- 1. Add partner_user_id to users table for couples account pairing
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS partner_user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- 2. Shared Goals table for couples & savings targets
CREATE TABLE IF NOT EXISTS shared_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  partner_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_amount NUMERIC(12, 2) NOT NULL,
  current_amount NUMERIC(12, 2) DEFAULT 0,
  target_date DATE,
  category TEXT DEFAULT 'impian',
  status TEXT CHECK (status IN ('active', 'reached', 'cancelled')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Anniversaries & Special Dates table
CREATE TABLE IF NOT EXISTS anniversaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  reminder_days_before INT DEFAULT 14,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Subscriptions & Recurring Bills table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly', 'weekly')) DEFAULT 'monthly',
  next_billing_date DATE NOT NULL,
  category TEXT DEFAULT 'Tagihan',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Debts & Loans table
CREATE TABLE IF NOT EXISTS debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  person_name TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  type TEXT CHECK (type IN ('i_owe', 'they_owe')) NOT NULL,
  due_date DATE,
  notes TEXT,
  status TEXT CHECK (status IN ('unpaid', 'paid', 'cancelled')) DEFAULT 'unpaid',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Habits Tracker table
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  frequency TEXT DEFAULT 'daily',
  streak_count INT DEFAULT 0,
  last_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. User Badges & Achievements table
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_key TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  description TEXT,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_user_badge UNIQUE(user_id, badge_key)
);
