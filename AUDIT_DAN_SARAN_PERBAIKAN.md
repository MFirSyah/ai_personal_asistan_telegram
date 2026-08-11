# 🔍 AUDIT MENYELURUH & SARAN PERBAIKAN (GELOMBANG 4)

**Tanggal Audit**: 11 Agustus 2026  
**Auditor**: AI Code Auditor  
**Status Audit Sebelumnya**: 
- Gelombang 1: 26/26 Temuan Selesai & Terverifikasi
- Gelombang 2: 10/10 Temuan Selesai & Live di Vercel Production
- Gelombang 3: 10/10 Temuan Selesai & Live di Vercel Production
**Cakupan Audit Gelombang 4**: Optimalisasi Database Upsert, Event Loop Timer Cleanup, Akurasi Rounding Patungan, Auto-Persist Mini App Session, dan Safe OCR Parsing

---

## 📋 DAFTAR ISI

1. [🚨 KRITIS — Safe OCR JSON Parsing & Atomic Upsert Preferences](#1--kritis--safe-ocr-json-parsing--atomic-upsert-preferences)
2. [⚠️ PENTING — Node.js Event Loop Timer Leak & Rounding Split Bill](#2-️-penting--nodejs-event-loop-timer-leak--rounding-split-bill)
3. [🔧 SEDANG — Auto-Persist Auth Session pada Login Dashboard](#3--sedang--auto-persist-auth-session-pada-login-dashboard)
4. [💡 RENDAH — Sanitize Whitespace & Clean Code Enhancements](#4--rendah--sanitize-whitespace--clean-code-enhancements)
5. [📊 RINGKASAN TEMUAN GELOMBANG 4](#5--ringkasan-temuan-gelombang-4)

---

## 1. 🚨 KRITIS — Safe OCR JSON Parsing & Atomic Upsert Preferences

### G4-01: Direct `JSON.parse` Tanpa Clean Backticks pada OCR Struk `ocr-receipt.ts`

**File**: `lib/gemini/prompts/ocr-receipt.ts` — Baris 63  
**Kode**:
```ts
const parsed = JSON.parse(response.text || '{}');
```
**Masalah**: Jika Gemini Vision AI mengembalikan hasil OCR yang terbungkus markdown codeblock (` ```json { "totalAmount": 50000, ... } ``` `), panggilan `JSON.parse` langsung melempar `SyntaxError: Unexpected token '`'` dan menyebabkan proses baca struk foto gagal total.  
**Dampak**: Pengiriman gambar struk di Telegram terkadang memicu pesan error *"Maaf, terjadi kesalahan saat membaca gambar struk kamu."*  
**Saran**:
- Bersihkan pembungkus markdown sebelum diparsing:  
  `const rawText = (response.text || '').replace(/```json/gi, '').replace(/```/g, '').trim();`  
  `const parsed = JSON.parse(rawText || '{}');`

---

### G4-02: `saveUserPreference` Melakukan Query 2 Lapis (Select -> Update/Insert)

**File**: `lib/supabase/queries/preferences.ts` — Baris 30-76  
**Masalah**: Setiap kali AI mempelajari preferensi baru milik user, fungsi `saveUserPreference` melakukan pencarian `SELECT` terlebih dahulu, lalu disusul `UPDATE` atau `INSERT`. Ini membutuhkan 2 kali HTTP RTT (Round Trip Time) ke Supabase.  
**Dampak**: Menambah latensi eksekusi chat Telegram (200-400ms ekstra).  
**Saran**:
- Gunakan `upsert` tunggal bawaan PostgreSQL ON CONFLICT `(user_id, key)`:  
  `await supabaseAdmin.from('user_preferences').upsert({ user_id: userId, key, value, learned_from: learnedFrom || null, updated_at: new Date().toISOString() }, { onConflict: 'user_id,key' })`

---

## 2. ⚠️ PENTING — Node.js Event Loop Timer Leak & Rounding Split Bill

### G4-03: `setTimeout` Un-cleared pada Exceptions di `generateContentWithFallback`

**File**: `lib/gemini/client.ts` — Baris 30-43  
**Kode**:
```ts
const response: any = await Promise.race([apiCall, timeoutPromise]);
clearTimeout(timer!);
```
**Masalah**: Jika panggilan `apiCall` melempar exception sebelum timeout (misal 503 Service Unavailable), baris `clearTimeout(timer!)` dilewati. Pembuat `setTimeout` tetap menggantung di Node.js event loop hingga timer 15 detik berakhir.  
**Dampak**: Akumulasi memory leak minor pada serverless instance Vercel saat Gemini API sedang sibuk.  
**Saran**:
- Gunakan blok `finally` untuk memastikan `clearTimeout(timer!)` selalu dijalankan terlepas dari sukses atau error.

---

### G4-04: Mismatch pembulatan pecahan IDR pada Kalkulator Patungan `/split`

**File**: `lib/features/split-bill.ts` — Baris 50-53  
**Kode**:
```ts
const equalShare = Math.round(grandTotal / peopleCount);
input.people.forEach((p) => { perPerson[p] = equalShare; });
```
**Masalah**: Saat pembagian patungan untuk nominal yang tidak habis dibagi (misal Rp 100.000 untuk 3 orang), `Math.round(100000 / 3)` menghasilkan `33.333` per orang. Jika dijumlahkan kembali (33.333 * 3 = 99.999), terdapat selisih pembulatan **Rp 1** yang menggantung dari total bill.  
**Dampak**: Total rincian per orang tidak cocok sempurna dengan grand total tagihan.  
**Saran**:
- Alokasikan sisa selisih pembulatan (rounding remainder) ke peserta terakhir agar `sum(perPerson) === grandTotal` tepat.

---

## 3. 🔧 SEDANG — Auto-Persist Auth Session pada Login Dashboard

### G4-05: Halaman Login Dashboard Tidak Menyimpan Session `saved_user_id` di LocalStorage

**File**: `app/dashboard/login/page.tsx` — Baris 38-55  
**Masalah**: Setelah user berhasil login dengan email & password pada halaman `/dashboard/login`, sistem mengarahkan ke `/dashboard?telegram_id=...` tetapi lupa memperbarui `localStorage.setItem('saved_user_id', data.user.id)`. Jika user kemudian membuka Mini App tanpa URL parameter, sistem kembali menganggap user sebagai `demo-user`.  
**Dampak**: User terpaksa melakukan login ulang atau mengakses URL khusus secara berulang.  
**Saran**:
- Simpan `saved_user_id` dan `saved_telegram_id` ke `localStorage` saat login sukses di `app/dashboard/login/page.tsx`.

---

## 4. 💡 RENDAH — Sanitize Whitespace & Clean Code Enhancements

### G4-06: Handling `undefined` User Name pada Login Response

**File**: `app/api/auth/telegram-user/route.ts` — Baris 31  
**Masalah**: Memastikan response selalu menyertakan format standar `user.name` yang bersih dari whitespace tak terduga.

---

## 5. 📊 RINGKASAN TEMUAN GELOMBANG 4

| Kategori | Jumlah Temuan |
|----------|:------------:|
| 🚨 **KRITIS** | 2 |
| ⚠️ **PENTING** | 2 |
| 🔧 **SEDANG** | 1 |
| 💡 **RENDAH** | 1 |
| **TOTAL GELOMBANG 4** | **6** |

---

> **Rekomendasi**: Lakukan eksekusi perbaikan 6 temuan Gelombang 4 ini untuk mengunci keandalan sistem hingga 100% sempurna.
