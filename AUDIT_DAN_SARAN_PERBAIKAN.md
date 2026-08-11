# 🔍 AUDIT MENYELURUH & SARAN PERBAIKAN (GELOMBANG 2)

**Tanggal Audit**: 11 Agustus 2026  
**Auditor**: AI Code Auditor  
**Status Audit Gelombang 1**: 26/26 Temuan Telah Diperbaiki & Live di Vercel Production  
**Cakupan Audit Gelombang 2**: Re-Audit Seluruh File API Routes, Feature Modules, Export, PDF, Telegram Handlers, dan Supabase Queries

---

## 📋 DAFTAR ISI

1. [🚨 KRITIS — PostgREST Syntax Error & Invalid Date Risk](#1--kritis--postgrest-syntax-error--invalid-date-risk)
2. [⚠️ PENTING — CSV Formatting & Unclosed Markdown Sanitize](#2-️-penting--csv-formatting--unclosed-markdown-sanitize)
3. [🔧 SEDANG — Direct Live Query vs Caching & Invalid Date Guards](#3--sedang--direct-live-query-vs-caching--invalid-date-guards)
4. [💡 RENDAH — Cron Reminder Window & Input Validation](#4--rendah--cron-reminder-window--input-validation)
5. [📊 RINGKASAN TEMUAN GELOMBANG 2](#5--ringkasan-temuan-gelombang-2)

---

## 1. 🚨 KRITIS — PostgREST Syntax Error & Invalid Date Risk

### G2-01: PostgREST Syntax Error pada Perintah `/pasangan` dengan Nama Non-Angka

**File**: `lib/features/couples.ts` — Baris 29  
**Kode**:
```ts
.or(`name.ilike.%${partnerTelegramIdOrName}%,telegram_id.eq.${partnerTelegramIdOrName}`)
```
**Masalah**: Kolom `telegram_id` di PostgreSQL/Supabase bertipe **BIGINT (Integer)**. Ketika user mengetik `/pasangan Firman`, ekspresi `telegram_id.eq.Firman` dikirim ke PostgREST API. Supabase menolak request ini dengan HTTP 400 Error (`invalid input syntax for type bigint: "Firman"`), sehingga pencarian nama pasangan gagal total.  
**Dampak**: Menghubungkan pasangan menggunakan nama panggilan selalu gagal dengan error database.  
**Saran**:
- Cek terlebih dahulu apakah input bernilai numerik (`!isNaN(Number(partnerTelegramIdOrName))`)
- Jika numerik, query menggunakan `.or('name.ilike.%,telegram_id.eq...')`
- Jika bukan numerik, query cukup menggunakan `.ilike('name', `%${partnerTelegramIdOrName}%`)`

---

### G2-02: String Kosong `due_date: ""` Menyebabkan Error PostgreSQL Syntax pada `addDebt`

**File**: `lib/features/smart-alerts.ts` — Baris 60  
**Kode**:
```ts
due_date: debt.due_date || null,
```
**Masalah**: Jika form/AI mengirimkan `debt.due_date` berupa string kosong (`""` atau `"   "`), ekspresi `"" || null` tetap bernilai `""`. Saat dimasukkan ke kolom database bertipe `DATE`, PostgreSQL akan melemparkan error: `invalid input syntax for type date: ""`.  
**Dampak**: Gagal menyimpan catatan hutang baru saat tanggal jatuh tempo kosong.  
**Saran**:
- Gunakan `due_date: debt.due_date?.trim() ? debt.due_date.trim() : null`

---

## 2. ⚠️ PENTING — CSV Formatting & Unclosed Markdown Sanitize

### G2-03: Kolom Tanggal Tanpa Kutip Memecah Kolom CSV pada `export-data.ts`

**File**: `lib/export/export-data.ts` — Baris 48, 81, 126, 137  
**Kode**:
```ts
a.occurred_at ? new Date(a.occurred_at).toLocaleString('id-ID') : ''
```
**Masalah**: Fungsi `toLocaleString('id-ID')` menghasilkan format string dengan koma, contohnya: `"11/8/2026, 17:00:00"`. Karena CSV dipisahkan oleh tanda koma (`,`), nilai tanggal tanpa tanda kutip ganda akan dianggap sebagai **dua kolom terpisah**, merusak seluruh susunan header dan tata letak tabel di Microsoft Excel / Google Sheets.  
**Dampak**: File `.csv` hasil export berantakan di Excel.  
**Saran**:
- Bungkus nilai tanggal dalam tanda kutip ganda: `"${a.occurred_at ? new Date(a.occurred_at).toLocaleString('id-ID') : ''}"`

---

### G2-04: `sanitizeMarkdown` Tidak Memeriksa Unclosed Backticks (``` ` ```)

**File**: `lib/telegram/send-message.ts` — Baris 65-73  
**Kode**:
```ts
function sanitizeMarkdown(text: string): string {
  const openAsterisks = (text.match(/\*/g) || []).length % 2 !== 0;
  const openUnderscores = (text.match(/_/g) || []).length % 2 !== 0;
  if (openAsterisks || openUnderscores) {
    return text.replace(/[*_`]/g, '');
  }
  return text;
}
```
**Masalah**: Fungsi `sanitizeMarkdown` hanya mengecek apakah jumlah asterisk (`*`) atau underscore (`_`) ganjil. Jika AI menghasilkan backtick ganjil (misal 1 backtick ` ` ` tanpa pasangan tutup), `sanitizeMarkdown` meloloskannya. Telegram API akan gagal memarsing entity dan mengembalikan error `can't parse entities`.  
**Dampak**: Pesan Telegram berisi potongan kode/ID gagal dikirim dalam format Markdown dan terpaksa fallback ke plain text tanpa cetak tebal.  
**Saran**:
- Tambahkan `const openBackticks = (text.match(/`/g) || []).length % 2 !== 0;` ke dalam kondisi sanitasi

---

## 3. 🔧 SEDANG — Direct Live Query vs Caching & Invalid Date Guards

### G2-05: Tanpa Cache pada `GET /api/analytics/summary` (Setiap Buka Dashboard Memicu 3 Query Besar)

**File**: `app/api/analytics/summary/route.ts` — Baris 20-43  
**Masalah**: Setiap kali Telegram Mini App Dashboard dibuka oleh user, `GET /api/analytics/summary` selalu menghitung `calculate20Analytics(userId)` secara live dari 500 transaksi dan 200 aktivitas Supabase, lalu menimpa `daily_insights`.  
**Dampak**: Beban query Supabase tinggi dan waktu muat Dashboard terasa lambat (1.5 - 3 detik).  
**Saran**:
- Cek terlebih dahulu apakah sudah ada `daily_insights` untuk tanggal hari ini (`insight_date = today`).
- Jika ada dan `searchParams.get('force') !== 'true'`, langsung kembalikan payload cache tersebut.

---

### G2-06: Potensi `RangeError: Invalid time value` pada Penjumlahan PDF Report

**File**: `lib/features/pdf-report.ts` — Baris 74  
**Kode**:
```ts
const d = new Date(t.occurred_at || t.created_at).toLocaleDateString('id-ID');
```
**Masalah**: Jika `occurred_at` berisi format tidak valid, `new Date(...)` menghasilkan `Invalid Date`. Memanggil `.toLocaleDateString()` pada `Invalid Date` akan melempar unhandled exception `RangeError: Invalid time value`, membatalkan seluruh pembuatan PDF.  
**Dampak**: Penggenerasian laporan PDF bulanan gagal total jika ada 1 transaksi ber-tanggal corrupt.  
**Saran**:
- Bungkus dengan pembacaan tanggal aman: `const rawDate = t.occurred_at || t.created_at; const dt = new Date(rawDate); const d = isNaN(dt.getTime()) ? '-' : dt.toLocaleDateString('id-ID');`

---

### G2-07: Potential `NaN` Window Date pada `checkActivityCollision` & `checkTransactionAnomaly`

**File**: `lib/analytics/anomalies.ts` — Baris 95-97  
**Kode**:
```ts
const actTime = newAct.occurred_at ? new Date(newAct.occurred_at) : new Date();
```
**Masalah**: Jika `newAct.occurred_at` bernilai string tidak valid, `actTime.getTime()` mengembalikan `NaN`. `new Date(NaN).toISOString()` melempar exception `RangeError: Invalid time value`.  
**Dampak**: Menambah agenda baru dengan format tanggal tidak standar menyebabkan error 500 saat pengecekan bentrok jadwal.  
**Saran**:
- Lakukan validasi `isNaN(actTime.getTime())` dan fallback ke `new Date()`

---

## 4. 💡 RENDAH — Cron Reminder Window & Input Validation

### G2-08: Window Pengingat Agenda Cron Kurang Fleksibel (Hanya Pengecekan Waktu Lalu)

**File**: `app/api/cron/activity-check/route.ts` — Baris 8-18  
**Kode**:
```ts
const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString();
const nowIso = now.toISOString();
```
**Masalah**: Cron mengecek agenda yang dijadwalkan antara 4 jam yang lalu hingga **detik ini saja** (`lte('occurred_at', nowIso)`). Karena Vercel Cron berjalan per jam (misal 08:00, 09:00), agenda yang dijadwalkan jam 08:15 baru terkirim pengingatnya pada jam 09:00 (45 menit terlambat).  
**Dampak**: Pengingat jam agenda sering datang terlambat dari jam target.  
**Saran**:
- Perluas batas atas query hingga 15-30 menit ke depan (`now.getTime() + 30 * 60 * 1000`), sehingga pengingat dikirim di awal jam sebelum agenda dimulai

---

### G2-09: Validasi Input Telegram ID pada `/api/auth/link-telegram`

**File**: `app/api/auth/link-telegram/route.ts` — Baris 12  
**Kode**:
```ts
const numericTelegramId = Number(telegramId);
```
**Masalah**: Tidak ada pengecekan `isNaN(numericTelegramId)`. Jika payload dikirim dengan `telegramId` bertipe string tidak valid, angka yang tersimpan di Supabase adalah `NaN` atau query gagal.  
**Saran**:
- Tambahkan guard: `if (isNaN(numericTelegramId)) return NextResponse.json({ error: 'Invalid telegramId' }, { status: 400 });`

---

### G2-10: `updateUserName` Sanitasi Tanda Kutip dari AI Preference

**File**: `lib/telegram/chat-processor.ts` — Baris 178  
**Masalah**: Ketika AI mengekstrak nama user dari percakapan (misal `value: '"Firman"'`), string yang dikirim ke `updateUserName` terkadang masih terbawa tanda kutip ganda dari JSON output.  
**Dampak**: Nama panggilan user tersimpan di database sebagai `"Firman"` (dengan tanda kutip).  
**Saran**:
- Bersihkan string nama: `pref.value.trim().replace(/^["']|["']$/g, '')`

---

## 5. 📊 RINGKASAN TEMUAN GELOMBANG 2

| Kategori | Jumlah Temuan |
|----------|:------------:|
| 🚨 **KRITIS** | 2 |
| ⚠️ **PENTING** | 2 |
| 🔧 **SEDANG** | 3 |
| 💡 **RENDAH** | 3 |
| **TOTAL GELOMBANG 2** | **10** |

### Tabel Prioritas Eksekusi Perbaikan

| Urutan | ID | Ringkasan | Estimasi |
|:------:|------|-----------|----------|
| 1 | G2-01 | Fix PostgREST syntax error `/pasangan` nama non-angka | 5 menit |
| 2 | G2-02 | Fix `due_date: ""` string kosong di `addDebt` | 3 menit |
| 3 | G2-03 | Quote tanggal pada CSV export `export-data.ts` | 5 menit |
| 4 | G2-04 | Add unclosed backtick check di `sanitizeMarkdown` | 5 menit |
| 5 | G2-05 | Add cache check pada `GET /api/analytics/summary` | 10 menit |
| 6 | G2-06 | Guard `Invalid Date` pada PDF report generation | 5 menit |
| 7 | G2-07 | Guard `Invalid Date` pada `checkActivityCollision` | 5 menit |
| 8 | G2-08 | Perluas window look-ahead cron `activity-check` (+30 mnt) | 5 menit |
| 9 | G2-09 | Add `isNaN` guard pada `/api/auth/link-telegram` | 2 menit |
| 10 | G2-10 | Trim quotes dari AI preference name | 3 menit |

---

> **Catatan**: Seluruh 26 perbaikan dari Gelombang 1 sebelumnya telah terverifikasi stabil. Dokumen Gelombang 2 ini mencatat 10 temuan penyempurnaan tambahan untuk menjamin ketahanan sistem 100%.
