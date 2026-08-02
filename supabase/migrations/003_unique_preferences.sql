-- Migration 003: Add unique constraint for user preferences
DELETE FROM user_preferences a
USING user_preferences b
WHERE a.id < b.id
  AND a.user_id = b.user_id
  AND a.key = b.key;

ALTER TABLE user_preferences ADD CONSTRAINT unique_user_key UNIQUE (user_id, key);
