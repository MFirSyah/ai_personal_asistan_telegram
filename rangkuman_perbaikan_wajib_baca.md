# 📖 RANGKUMAN PERBAIKAN WAJIB BACA (SYSTEM AUDIT & EVOLUTION MANUAL)
**Proyek:** AI Personal Assistant & Telegram Mini App Dashboard (`ai_personal_asistan_telegram`)  
**Dokumen:** Catatan Komprehensif Seluruh Riwayat Kesalahan, Permintaan Pengguna, dan Solusi Perbaikan dari Awal hingga Akhir.  
**Tanggal Rilis:** 22 Agustus 2026  
**Status Repositori:** Production Ready, 0 Error TypeScript, Build 25/25 Routes Pass.

---

## 📌 DAFTAR ISI
1. [Latar Belakang & Profil Pengguna](#1-latar-belakang--profil-pengguna)
2. [Katalog Lengkap Kesalahan Sistem yang Pernah Terjadi](#2-katalog-lengkap-kesalahan-sistem-yang-pernah-terjadi)
3. [Kronologi Seluruh Permintaan Pengguna & Evolusi Sistem](#3-kronologi-seluruh-permintaan-pengguna--evolusi-sistem)
4. [Rincian Seluruh Perbaikan Kode & Solusi Teknis](#4-rincian-seluruh-perbaikan-kode--solusi-teknis)
5. [Daftar Data Kunci & Fakta Finansial Pengguna yang Wajib Diingat](#5-daftar-data-kunci--fakta-finansial-pengguna-yang-wajib-diingat)
6. [Protokol & Aturan Baku untuk Pengembangan AI Selanjutnya](#6-protokol--aturan-baku-untuk-pengembangan-ai-selanjutnya)

---

## 1. Latar Belakang & Profil Pengguna

- **Nama Pengguna:** Mas Firman (Firman Ardiansyah)
- **ID Telegram:** `1084842050`
- **Email Terdaftar:** `xfirmanardiansyah2305@gmail.com`
- **Tujuan Sistem:** Asisten pribadi cerdas (*Royal Financial & Schedule Butler*) yang bertugas mencatat dan memantau arus kas keuangan secara presisi, mengelola agenda/aktivitas, mendeteksi potensi bentrok waktu dan kebocoran dana (*micro-leaks*), serta memberikan visualisasi data melalui Dashboard Mini App Telegram.

---

## 2. Katalog Lengkap Kesalahan Sistem yang Pernah Terjadi

Berikut adalah seluruh kesalahan, kegagalan logika, *bug*, serta halusinasi yang pernah terjadi dalam riwayat pengembangan dan operasional bot:

### 🔴 Kelompok 1: Halusinasi & Kehilangan Memori AI (Memory Loss)
1. **Halusinasi Anggaran Rencana (Contoh: Trip Dieng di Turn 100 & 119)**
   - *Kesalahan:* Pengguna telah merinci rencana liburan ke Dieng (29–30 Agustus 2026: Tiket Rp 340.000, Uang Jajan Rp 500.000, Perlengkapan Rp 200.000 = Total Rp 1.040.000). Ketika ditanya ulang di Turn 119, bot berhalusinasi mengarang angka fiktif (Tiket 150rb, Transport 200rb, Konsumsi 150rb = 500rb). Saat ditegur di Turn 120–121, bot mengulang-ulang riwayat transfer bank karena data tidak tersimpan permanen di tabel `plans`.
   - *Akar Masalah:* Prompt AI belum mengekstrak objek rencana ke tabel `plans` di database Supabase dan tidak menyuntikkan `activePlans` ke prompt konteks.

2. **Klaim Palsu Data Tersimpan (0% Data Dummy Violation)**
   - *Kesalahan:* Bot sempat membalas *"Data sudah saya simpan di database"* padahal array ekstraksi kosong (`extracted_data = null`).

### 🔴 Kelompok 2: Kegagalan Logika & Alur Pesan Telegram
3. **Spam Bubble Pertanyaan Ganda (Duplicate Follow-up Bubbles)**
   - *Kesalahan:* Di Turn 114, 117, 122, bot mengirim 2 hingga 3 bubble pesan berturut-turut dengan kalimat yang persis sama (contoh: *"Mau kita buatkan jadwal operasional narik Gojek besok pagi jam 7, Mas Firman?"* diulang 3x).
   - *Akar Masalah:* `chat-processor.ts` mengirim bubble pesan utama dari `result.messages` DAN mengirim lagi pesan terpisah dari `result.follow_up_question` yang isinya menduplikasi teks di pesan utama.

4. **Salah Memahami Negasi / Pengecualian (*"Selain Poin Ini..."*)**
   - *Kesalahan:* Di Turn 24, pengguna meminta: *"selain poin Wisuda, Bayar Hutang, Yudisium statusnya selesai semua"*. Bot malah membalik logika dan menandai ketiga agenda yang dikecualikan tersebut sebagai Selesai.
   - *Akar Masalah:* Kurangnya panduan penalaran negasi (*exclusion logic*) pada instruksi prompt.

5. **False Alarm Tabrakan Jadwal (Collision Detector Bug)**
   - *Kesalahan:* Di Turn 24, bot memunculkan peringatan tabrakan jadwal antara *Wisuda* (25 Oktober 2026) dan *Bayar Hutang* (5 September 2026) hanya karena jamnya sama (12.30 WIB), padahal tanggal dan bulannya berbeda 2 bulan.
   - *Akar Masalah:* Fungsi `checkActivityCollision` hanya mengecek selisih 60 menit waktu UTC tanpa memfilter kesamaan tanggal kalender (`YYYY-MM-DD`).

6. **Jam Transaksi Acak / Tidak Sesuai Waktu Chat Telegram**
   - *Kesalahan:* Di Turn 58–59, pengguna mengeluhkan transaksi Pasar Kodam malam hari tercatat jam 14.00 siang di database.
   - *Akar Masalah:* Webhook Telegram tidak meneruskan parameter `message.date` asli dari payload Telegram ke pembuat transaksi, sehingga sistem memakai fallback waktu server Vercel.

### 🔴 Kelompok 3: Kesalahan Struktur Dompet & Pinjaman
7. **Pencampuran Dompet Cash Kertas & Cash Koin**
   - *Kesalahan:* Pengguna membayar parkir Rp 5.000 secara cash kertas, tetapi bot memotongnya dari dompet Cash Koin.
   - *Akar Masalah:* AI menganggap semua uang tunai sebagai satu dompet tunggal `"Cash"`.

8. **Kesalahan Pencatatan Angsuran Pinjaman Bank Jago**
   - *Kesalahan:* Saat pengguna membayar cicilan bulanan Bank Jago (Rp 67.941) pada 20 Agustus, bot sempat menghapus seluruh utang pinjaman atau memotong saldo 70.000 penuh.
   - *Akar Masalah:* AI tidak memahami skema cicilan 12 bulan dan menyamakan bayar cicilan dengan pelunasan total.

### 🔴 Kelompok 4: Kegagalan Format & Kompatibilitas
9. **Pelanggaran Format Bold & Ikon Variabel**
   - *Kesalahan:* Bot menaruh ikon di kanan variabel, atau mem-bold tanda titik dua dan nilainya (contoh salah: `• **Pengeluaran: Rp 10.000**`).
   - *Akar Masalah:* Kurangnya penegasan aturan format spesifik Mas Firman.

10. **Kegagalan & Error Pembuatan Aplikasi Mobile Native (React Native / Expo)**
    - *Kesalahan:* Upaya membuat aplikasi mobile mandiri mengalami error kompilasi metro, ADB USB bridge, dan error `java.io.IOException: Failed to download remote update`.
    - *Solusi:* Pengguna memutuskan untuk membatalkan, melupakan, dan menghapus total folder `mobile_app`, lalu memfokuskan 100% pengembangan pada Bot Telegram + Super Admin Web App & Telegram Mini App Dashboard.

11. **Model AI Deprecated / 404 (Gemini 2.5/2.0/1.5)**
    - *Kesalahan:* Penggunaan ID model lama yang sudah didepresiasi oleh Google.
    - *Akar Masalah:* Perubahan versi API Google Gen AI v1beta.

12. **Batas Rate Limiter Terlalu Ketat (7 RPM)**
    - *Kesalahan:* Pengguna yang mengetik cepat atau mengirim struk + pesan suara langsung terkunci oleh pesan *"Terlalu banyak pesan dalam waktu singkat"*.

13. **Foto Non-Struk Mengotori Database**
    - *Kesalahan:* Foto pemandangan/selfie yang dikirim pengguna tetap masuk ke database sebagai transaksi `Rp 0`.

14. **Proyeksi Pengeluaran Meledak di Awal Bulan (Day 1 Spike)**
    - *Kesalahan:* Bayar kos Rp 500.000 di tanggal 1 membuat kalkulator memproyeksikan pengeluaran akhir bulan menjadi Rp 15.000.000 (500rb * 30 hari).

15. **Potensi Crash PDFKit Akibat Karakter Unicode / Emoji**
    - *Kesalahan:* Emoji pada nama transaksi menyebabkan modul PDFKit melempar exception atau menghasilkan font rusak.

---

## 3. Kronologi Seluruh Permintaan Pengguna & Evolusi Sistem

| No | Fase / Tanggal | Permintaan Pengguna | Tindakan & Implementasi yang Dikerjakan |
|---|---|---|---|
| 1 | **12–15 Agustus 2026** | Setup dasar bot Telegram, integrasi Supabase, dan pencatatan transaksi harian. | Menghubungkan bot dengan Supabase, Google Gemini AI, dan Google Sheets stream sync. |
| 2 | **16–18 Agustus 2026** | Audit spreadsheet, perbaikan struktur 20 analisis, dan pembagian dompet cash. | Memisahkan peranakan Cash Kertas dan Cash Koin, sinkronisasi 20 metrik analisis. |
| 3 | **19–21 Agustus 2026** | Penanganan pinjaman Bank Jago (Pinjaman 1 & 2), pencatatan talangan GoPay, dan rencana Trip Dieng. | Memasukkan preferensi cicilan Rp 67.941/bulan dan bunga flat 2.99%, pencatatan trip Dieng Rp 1.040.000. |
| 4 | **22 Agustus (Pagi)** | Uji coba pembuatan mobile app via USB/Expo. | Mengalami kendala remote update -> Pengguna meminta **hapus dan lupakan total project mobile app**. |
| 5 | **22 Agustus (Siang)** | Audit menyeluruh berdasarkan file `ChatExport_2026-08-22`. | Membedah 432 pesan (123 turn), menemukan 8 akar masalah utama, menyusun implementation plan, dan memperbaiki kode. |
| 6 | **22 Agustus (Sore)** | Audit ketahanan menyeluruh (*Robustness Audit*) dan verifikasi model Gemini aktif. | Memverifikasi live API Gemini 3 series, memperluas fallback chain 4 model, merelaksasi rate limit, smoothing proyeksi, dan validasi OCR. |
| 7 | **22 Agustus (Malam)** | Pembuatan dokumen rangkuman komprehensif `rangkuman_perbaikan_wajib_baca.md`. | Menyusun seluruh riwayat perbaikan secara lengkap, runtut, dan terstruktur. |

---

## 4. Rincian Seluruh Perbaikan Kode & Solusi Teknis

Berikut adalah daftar berkas dan kode sumber yang telah diperbaiki:

### 1. `lib/gemini/prompts/chat.ts`
- Menambahkan skema ekstraksi terstruktur `extracted_data.plans` (title, description, target_date, status, budget_total, budget_breakdown, strategy).
- Menyuntikkan konteks `activePlans`, daftar pinjaman Bank Jago, dan struktur saldo dompet ke prompt AI.
- Menambahkan instruksi ketat penalaran negasi (*"selain"* / *"kecuali"*).
- Menegaskan format penulisan variabel bold: `• 💵 **Nama Variabel**: Nilai`.
- Mencegah greeting loop dan duplikasi pertanyaan follow-up.

### 2. `lib/gemini/client.ts`
- Memperbarui rantai fallback 4-model teruji:
  ```ts
  export const MODEL_FALLBACK_CHAIN = [
    'gemini-3.5-flash-lite', // Primary Ultra-Fast (500 RPD & 15 RPM)
    'gemini-3.1-flash-lite', // Secondary Lite Fallback (500 RPD)
    'gemini-3.6-flash',      // Flagship Multimodal & Deep Reasoning
    'gemini-3.5-flash',      // High-Capacity Fallback
  ];
  ```

### 3. `lib/gemini/rate-limiter.ts`
- Merelaksasi batas pesan per menit dari 7 menjadi **15 request/menit**.
- Menaikkan batas harian menjadi **1.000 request/hari**.

### 4. `lib/telegram/chat-processor.ts`
- Menerima parameter `messageTimestampMs` (dari `message.date * 1000`) sebagai default `occurred_at` agar jam transaksi 100% presisi sesuai waktu pengiriman chat Telegram dalam WIB.
- Menambahkan penyimpanan otomatis data rencana (`plans`) ke database Supabase via `upsertPlan`.
- Mencegah pengiriman bubble pertanyaan duplikat jika pertanyaan sudah termuat di dalam bubble pesan utama.

### 5. `app/api/telegram/webhook/route.ts`
- Meneruskan `message.date` asli dari payload webhook Telegram ke `processChatRespondDirect`.

### 6. `lib/analytics/anomalies.ts`
- Memperbaiki `checkActivityCollision` dengan validasi kesamaan tanggal kalender (`YYYY-MM-DD` dalam WIB) sebelum mengecek selisih menit, menghilangkan false alarm bentrok antar bulan.

### 7. `lib/analytics/calculators.ts`
- Menerapkan *weighted historical smoothing* pada tanggal 1–5 awal bulan (30% hari berjalan + 70% rata-rata 30 hari sebelumnya) agar proyeksi akhir bulan tidak meledak di hari pertama.

### 8. `lib/telegram/receipt-processor.ts`
- Menambahkan filter validasi: jika foto bukan struk (`totalAmount <= 0` & tanpa item), transaksi tidak disimpan ke database dan bot memberi saran ramah untuk mengirim foto yang lebih jelas.

### 9. `lib/supabase/queries/transactions.ts`
- Menambahkan fungsi `upsertPlan` untuk pembaruan dinamis data rencana hidup pengguna di database Supabase.

### 10. `lib/google-sheets/sync.ts`
- Menghapus hardcoded UUID dan menggantinya dengan resolusi nama pengguna dinamis dari database.

### 11. `lib/features/pdf-report.ts`
- Menambahkan fungsi `sanitizeForPdf` untuk membersihkan karakter non-ASCII dan emoji sebelum dicetak ke dokumen PDF.

---

## 5. Daftar Data Kunci & Fakta Finansial Pengguna yang Wajib Diingat

1. **Rincian Akun & Dompet:**
   - **Cash Kertas**: Uang fisik lembaran.
   - **Cash Koin**: Uang fisik receh/koin.
   - **Non-tunai**: SeaBank, Bank Jago, GoPay, ShopeePay, BCA, Livin Mandiri.
2. **Daftar Pinjaman Aktif (Bank Jago):**
   - **Pinjaman 1**: Angsuran Rp 67.941 / bulan, jatuh tempo setiap tanggal 20 selama 12 bulan (Agustus 2026 – Juli 2027). Cicilan pertama Agustus lunas pada 20-08-2026.
   - **Pinjaman 2**: Pokok Rp 600.000, bunga flat 2.99% per bulan selama 12 bulan (Pokok Rp 50.000 + Bunga Rp 17.940 = Rp 67.940 / bulan).
3. **Rencana Liburan ke Dieng (29–30 Agustus 2026):**
   - Tiket Wisata & Perjalanan: Rp 340.000 (awal 290rb + kenaikan 50rb).
   - Uang Jajan / Saku: Rp 500.000.
   - Perlengkapan (Baju, Celana, dll): Rp 200.000.
   - **Total Estimasi Budget**: Rp 1.040.000.
   - Strategi Pendanaan: Narik Gojek harian target Rp 70.000 – Rp 85.000/hari, batas pengeluaran operasional harian maks Rp 20.000 – Rp 25.000/hari.
4. **Aturan Format Balasan:**
   - Gunakan bullet point (`•`).
   - Ikon berada di sebelah kiri nama variabel.
   - HANYA nama variabel sebelum titik dua yang di-bold: `• 💵 **Pengeluaran Cash**: Rp 10.000 (Es Cincau)`.

---

## 6. Protokol & Aturan Baku untuk Pengembangan AI Selanjutnya

Setiap asisten AI yang melanjutkan tugas pada repositori ini **WAJIB MEMATUHI 5 PROTOKOL MUTLAK** berikut:

1. **0% Halusinasi Data Rencana & Keuangan:**
   - Jangan pernah mengarang angka transaksi atau rencana jika belum ada di database.
   - Selalu ekstrak rencana baru ke tabel `plans` di Supabase.
2. **Presisi Waktu Telegram (WIB):**
   - Gunakan selalu timestamp pesan Telegram (`message.date`) sebagai waktu default transaksi/aktivitas.
3. **Anti-Duplikasi Pesan:**
   - Kirimkan balasan dalam 1–2 bubble padat dan elegan. Jangan mengirim pertanyaan follow-up terpisah jika sudah termuat di pesan utama.
4. **Penalaran Logika Negasi:**
   - Perhatikan kata *"selain"* dan *"kecuali"*. Jangan pernah mengubah status entitas yang dikecualikan oleh pengguna.
5. **Verifikasi Build Sebelum Selesai:**
   - Jalankan selalu `npx tsc --noEmit` dan pastikan `0 Error` sebelum menyelesaikan pekerjaan.

---
*Dokumen ini merupakan sumber kebenaran resmi (*single source of truth*) arsitektur dan riwayat perbaikan sistem `ai_personal_asistan_telegram`.*
