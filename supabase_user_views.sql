-- ==============================================================================
-- PANDUAN & SKRIP SQL ISOLASI DATA PER USER UNTUK SUPABASE
-- ==============================================================================
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New Query
-- Skrip ini TIDAK mengubah data apapun yang sudah ada (aman 100%).
-- ==============================================================================

-- 1. QUERY MONITORING: CEK RINGKASAN DATA SEMUA USER
-- Gunakan query ini untuk melihat berapa banyak transaksi & agenda per user
SELECT 
    u.id AS user_uuid,
    u.name AS user_name,
    u.telegram_id,
    COUNT(DISTINCT t.id) AS total_transaksi,
    COUNT(DISTINCT a.id) AS total_agenda,
    COUNT(DISTINCT i.id) AS total_cicilan,
    COUNT(DISTINCT s.id) AS total_langganan
FROM public.users u
LEFT JOIN public.transactions t ON t.user_id = u.id AND t.deleted_at IS NULL
LEFT JOIN public.activities a ON a.user_id = u.id AND a.deleted_at IS NULL
LEFT JOIN public.installments i ON i.user_id = u.id
LEFT JOIN public.subscriptions s ON s.user_id = u.id
GROUP BY u.id, u.name, u.telegram_id
ORDER BY total_transaksi DESC;


-- 2. QUERY PENGECEKAN DATA SPESIFIK 1 USER (GANTI 'UUID_USER_DISINI')
-- Contoh: Melihat transaksi hanya milik user tertentu:
-- SELECT * FROM public.transactions WHERE user_id = 'UUID_USER_DISINI' ORDER BY occurred_at DESC;


-- 3. MEMBUAT DATABASE VIEW (TABEL VIRTUAL) KHUSUS USER TERTENTU
-- Jika kamu ingin ada menu khusus di Table Editor Supabase per user, 
-- cukup jalankan template di bawah (Ganti 'firman' dan UUID sesuai user kamu):

/*
-- View Transaksi Firman
CREATE OR REPLACE VIEW view_transaksi_firman AS
SELECT 
    t.id,
    t.occurred_at AS tanggal,
    t.type AS tipe,
    t.amount AS nominal,
    t.merchant,
    t.description AS deskripsi,
    t.payment_method AS metode_bayar
FROM public.transactions t
JOIN public.users u ON u.id = t.user_id
WHERE u.name ILIKE '%firman%' AND t.deleted_at IS NULL
ORDER BY t.occurred_at DESC;

-- View Agenda Firman
CREATE OR REPLACE VIEW view_agenda_firman AS
SELECT 
    a.id,
    a.title AS judul_agenda,
    a.description AS deskripsi,
    a.status,
    a.priority AS prioritas,
    a.occurred_at AS jadwal
FROM public.activities a
JOIN public.users u ON u.id = a.user_id
WHERE u.name ILIKE '%firman%' AND a.deleted_at IS NULL
ORDER BY a.occurred_at ASC;
*/

-- ==============================================================================
-- TIPS SUPABASE TABLE EDITOR:
-- Di menu Table Editor Supabase, kamu juga bisa langsung klik tombol "Filter" 
-- di kanan atas tabel -> Add Filter: "user_id" -> "Equals" -> [Pilih UUID User].
-- ==============================================================================
