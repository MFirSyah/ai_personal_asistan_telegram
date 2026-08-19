-- ====================================================================
-- SUPABASE MIGRATION: SEPARATE DATE & TIME (HH:MI) + AI ANALYTICAL LABELS
-- ====================================================================

-- 1. TAMBAHKAN / PASTIKAN KOLOM PADA TABEL TRANSACTIONS
ALTER TABLE transactions 
  ADD COLUMN IF NOT EXISTS occurred_date DATE,
  ADD COLUMN IF NOT EXISTS occurred_time TEXT,
  ADD COLUMN IF NOT EXISTS created_date DATE,
  ADD COLUMN IF NOT EXISTS created_time TEXT,
  ADD COLUMN IF NOT EXISTS category_name TEXT,
  ADD COLUMN IF NOT EXISTS subcategory_name TEXT,
  ADD COLUMN IF NOT EXISTS necessity_level TEXT,
  ADD COLUMN IF NOT EXISTS day_type TEXT,
  ADD COLUMN IF NOT EXISTS time_bucket TEXT;

-- Konversi tipe kolom menjadi TEXT (jika sebelumnya sudah dibuat TIME)
ALTER TABLE transactions 
  ALTER COLUMN occurred_time TYPE TEXT USING occurred_time::text,
  ALTER COLUMN created_time TYPE TEXT USING created_time::text;

-- 2. TAMBAHKAN / PASTIKAN KOLOM PADA TABEL ACTIVITIES
ALTER TABLE activities 
  ADD COLUMN IF NOT EXISTS occurred_date DATE,
  ADD COLUMN IF NOT EXISTS occurred_time TEXT,
  ADD COLUMN IF NOT EXISTS created_date DATE,
  ADD COLUMN IF NOT EXISTS created_time TEXT,
  ADD COLUMN IF NOT EXISTS category_name TEXT,
  ADD COLUMN IF NOT EXISTS day_type TEXT,
  ADD COLUMN IF NOT EXISTS time_bucket TEXT;

-- Konversi tipe kolom menjadi TEXT (jika sebelumnya sudah dibuat TIME)
ALTER TABLE activities 
  ALTER COLUMN occurred_time TYPE TEXT USING occurred_time::text,
  ALTER COLUMN created_time TYPE TEXT USING created_time::text;

-- 3. BACKFILL DATA LAMA TRANSACTIONS (Format Jam:Menit WIB)
UPDATE transactions
SET 
  occurred_date = COALESCE((occurred_at AT TIME ZONE 'Asia/Jakarta')::date, (created_at AT TIME ZONE 'Asia/Jakarta')::date),
  occurred_time = TO_CHAR(COALESCE(occurred_at, created_at) AT TIME ZONE 'Asia/Jakarta', 'HH24:MI'),
  created_date = (created_at AT TIME ZONE 'Asia/Jakarta')::date,
  created_time = TO_CHAR(created_at AT TIME ZONE 'Asia/Jakarta', 'HH24:MI'),
  day_type = CASE 
    WHEN EXTRACT(DOW FROM COALESCE(occurred_at, created_at) AT TIME ZONE 'Asia/Jakarta') IN (0, 6) THEN 'Weekend (Akhir Pekan)'
    ELSE 'Weekday (Hari Kerja)'
  END,
  time_bucket = CASE 
    WHEN EXTRACT(HOUR FROM COALESCE(occurred_at, created_at) AT TIME ZONE 'Asia/Jakarta') BETWEEN 5 AND 10 THEN 'Pagi (05:00 - 10:59)'
    WHEN EXTRACT(HOUR FROM COALESCE(occurred_at, created_at) AT TIME ZONE 'Asia/Jakarta') BETWEEN 11 AND 14 THEN 'Siang (11:00 - 14:59)'
    WHEN EXTRACT(HOUR FROM COALESCE(occurred_at, created_at) AT TIME ZONE 'Asia/Jakarta') BETWEEN 15 AND 18 THEN 'Sore (15:00 - 18:59)'
    ELSE 'Malam (19:00 - 04:59)'
  END;

-- 4. BACKFILL DATA LAMA ACTIVITIES (Format Jam:Menit WIB)
UPDATE activities
SET 
  occurred_date = COALESCE((occurred_at AT TIME ZONE 'Asia/Jakarta')::date, (created_at AT TIME ZONE 'Asia/Jakarta')::date),
  occurred_time = TO_CHAR(COALESCE(occurred_at, created_at) AT TIME ZONE 'Asia/Jakarta', 'HH24:MI'),
  created_date = (created_at AT TIME ZONE 'Asia/Jakarta')::date,
  created_time = TO_CHAR(created_at AT TIME ZONE 'Asia/Jakarta', 'HH24:MI'),
  day_type = CASE 
    WHEN EXTRACT(DOW FROM COALESCE(occurred_at, created_at) AT TIME ZONE 'Asia/Jakarta') IN (0, 6) THEN 'Weekend (Akhir Pekan)'
    ELSE 'Weekday (Hari Kerja)'
  END,
  time_bucket = CASE 
    WHEN EXTRACT(HOUR FROM COALESCE(occurred_at, created_at) AT TIME ZONE 'Asia/Jakarta') BETWEEN 5 AND 10 THEN 'Pagi (05:00 - 10:59)'
    WHEN EXTRACT(HOUR FROM COALESCE(occurred_at, created_at) AT TIME ZONE 'Asia/Jakarta') BETWEEN 11 AND 14 THEN 'Siang (11:00 - 14:59)'
    WHEN EXTRACT(HOUR FROM COALESCE(occurred_at, created_at) AT TIME ZONE 'Asia/Jakarta') BETWEEN 15 AND 18 THEN 'Sore (15:00 - 18:59)'
    ELSE 'Malam (19:00 - 04:59)'
  END;

-- 5. TRIGGER OTOMATIS: AUTO POPULATE (HH:MI) SAAT ADA DATA BARU MASUK
CREATE OR REPLACE FUNCTION fn_auto_populate_datetime_labels()
RETURNS TRIGGER AS $$
DECLARE
  ref_ts TIMESTAMPTZ;
  wib_dow INT;
  wib_hour INT;
BEGIN
  ref_ts := COALESCE(NEW.occurred_at, NEW.created_at, NOW());
  
  NEW.occurred_date := (ref_ts AT TIME ZONE 'Asia/Jakarta')::date;
  NEW.occurred_time := TO_CHAR(ref_ts AT TIME ZONE 'Asia/Jakarta', 'HH24:MI');
  NEW.created_date := (COALESCE(NEW.created_at, NOW()) AT TIME ZONE 'Asia/Jakarta')::date;
  NEW.created_time := TO_CHAR(COALESCE(NEW.created_at, NOW()) AT TIME ZONE 'Asia/Jakarta', 'HH24:MI');

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

DROP TRIGGER IF EXISTS trg_transactions_datetime_labels ON transactions;
CREATE TRIGGER trg_transactions_datetime_labels
BEFORE INSERT OR UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION fn_auto_populate_datetime_labels();

DROP TRIGGER IF EXISTS trg_activities_datetime_labels ON activities;
CREATE TRIGGER trg_activities_datetime_labels
BEFORE INSERT OR UPDATE ON activities
FOR EACH ROW
EXECUTE FUNCTION fn_auto_populate_datetime_labels();
