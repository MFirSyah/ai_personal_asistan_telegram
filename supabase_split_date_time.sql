-- ====================================================================
-- SUPABASE MIGRATION: SEPARATE DATE & TIME COLUMNS + AI ANALYTICAL LABELS
-- ====================================================================
-- Script ini menambahkan kolom Tanggal & Jam terpisah serta label analitik
-- pada tabel transactions dan activities di Supabase dengan zona waktu WIB (Asia/Jakarta).
--
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run.
-- ====================================================================

-- 1. TAMBAHKAN KOLOM PADA TABEL TRANSACTIONS
ALTER TABLE transactions 
  ADD COLUMN IF NOT EXISTS occurred_date DATE,
  ADD COLUMN IF NOT EXISTS occurred_time TIME,
  ADD COLUMN IF NOT EXISTS created_date DATE,
  ADD COLUMN IF NOT EXISTS created_time TIME,
  ADD COLUMN IF NOT EXISTS category_name TEXT,
  ADD COLUMN IF NOT EXISTS subcategory_name TEXT,
  ADD COLUMN IF NOT EXISTS necessity_level TEXT,
  ADD COLUMN IF NOT EXISTS day_type TEXT,
  ADD COLUMN IF NOT EXISTS time_bucket TEXT;

-- 2. TAMBAHKAN KOLOM PADA TABEL ACTIVITIES
ALTER TABLE activities 
  ADD COLUMN IF NOT EXISTS occurred_date DATE,
  ADD COLUMN IF NOT EXISTS occurred_time TIME,
  ADD COLUMN IF NOT EXISTS created_date DATE,
  ADD COLUMN IF NOT EXISTS created_time TIME,
  ADD COLUMN IF NOT EXISTS category_name TEXT,
  ADD COLUMN IF NOT EXISTS day_type TEXT,
  ADD COLUMN IF NOT EXISTS time_bucket TEXT;

-- 3. TAMBAHKAN KOLOM PADA TABEL INSTALLMENTS & SUBSCRIPTIONS
ALTER TABLE installments
  ADD COLUMN IF NOT EXISTS created_date DATE,
  ADD COLUMN IF NOT EXISTS created_time TIME;

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS created_date DATE,
  ADD COLUMN IF NOT EXISTS created_time TIME;

-- ====================================================================
-- 4. BACKFILL DATA YANG SUDAH ADA (Konversi ke WIB Asia/Jakarta)
-- ====================================================================

-- Update transactions
UPDATE transactions
SET 
  occurred_date = COALESCE((occurred_at AT TIME ZONE 'Asia/Jakarta')::date, (created_at AT TIME ZONE 'Asia/Jakarta')::date),
  occurred_time = COALESCE((occurred_at AT TIME ZONE 'Asia/Jakarta')::time, (created_at AT TIME ZONE 'Asia/Jakarta')::time),
  created_date = (created_at AT TIME ZONE 'Asia/Jakarta')::date,
  created_time = (created_at AT TIME ZONE 'Asia/Jakarta')::time,
  day_type = CASE 
    WHEN EXTRACT(DOW FROM COALESCE(occurred_at, created_at) AT TIME ZONE 'Asia/Jakarta') IN (0, 6) THEN 'Weekend (Akhir Pekan)'
    ELSE 'Weekday (Hari Kerja)'
  END,
  time_bucket = CASE 
    WHEN EXTRACT(HOUR FROM COALESCE(occurred_at, created_at) AT TIME ZONE 'Asia/Jakarta') BETWEEN 5 AND 10 THEN 'Pagi (05:00 - 10:59)'
    WHEN EXTRACT(HOUR FROM COALESCE(occurred_at, created_at) AT TIME ZONE 'Asia/Jakarta') BETWEEN 11 AND 14 THEN 'Siang (11:00 - 14:59)'
    WHEN EXTRACT(HOUR FROM COALESCE(occurred_at, created_at) AT TIME ZONE 'Asia/Jakarta') BETWEEN 15 AND 18 THEN 'Sore (15:00 - 18:59)'
    ELSE 'Malam (19:00 - 04:59)'
  END
WHERE occurred_date IS NULL OR created_date IS NULL;

-- Update activities
UPDATE activities
SET 
  occurred_date = COALESCE((occurred_at AT TIME ZONE 'Asia/Jakarta')::date, (created_at AT TIME ZONE 'Asia/Jakarta')::date),
  occurred_time = COALESCE((occurred_at AT TIME ZONE 'Asia/Jakarta')::time, (created_at AT TIME ZONE 'Asia/Jakarta')::time),
  created_date = (created_at AT TIME ZONE 'Asia/Jakarta')::date,
  created_time = (created_at AT TIME ZONE 'Asia/Jakarta')::time,
  day_type = CASE 
    WHEN EXTRACT(DOW FROM COALESCE(occurred_at, created_at) AT TIME ZONE 'Asia/Jakarta') IN (0, 6) THEN 'Weekend (Akhir Pekan)'
    ELSE 'Weekday (Hari Kerja)'
  END,
  time_bucket = CASE 
    WHEN EXTRACT(HOUR FROM COALESCE(occurred_at, created_at) AT TIME ZONE 'Asia/Jakarta') BETWEEN 5 AND 10 THEN 'Pagi (05:00 - 10:59)'
    WHEN EXTRACT(HOUR FROM COALESCE(occurred_at, created_at) AT TIME ZONE 'Asia/Jakarta') BETWEEN 11 AND 14 THEN 'Siang (11:00 - 14:59)'
    WHEN EXTRACT(HOUR FROM COALESCE(occurred_at, created_at) AT TIME ZONE 'Asia/Jakarta') BETWEEN 15 AND 18 THEN 'Sore (15:00 - 18:59)'
    ELSE 'Malam (19:00 - 04:59)'
  END
WHERE occurred_date IS NULL OR created_date IS NULL;

-- Update installments & subscriptions
UPDATE installments
SET 
  created_date = (created_at AT TIME ZONE 'Asia/Jakarta')::date,
  created_time = (created_at AT TIME ZONE 'Asia/Jakarta')::time
WHERE created_date IS NULL;

UPDATE subscriptions
SET 
  created_date = (created_at AT TIME ZONE 'Asia/Jakarta')::date,
  created_time = (created_at AT TIME ZONE 'Asia/Jakarta')::time
WHERE created_date IS NULL;

-- ====================================================================
-- 5. TRIGGER OTOMATIS: AUTO POPULATE SAAT DATA BARU MASUK KE SUPABASE
-- ====================================================================

CREATE OR REPLACE FUNCTION fn_auto_populate_datetime_labels()
RETURNS TRIGGER AS $$
DECLARE
  ref_ts TIMESTAMPTZ;
  wib_dow INT;
  wib_hour INT;
BEGIN
  -- Tentukan timestamp referensi
  ref_ts := COALESCE(NEW.occurred_at, NEW.created_at, NOW());
  
  -- Set kolom tanggal dan waktu spesifik
  NEW.occurred_date := (ref_ts AT TIME ZONE 'Asia/Jakarta')::date;
  NEW.occurred_time := (ref_ts AT TIME ZONE 'Asia/Jakarta')::time;
  NEW.created_date := (COALESCE(NEW.created_at, NOW()) AT TIME ZONE 'Asia/Jakarta')::date;
  NEW.created_time := (COALESCE(NEW.created_at, NOW()) AT TIME ZONE 'Asia/Jakarta')::time;

  -- Set Day Type & Time Bucket
  wib_dow := EXTRACT(DOW FROM ref_ts AT TIME ZONE 'Asia/Jakarta');
  wib_hour := EXTRACT(HOUR FROM ref_ts AT TIME ZONE 'Asia/Jakarta');

  IF wib_dow IN (0, 6) THEN
    NEW.day_type := 'Weekend (Akhir Pekan)';
  ELSE
    NEW.day_type := 'Weekday (Hari Kerja)';
  END IF;

  IF wib_hour BETWEEN 5 AND 10 THEN
    NEW.time_bucket := 'Pagi (05:00 - 10:59)';
  ELSIF wib_hour BETWEEN 11 AND 14 THEN
    NEW.time_bucket := 'Siang (11:00 - 14:59)';
  ELSIF wib_hour BETWEEN 15 AND 18 THEN
    NEW.time_bucket := 'Sore (15:00 - 18:59)';
  ELSE
    NEW.time_bucket := 'Malam (19:00 - 04:59)';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Pasang Trigger pada transactions
DROP TRIGGER IF EXISTS trg_transactions_datetime_labels ON transactions;
CREATE TRIGGER trg_transactions_datetime_labels
BEFORE INSERT OR UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION fn_auto_populate_datetime_labels();

-- Pasang Trigger pada activities
DROP TRIGGER IF EXISTS trg_activities_datetime_labels ON activities;
CREATE TRIGGER trg_activities_datetime_labels
BEFORE INSERT OR UPDATE ON activities
FOR EACH ROW
EXECUTE FUNCTION fn_auto_populate_datetime_labels();
