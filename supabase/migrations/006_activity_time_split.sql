-- Migration 006: Add explicit start_time, end_time, and reminder_time columns to activities

ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reminder_time TIMESTAMPTZ;
