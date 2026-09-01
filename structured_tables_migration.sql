-- ====================================================================
-- MASTER SQL MIGRATION: ENTERPRISE & SKRIPSI-GRADE STRUCTURED SCHEMA
-- Target Database: Supabase PostgreSQL (Raphael Ecosystem)
-- User: Mas Firman (fc2758d3-78bb-4e22-b9f0-b3b16568b671)
-- Versi Skema: v3.2.0 (Super Lengkap & Future-Proof)
-- ====================================================================

-- 1. TABEL UTAMA: FINANCIAL LEDGER (TRANSAKSI KEUANGAN TERSTRUKTUR & LENGKAP)
CREATE TABLE IF NOT EXISTS financial_ledger (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL,
    occurred_date DATE NOT NULL,
    occurred_time VARCHAR(5) NOT NULL, -- HH:MI (Format 24 Jam WIB)
    created_date DATE NOT NULL,
    created_time VARCHAR(5) NOT NULL,  -- HH:MI (Format 24 Jam WIB)
    day_type VARCHAR(30) NOT NULL,     -- 'Weekday (Hari Kerja)' / 'Weekend (Akhir Pekan)'
    time_bucket VARCHAR(30) NOT NULL,  -- 'Pagi', 'Siang', 'Sore', 'Malam', 'Dini Hari'
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    amount NUMERIC(15, 2) NOT NULL,
    wallet_name VARCHAR(50) NOT NULL,  -- 'Cash Kertas', 'Cash Koin', 'Gopay Driver', 'SeaBank', 'Bank Jago'
    category VARCHAR(100) NOT NULL,    -- 'Transportasi/Bensin', 'Konsumsi/Makan', 'Cicilan', 'Skripsi', 'Jajan', dll.
    subcategory VARCHAR(100),          -- 'Pertalite Beat FI', 'Makan Siang', 'Angsuran Jago', dll.
    necessity_level VARCHAR(50),       -- 'Kebutuhan Pokok (50%)', 'Keinginan (30%)', 'Tabungan/Investasi (20%)'
    description TEXT NOT NULL,
    merchant_or_entity VARCHAR(100),   -- Nama toko / SPBU / Bank / Pihak terkait
    source_channel VARCHAR(30) DEFAULT 'manual', -- 'telegram_ocr', 'mobile_crud', 'chat_ai', 'manual'
    
    -- Atribut Rekomendasi Ekstensibel Masa Depan:
    receipt_image_url TEXT,            -- Bukti fisik/foto struk OCR
    is_recurring BOOLEAN DEFAULT FALSE,-- Penanda tagihan rutin bulanan (Cashflow Forecasting)
    sinking_fund_tag VARCHAR(50),      -- Tag pos dana terencana: 'pajak_stnk_beat', 'touring_dieng', 'dana_darurat'
    is_business_ops BOOLEAN DEFAULT FALSE, -- Pemisah modal narik Gojek vs belanja pribadi
    split_with_person TEXT,            -- Nama rekan patungan split bill
    split_settled BOOLEAN DEFAULT TRUE,-- Status lunas/tunggakan uang patungan
    fuel_liters NUMERIC(6, 2),         -- Liter bensin jika transaksi BBM
    odometer_km NUMERIC(10, 2),        -- KM motor saat transaksi
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABEL UTAMA: USER ACTIVITIES (AGENDA & PRODUKTIVITAS TERSTRUKTUR & LENGKAP)
CREATE TABLE IF NOT EXISTS user_activities (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,    -- 'Skripsi Telkom University', 'Touring Dieng', 'Ojol Gojek', 'Pribadi', 'Ibadah'
    occurred_date DATE NOT NULL,
    occurred_time VARCHAR(5) NOT NULL, -- HH:MI (Format 24 Jam WIB)
    created_date DATE NOT NULL,
    created_time VARCHAR(5) NOT NULL,  -- HH:MI (Format 24 Jam WIB)
    day_type VARCHAR(30) NOT NULL,
    time_bucket VARCHAR(30) NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    priority_level VARCHAR(30) DEFAULT 'Medium', -- 'High (Mendesak/Penting)', 'Medium', 'Low'
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    location VARCHAR(255),
    collision_flag BOOLEAN DEFAULT FALSE,
    notes TEXT,
    
    -- Atribut Rekomendasi Produktivitas Masa Depan:
    travel_buffer_minutes INTEGER DEFAULT 30, -- Buffer perjalanan (misal 35 menit bimbingan)
    milestone_tag VARCHAR(50),               -- 'skripsi_bab_4', 'skripsi_bab_5', 'touring_dieng_h1'
    eisenhower_quadrant VARCHAR(30),         -- 'Q1: Urgent & Important', 'Q2: Important Not Urgent', etc.
    progress_percent INTEGER DEFAULT 0,       -- 0 - 100% progres tugas
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =========================================================================
-- 2B. TABEL KHUSUS: REGISTRASI MULTI-KENDARAAN DINAMIS (DYNAMIC VEHICLE FLEET)
-- =========================================================================
CREATE TABLE IF NOT EXISTS registered_vehicles (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL,
    vehicle_name VARCHAR(100) NOT NULL, -- Contoh: 'Honda Beat FI', 'Honda Vario 160', 'Yamaha NMAX'
    plate_number VARCHAR(20) NOT NULL,  -- Contoh: 'N 4321 ABC'
    manufacture_year INTEGER DEFAULT 2018,
    fuel_tank_capacity NUMERIC(4, 2) DEFAULT 3.7, -- Kapasitas tangki Beat FI (3.7 Liter)
    oil_capacity_liters NUMERIC(4, 2) DEFAULT 0.8, -- Kapasitas oli mesin (0.8 Liter)
    current_odometer_km NUMERIC(10, 2) DEFAULT 14850.0,
    last_oil_service_km NUMERIC(10, 2) DEFAULT 14000.0, -- Servis oli terakhir
    last_gardan_service_km NUMERIC(10, 2) DEFAULT 10000.0, -- Servis oli gardan terakhir
    last_cvt_service_km NUMERIC(10, 2) DEFAULT 12000.0, -- Servis CVT & Roller terakhir
    is_active_vehicle BOOLEAN DEFAULT TRUE, -- Kendaraan utama yang sedang aktif dipakai
    stnk_expiry_date DATE DEFAULT '2027-08-20',
    tax_annual_cost NUMERIC(12, 2) DEFAULT 250000.0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 2C. TABEL KHUSUS: TARGET TABUNGAN & SINKING FUNDS (GOALS & SINKING FUNDS)
-- =========================================================================
CREATE TABLE IF NOT EXISTS goals_and_sinking_funds (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL,
    goal_name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'sinking_fund_stnk', 'touring_dieng', 'dana_darurat', 'pelunasan_jago'
    target_amount NUMERIC(15, 2) NOT NULL,
    current_saved_amount NUMERIC(15, 2) DEFAULT 0,
    deadline_date DATE,
    priority_level VARCHAR(30) DEFAULT 'High',
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'reached', 'paused')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABEL KHUSUS: LOG PEMELIHARAAN KENDARAAN (HONDA BEAT FI N 4321 ABC)
CREATE TABLE IF NOT EXISTS vehicle_maintenance_logs (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL,
    vehicle_name VARCHAR(100) DEFAULT 'Honda Beat FI (N 4321 ABC)',
    service_type VARCHAR(100) NOT NULL, -- 'Ganti Oli Mesin', 'Ganti Oli Gardan', 'Servis CVT & Roller', 'Ganti Ban/Kampas'
    odometer_at_service NUMERIC(10, 2) NOT NULL,
    next_due_odometer NUMERIC(10, 2) NOT NULL,
    cost NUMERIC(12, 2) DEFAULT 0,
    workshop_name VARCHAR(150),
    service_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABEL KHUSUS: PAGU ANGGARAN WISATA & TOURING (TRIP TO DIENG)
CREATE TABLE IF NOT EXISTS trip_budgets (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL,
    trip_name VARCHAR(150) DEFAULT 'Touring Wisata Pegunungan Dieng',
    allocated_budget NUMERIC(15, 2) NOT NULL, -- Pagu Rp 1.040.000
    realized_expense NUMERIC(15, 2) DEFAULT 0,
    target_start_date DATE,
    target_end_date DATE,
    status VARCHAR(30) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'archived')),
    checklist_json JSONB, -- Checklist logistik: polar tebal, homestay water heater, sarung tangan, obat
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ALIAS VIEW UNTUK KOMPATIBILITAS BACKWARD SUPABASE (transactions & activities)
CREATE OR REPLACE VIEW transactions AS SELECT * FROM financial_ledger;
CREATE OR REPLACE VIEW activities AS SELECT * FROM user_activities;

-- 6. MIGRASI DATA EKSISTING MAS FIRMAN (ZERO DATA LOSS SEED)
INSERT INTO financial_ledger (
    id, user_id, occurred_date, occurred_time, created_date, created_time,
    day_type, time_bucket, type, amount, wallet_name,
    category, subcategory, necessity_level, description, merchant_or_entity, source_channel,
    is_recurring, sinking_fund_tag, is_business_ops
) VALUES 
('tx-seed-001', 'fc2758d3-78bb-4e22-b9f0-b3b16568b671', '2026-08-28', '18:30', '2026-08-28', '18:30', 'Weekday (Hari Kerja)', 'Malam (18:00 - 23:59)', 'income', 279000, 'Cash Kertas', 'Saldo Awal', 'Kas Fisik', 'Tabungan/Investasi (20%)', 'Saldo Uang Kas Kertas Fisik Dompet', 'Dompet Fisik', 'manual', FALSE, 'dana_darurat', FALSE),
('tx-seed-002', 'fc2758d3-78bb-4e22-b9f0-b3b16568b671', '2026-08-28', '18:30', '2026-08-28', '18:30', 'Weekday (Hari Kerja)', 'Malam (18:00 - 23:59)', 'income', 9500, 'Cash Koin', 'Saldo Awal', 'Kas Fisik', 'Tabungan/Investasi (20%)', 'Saldo Uang Kas Koin Fisik Saku', 'Dompet Koin', 'manual', FALSE, NULL, FALSE),
('tx-seed-003', 'fc2758d3-78bb-4e22-b9f0-b3b16568b671', '2026-08-28', '18:30', '2026-08-28', '18:30', 'Weekday (Hari Kerja)', 'Malam (18:00 - 23:59)', 'income', 139000, 'Gopay Driver', 'Saldo Awal', 'E-Wallet', 'Kebutuhan Pokok (50%)', 'Saldo E-Wallet Gopay Driver', 'Gojek Driver App', 'manual', FALSE, NULL, TRUE),
('tx-seed-004', 'fc2758d3-78bb-4e22-b9f0-b3b16568b671', '2026-08-20', '09:00', '2026-08-20', '09:00', 'Weekday (Hari Kerja)', 'Pagi (05:00 - 10:59)', 'expense', 67940, 'Bank Jago', 'Cicilan & Hutang', 'Angsuran Jago', 'Kebutuhan Pokok (50%)', 'Pembayaran Angsuran Bulanan Bank Jago (Jatuh Tempo Tgl 20)', 'Bank Jago', 'mobile_crud', TRUE, NULL, FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_activities (
    id, user_id, title, category, occurred_date, occurred_time, created_date, created_time,
    day_type, time_bucket, duration_minutes, priority_level, status, location, notes,
    travel_buffer_minutes, milestone_tag, eisenhower_quadrant, progress_percent
) VALUES 
('act-seed-001', 'fc2758d3-78bb-4e22-b9f0-b3b16568b671', 'Bimbingan Skripsi Bab 4-5 dengan Pak Sulthan', 'Skripsi Telkom University', '2026-08-29', '09:00', '2026-08-28', '20:00', 'Weekend (Akhir Pekan)', 'Pagi (05:00 - 10:59)', 60, 'High (Mendesak/Penting)', 'in_progress', 'Telkom University / Online', 'Fokus pembahasan implementasi sistem AI data driven dan pengujian mobile app.', 35, 'skripsi_bab_4', 'Q1: Urgent & Important', 85)
ON CONFLICT (id) DO NOTHING;

-- Seed Data Motor Beat FI
INSERT INTO vehicle_maintenance_logs (
    id, user_id, service_type, odometer_at_service, next_due_odometer, cost, workshop_name, service_date, notes
) VALUES 
('veh-seed-001', 'fc2758d3-78bb-4e22-b9f0-b3b16568b671', 'Servis CVT & Pembersihan Roller', 45200, 47000, 75000, 'AHASS Sidoarjo / Mitra Mandiri', '2026-08-25', 'Pengecekan vanbelt dan roller CVT jelang touring Dieng')
ON CONFLICT (id) DO NOTHING;

-- Seed Data Pagu Touring Dieng
INSERT INTO trip_budgets (
    id, user_id, allocated_budget, realized_expense, target_start_date, target_end_date, checklist_json
) VALUES 
('trip-seed-001', 'fc2758d3-78bb-4e22-b9f0-b3b16568b671', 1040000, 0, '2026-09-15', '2026-09-18', '{"items": ["Pakaian polar tebal", "Homestay water heater", "Sarung tangan windproof", "Obat pribadi & tolak angin", "KTP & STNK Asli Beat FI"]}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 7. FUNCTION UNTUK AI CONTEXTUAL INGESTION & BACKFILL OTOMATIS
CREATE OR REPLACE FUNCTION ai_backfill_missing_attributes()
RETURNS VOID AS $$
BEGIN
  -- Backfill fuel_liters otomatis jika ada deskripsi BBM Pertalite
  UPDATE financial_ledger
  SET fuel_liters = ROUND(amount / 10000.0, 2)
  WHERE fuel_liters IS NULL AND (LOWER(description) LIKE '%pertalite%' OR LOWER(subcategory) LIKE '%pertalite%');

  -- Backfill recurring tagihan Bank Jago
  UPDATE financial_ledger
  SET is_recurring = TRUE
  WHERE is_recurring IS FALSE AND (LOWER(description) LIKE '%jago%' OR LOWER(category) LIKE '%cicilan%');

  -- Backfill Sinking Fund Tag STNK
  UPDATE financial_ledger
  SET sinking_fund_tag = 'pajak_stnk_beat'
  WHERE sinking_fund_tag IS NULL AND (LOWER(description) LIKE '%stnk%' OR LOWER(description) LIKE '%pajak motor%');

  -- Backfill day_type & time_bucket jika belum terisi
  UPDATE financial_ledger
  SET 
    day_type = CASE 
      WHEN EXTRACT(DOW FROM occurred_date) IN (0, 6) THEN 'Weekend (Akhir Pekan)'
      ELSE 'Weekday (Hari Kerja)'
    END,
    time_bucket = CASE 
      WHEN EXTRACT(HOUR FROM occurred_time::time) BETWEEN 5 AND 10 THEN 'Pagi (05:00 - 10:59)'
      WHEN EXTRACT(HOUR FROM occurred_time::time) BETWEEN 11 AND 14 THEN 'Siang (11:00 - 14:59)'
      WHEN EXTRACT(HOUR FROM occurred_time::time) BETWEEN 15 AND 17 THEN 'Sore (15:00 - 17:59)'
      WHEN EXTRACT(HOUR FROM occurred_time::time) BETWEEN 18 AND 23 THEN 'Malam (18:00 - 23:59)'
      ELSE 'Dini Hari (00:00 - 04:59)'
    END
  WHERE day_type IS NULL OR time_bucket IS NULL;
END;
$$ LANGUAGE plpgsql;
-- SEED DATA REGISTRASI KENDARAAN AWAL (HONDA BEAT FI)
INSERT INTO registered_vehicles (
    id, user_id, vehicle_name, plate_number, manufacture_year,
    fuel_tank_capacity, oil_capacity_liters, current_odometer_km,
    last_oil_service_km, last_gardan_service_km, last_cvt_service_km,
    is_active_vehicle, stnk_expiry_date, tax_annual_cost, notes
) VALUES (
    'veh-001', 'fc2758d3-78bb-4e22-b9f0-b3b16568b671', 'Honda Beat FI', 'N 4321 ABC', 2018,
    3.7, 0.8, 14850.0,
    14000.0, 10000.0, 12000.0,
    TRUE, '2027-08-20', 250000.0, 'Motor operasional utama sehari-hari, skripsi, narik Gojek, dan touring Dieng'
) ON CONFLICT (id) DO NOTHING;

-- SEED DATA TARGET POS TABUNGAN & SINKING FUND AWAL
INSERT INTO goals_and_sinking_funds (
    id, user_id, goal_name, category, target_amount, current_saved_amount, deadline_date, priority_level, status, notes
) VALUES 
('goal-001', 'fc2758d3-78bb-4e22-b9f0-b3b16568b671', 'Pajak STNK & Plat Beat FI', 'sinking_fund_stnk', 250000, 150000, '2027-08-20', 'High', 'active', 'Pos tabungan tahunan STNK motor Beat FI N 4321 ABC'),
('goal-002', 'fc2758d3-78bb-4e22-b9f0-b3b16568b671', 'Pagu Wisata Touring Dieng 2026', 'touring_dieng', 1040000, 600000, '2026-08-30', 'High', 'active', 'Pagu anggaran bensin, homestay, tiket wisata Dieng Wonosobo'),
('goal-003', 'fc2758d3-78bb-4e22-b9f0-b3b16568b671', 'Dana Darurat Kas Dompet', 'dana_darurat', 500000, 279000, '2026-12-31', 'Medium', 'active', 'Cadangan uang dingin kas kertas fisik dompet')
ON CONFLICT (id) DO NOTHING;
