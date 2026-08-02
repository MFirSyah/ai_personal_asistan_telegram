-- Migration 002: Add performance indexes for scaling

-- Users index
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_occurred ON transactions(user_id, occurred_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id) WHERE deleted_at IS NULL;

-- Activities indexes
CREATE INDEX IF NOT EXISTS idx_activities_user_occurred ON activities(user_id, occurred_at DESC) WHERE deleted_at IS NULL;

-- Chat History indexes
CREATE INDEX IF NOT EXISTS idx_chat_history_user_created ON chat_history(user_id, created_at DESC);

-- User Sessions indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_expires ON user_sessions(user_id, expires_at DESC);

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_user_name ON categories(user_id, name);

-- Daily Insights index
CREATE INDEX IF NOT EXISTS idx_daily_insights_user_date ON daily_insights(user_id, insight_date DESC);
