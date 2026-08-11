# 🔍 AUDIT MENYELURUH & SARAN PERBAIKAN (GELOMBANG 3)

**Tanggal Audit**: 11 Agustus 2026  
**Auditor**: AI Code Auditor  
**Status Audit Sebelumnya**: 
- Gelombang 1: 26/26 Temuan Selesai & Terverifikasi
- Gelombang 2: 10/10 Temuan Selesai & Live di Vercel Production
**Cakupan Audit Gelombang 3**: Audit Ketahanan Parsing JSON AI, Pemrosesan Suara & Struk, Batch Cron Performance, Caching & Fallback Visual

---

## 📋 DAFTAR ISI

1. [🚨 KRITIS — AI JSON Parsing & Category Sprawl](#1--kritis--ai-json-parsing--category-sprawl)
2. [⚠️ PENTING — Unhandled HTTP Audio Fetch & QuickChart Fallback](#2-️-penting--unhandled-http-audio-fetch--quickchart-fallback)
3. [🔧 SEDANG — Batching Cron Daily Insight & Safe Burn Rate](#3--sedang--batching-cron-daily-insight--safe-burn-rate)
4. [💡 RENDAH — Shared Goal Input Guard & Categorize Backtick Strip](#4--rendah--shared-goal-input-guard--categorize-backtick-strip)
5. [📊 RINGKASAN TEMUAN GELOMBANG 3](#5--ringkasan-temuan-gelombang-3)

---

## 1. 🚨 KRITIS — AI JSON Parsing & Category Sprawl

### G3-01: Direct `JSON.parse` Tanpa Strip Backticks pada `daily-briefing.ts`

**File**: `lib/gemini/prompts/daily-briefing.ts` — Baris 57  
**Kode**:
```ts
const parsed = JSON.parse(response.text || '{}');
```
**Masalah**: Ketika Gemini AI mengembalikan teks JSON yang terbungkus markdown code block (contoh: ` ```json { "messages": [...] } ``` `), panggilan `JSON.parse` langsung melempar exception `SyntaxError: Unexpected token '`'` dan berpindah ke blok `catch`.  
**Dampak**: Morning briefing harian gagal ter-generate dan jatuh ke teks fallback generik statis.  
**Saran**:
- Bersihkan pembungkus markdown sebelum diparsing:  
  `const rawText = (response.text || '').replace(/```json/gi, '').replace(/```/g, '').trim();`  
  `const parsed = JSON.parse(rawText || '{}');`

---

### G3-02: Penumpukan Kategori Spesifik Toko pada OCR Struk `receipt-processor.ts`

**File**: `lib/telegram/receipt-processor.ts` — Baris 41-42  
**Kode**:
```ts
const categoryName = ocrResult.merchant || 'Struk Belanja';
const category = await getOrCreateCategory(userId, categoryName);
```
**Masalah**: Setiap foto struk baru yang diproses akan secara otomatis membuat kategori dengan nama **merchant toko tersebut** (misalnya kategori `"Indomaret"`, `"Starbucks"`, `"Kopi Kenangan"`, `"Alfamart"`). Dalam 1 bulan, tabel `categories` user akan dipenuhi oleh puluhan nama toko spesifik, bukan kategori finansial umum.  
**Dampak**: Distribusi kategori pengeluaran dan grafik pie chart menjadi acak-acakan dan sulit dianalisis.  
**Saran**:
- Gunakan modul kategorisasi untuk mengelompokkan merchant ke kategori umum (seperti `"Makanan & Minuman"`, `"Belanja Harian"`, `"Transportasi"`).

---

## 2. ⚠️ PENTING — Unhandled HTTP Audio Fetch & QuickChart Fallback

### G3-03: `voice-processor.ts` Tidak Mengecek HTTP `res.ok` Saat Unduh Audio Telegram

**File**: `lib/telegram/voice-processor.ts` — Baris 25  
**Kode**:
```ts
const audioArrayBuffer = await fetch(voiceUrl).then((r) => r.arrayBuffer());
```
**Masalah**: Jika Telegram API mengembalikan respons non-200 (misalnya 404/403/500), `fetch` tidak melempar exception tetapi mengembalikan objek Response gagal. Panggilan `.arrayBuffer()` akan tetap mengonversi halaman HTML error menjadi buffer audio palsu yang kemudian dikirim ke Gemini AI.  
**Dampak**: AI menerima data audio korup dan memberikan pesan kesalahan ambigu ke user.  
**Saran**:
- Tambahkan pengecekan: `const res = await fetch(voiceUrl); if (!res.ok) throw new Error('Failed to download voice file');`

---

### G3-04: `sendTelegramChart` Gagal Tanpa Fallback Jika QuickChart.io Error/Rate Limited

**File**: `lib/telegram/send-chart.ts` — Baris 142-147  
**Kode**:
```ts
const res = await fetch(url, { method: 'POST', body: JSON.stringify(body) });
return await res.json();
```
**Masalah**: Jika layanan pihak ketiga QuickChart.io mengalami masalah koneksi atau rate limit, Telegram API `sendPhoto` gagal mendownload gambar dari URL QuickChart dan mengembalikan `{ ok: false }`. Fungsi `sendTelegramChart` mengembalikan error tanpa memberikan opsi pengiriman ringkasan berbasis teks biasa.  
**Dampak**: User yang meminta `/ringkasan` grafik tidak menerima balasan sama sekali jika generator grafik error.  
**Saran**:
- Cek hasil `sendPhoto`. Jika gagal, lakukan fallback otomatis dengan mengirim caption/ringkasan data sebagai pesan teks biasa via `sendTelegramMessage`.

---

## 3. 🔧 SEDANG — Batching Cron Daily Insight & Safe Burn Rate

### G3-05: Loop Sekuensial pada Cron `daily-insight/route.ts`

**File**: `app/api/cron/daily-insight/route.ts` — Baris 23-36  
**Kode**:
```ts
for (const u of users) {
  const analytics = await calculate20Analytics(u.id);
  ...
}
```
**Masalah**: Penggenerasian kalkulasi harian diproses secara serial satu per satu. Dengan 20 user, cron membutuhkan 20x proses kalkulasi berat yang bisa memakan waktu hingga 30-40 detik.  
**Dampak**: Risiko Vercel cron timeout (limit 60 detik untuk Serverless Function).  
**Saran**:
- Proses kalkulasi user secara paralel menggunakan `Promise.allSettled()` dalam batch 5 user sekaligus.

---

### G3-06: Estimasi Burn Rate Harian Saat `totalIncome = 0`

**File**: `lib/analytics/calculators.ts` — Baris 135  
**Kode**:
```ts
const safeDailyLimitValue = Math.round(totalIncome > 0 ? (totalIncome * 0.7) / 30 : 100000);
```
**Masalah**: Jika user belum mencatat pemasukan (`totalIncome = 0`), batas aman harian di-set sebesar `Rp 100.000` tanpa memperhatikan jumlah total pengeluaran yang telah dicatat bulan ini.  
**Dampak**: Untuk user yang total pengeluarannya sudah mencapai Rp 10.000.000 tapi belum mencatat pemasukan, rekomendasi batas harian tetap menunjukkan angka statis Rp 100.000/hari yang kurang realistis.  
**Saran**:
- Hitung batas aman berbasis rata-rata pengeluaran harian berjalan (`currentMonthExpenses / currentDayOfMonth`) jika `totalIncome = 0`.

---

## 4. 💡 RENDAH — Shared Goal Input Guard & Categorize Backtick Strip

### G3-07: Direct `JSON.parse` pada `categorizeItem` (`categorize.ts`)

**File**: `lib/gemini/prompts/categorize.ts` — Baris 53  
**Masalah**: Sama seperti G3-01, `JSON.parse(response.text)` pada modul kategorisasi berisiko crash jika AI mengembalikan respons dengan pembungkus backticks.  
**Saran**:
- Bersihkan string respons dengan regex sebelum diparsing.

---

### G3-08: Validasi `targetAmount` Positif pada `createSharedGoal`

**File**: `lib/features/couples.ts` — Baris 42-62  
**Masalah**: Parameter `targetAmount` pada pembuatan impian bersama tidak memvalidasi angka positif. User dapat membuat shared goal dengan nominal negatif.  
**Saran**:
- Tambahkan guard: `if (targetAmount <= 0) throw new Error('Target nominal harus lebih dari 0');`

---

### G3-09: Handling Failure pada `processReprocessReceiptsBatch`

**File**: `lib/jobs/processors/reprocess-receipts.ts` — Baris 15-20  
**Masalah**: Loop pemrosesan batch tidak dibungkus `try/catch` per item, sehingga 1 item transaksi corrupt akan menghentikan seluruh pekerjaan batch job.  
**Saran**:
- Tambahkan `try/catch` per item agar item korup bisa dilewati dan item lain tetap terproses.

---

### G3-10: Error Handling pada Notification Job Progress (`notify-progress.ts`)

**File**: `lib/jobs/notify-progress.ts` — Baris 15-17  
**Masalah**: Panggilan `sendTelegramMessage` tidak dibungkus try/catch. Jika bot diblokir oleh user, `notifyJobProgress` melempar error unhandled.  
**Saran**:
- Bungkus panggilan pesan pengingat job dengan `try/catch` silent log.

---

## 5. 📊 RINGKASAN TEMUAN GELOMBANG 3

| Kategori | Jumlah Temuan |
|----------|:------------:|
| 🚨 **KRITIS** | 2 |
| ⚠️ **PENTING** | 2 |
| 🔧 **SEDANG** | 2 |
| 💡 **RENDAH** | 4 |
| **TOTAL GELOMBANG 3** | **10** |

---

> **Rekomendasi**: Seluruh 10 temuan Gelombang 3 di atas disarankan untuk langsung dieksekusi agar sistem memiliki pertahanan sempurna (bulletproof) dari berbagai skenario data edge-case.
