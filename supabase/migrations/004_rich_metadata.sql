-- Migration 004: Rich metadata for transactions and activities, plus savings_goals and budgets tables

-- 1. Add rich metadata to transactions table
ALTER TABLE transactions 
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::text[];

-- 2. Add rich metadata to activities table
ALTER TABLE activities 
  ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
  ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::text[];

-- 3. Create savings_goals table for specific savings targets (e.g. Liburan Dieng, Laptop)
CREATE TABLE IF NOT EXISTS savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_amount NUMERIC(12, 2) NOT NULL,
  current_amount NUMERIC(12, 2) DEFAULT 0,
  target_date DATE,
  status TEXT CHECK (status IN ('active', 'reached', 'cancelled')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create budgets table for category budget limits per month
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  monthly_limit NUMERIC(12, 2) NOT NULL,
  month_year TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_user_category_month UNIQUE(user_id, category_id, month_year)
);
