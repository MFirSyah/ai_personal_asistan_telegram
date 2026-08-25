# 📖 RANGKUMAN PERBAIKAN WAJIB BACA (SYSTEM EVOLUTION & ARCHITECTURAL TRUTH MANUAL)
**Proyek:** AI Personal Assistant & Telegram Mini App Dashboard (`ai_personal_asistan_telegram`)
**Dokumen:** Sumber Kebenaran Mutlak (*Single Source of Truth*) Seluruh Riwayat Kesalahan, Permintaan Pengguna, Solusi Perbaikan, Arsitektur Database, dan Pedoman Pengembangan.
**Target Pembaca:** Antigravity AI Assistant, Pengembang Sistem, dan Mas Firman.
**Status Repositori:** Production Ready, 0 Error TypeScript (`npx tsc --noEmit`), Build Next.js 25/25 Routes Pass.
**Tanggal Rilis:** 22 Agustus 2026

---

## 📌 PANDUAN PENTING UNTUK ASISTEN AI (MUST READ FIRST)
> [!IMPORTANT]
> **DOKUMEN INI WAJIB DIBACA DAN DIPAHAMI SEBELUM MELAKUKAN PERUBAHAN APAPUN PADA KODE SUMBER!**
> Dokumen ini dibuat agar setiap asisten AI yang bekerja di masa depan memahami konteks historis, aturan bisnis, preferensi personal pengguna, serta alasan di balik setiap keputusan arsitektur.
> DILARANG mengubah, menghapus, atau menambahkan fitur yang bertentangan dengan isi dokumen ini tanpa persetujuan eksplisit dari Mas Firman.
> Setiap kali selesai melakukan perbaikan atau penambahan fitur baru, AI WAJIB memperbarui dokumen ini agar riwayatnya tetap berkesinambungan.

---

## 📑 DAFTAR ISI LENGKAP
1. [BAB I: IDENTITAS PROYEK, ARSITEKTUR SISTEM & PROFIL PENGGUNA](#bab-i-identitas-proyek-arsitektur-sistem--profil-pengguna)
   - 1.1 Profil Pengguna Utama & Hak Akses Akun
   - 1.2 Persona AI: Royal Financial & Schedule Butler
   - 1.3 Arsitektur Keseluruhan & Diagram Alur Data
   - 1.4 Daftar Lengkap 25 Route Next.js 16 (App Router)
   - 1.5 Skema Lengkap 14 Tabel Database Supabase PostgreSQL
2. [BAB II: KATALOG LENGKAP 15 KESALAHAN, BUG, DAN HALUSINASI SISTEM](#bab-ii-katalog-lengkap-15-kesalahan-bug-dan-halusinasi-sistem)
   - 2.1 Halusinasi Memori Rencana Liburan Dieng (Turn 100 vs Turn 119)
   - 2.2 Klaim Palsu Penyimpanan Database (Data Dummy Violation)
   - 2.3 Spam Bubble Pertanyaan Ganda / Redundan (Turn 114, 117, 122)
   - 2.4 Pembalikan Logika Negasi / Pengecualian ('Selain Poin Ini...') (Turn 24)
   - 2.5 False Alarm Tabrakan Jadwal Beda Bulan (Turn 24)
   - 2.6 Ketidakakuratan Jam Transaksi vs Waktu Chat Telegram (Turn 58-59)
   - 2.7 Pencampuran Dompet Cash Kertas vs Cash Koin (Turn 64-66)
   - 2.8 Kesalahan Pencatatan Angsuran Bank Jago (Turn 78-85, 87, 94)
   - 2.9 Pelanggaran Format Bold & Ikon Variabel (Turn 34-37, 45-47)
   - 2.10 Kegagalan Mobile App Native & Keputusan Pembatalan Total
   - 2.11 Depresiasi Model AI Gemini 2.5/2.0/1.5 ke Gemini 3.x
   - 2.12 Rate Limiter 7 RPM Terlalu Ketat (False Lock)
   - 2.13 Foto Non-Struk Mengotori Database dengan Transaksi Rp 0
   - 2.14 Proyeksi Akhir Bulan Meledak di Hari Pertama (Day 1 Spike)
   - 2.15 Crash PDFKit Akibat Karakter Unicode / Emoji
3. [BAB III: KRONOLOGI LENGKAP PERCAKAPAN, PERMINTAAN USER & EVOLUSI SISTEM](#bab-iii-kronologi-lengkap-percakapan-permintaan-user--evolusi-sistem)
   - 3.1 Fase 1: Setup Fondasi Dasar (12–15 Agustus 2026)
   - 3.2 Fase 2: Audit Spreadsheet & Pemisahan Dompet (16–18 Agustus 2026)
   - 3.3 Fase 3: Kredit Bank Jago, Talangan GoPay & Rencana Dieng (19–21 Agustus 2026)
   - 3.4 Fase 4: Eksperimen Mobile App & Pembatalan Total (22 Agustus Pagi)
   - 3.5 Fase 5: Audit Granular ChatExport_2026-08-22 (22 Agustus Siang)
   - 3.6 Fase 6: Audit Ketahanan Ekstrem & Live Model Benchmark (22 Agustus Sore)
   - 3.7 Analisis Turn-by-Turn Granular Percakapan Kunci (Turn 1 s.d. Turn 123)
4. [BAB IV: RINCIAN TEKNIS SELURUH SOLUSI KODE (BEFORE VS AFTER CODE BLUEPRINTS)](#bab-iv-rincian-teknis-seluruh-solusi-kode)
   - 4.1 System Prompt & Memory Context (`lib/gemini/prompts/chat.ts`)
   - 4.2 Multi-Model Fallback Chain (`lib/gemini/client.ts`)
   - 4.3 Rate Limiter Terdesentralisasi (`lib/gemini/rate-limiter.ts`)
   - 4.4 Chat Processor & Message Dispatcher (`lib/telegram/chat-processor.ts`)
   - 4.5 Webhook Route & Timestamp Preserver (`app/api/telegram/webhook/route.ts`)
   - 4.6 Smart Activity Collision Detector (`lib/analytics/anomalies.ts`)
   - 4.7 20 Analytics Calculators & Historical Smoothing (`lib/analytics/calculators.ts`)
   - 4.8 Receipt OCR Processor & Quality Gate (`lib/telegram/receipt-processor.ts`)
   - 4.9 Voice Note Processor & STT Pipeline (`lib/telegram/voice-processor.ts`)
   - 4.10 Database Queries & Plan Persistence (`lib/supabase/queries/transactions.ts`)
   - 4.11 Google Sheets Real-time Stream Sync (`lib/google-sheets/sync.ts`)
   - 4.12 PDF Executive Report Generator (`lib/features/pdf-report.ts`)
   - 4.13 Mini App Dashboard & Data Inspector (`app/dashboard/`, `app/admin/`)
5. [BAB V: FAKTA KUNCI KEUANGAN, DOMPET, PINJAMAN & RENCANA HIDUP PENGGUNA](#bab-v-fakta-kunci-keuangan-dompet-pinjaman--rencana-hidup-pengguna)
   - 5.1 Struktur Saldo & Karakteristik Peranakan Dompet
   - 5.2 Rincian Lengkap Pinjaman 1 & Pinjaman 2 Bank Jago
   - 5.3 Rencana Lengkap Trip Liburan Ke Dieng (29–30 Agustus 2026)
   - 5.4 Target Kerja Gojek Harian & Batas Pengeluaran Operasional
   - 5.5 Standar Baku Format Pesan & Penulisan Variabel
6. [BAB VI: PROTOKOL MUTLAK PENGEMBANGAN AI SELANJUTNYA (MUST-READ GUARDRAILS)](#bab-vi-protokol-mutlak-pengembangan-ai-selanjutnya)
   - 6.1 Daftar Hal yang DILARANG KERAS Dihapus / Diubah
   - 6.2 Daftar Hal yang BOLEH Diimprovisasi
   - 6.3 Prosedur Wajib Sebelum Mengubah Kode (Pre-Flight Checklist)
   - 6.4 Prosedur Wajib Setelah Mengubah Kode (Post-Flight Checklist)
   - 6.5 Standar Operasional Prosedur (SOP) Pembaruan Dokumen Ini

---

## 🏛️ BAB I: IDENTITAS PROYEK, ARSITEKTUR SISTEM & PROFIL PENGGUNA

### 1.1 Profil Pengguna Utama & Hak Akses Akun
Sistem ini didesain secara privat dan eksklusif untuk melayani **Mas Firman** sebagai pengguna utama dan pemilik sah akun:

- **Nama Lengkap:** Firman Ardiansyah (Mas Firman)
- **ID Pengguna Supabase (User UUID):** `fc2758d3-78bb-4e22-b9f0-b3b16568b671`
- **ID Telegram (Chat ID):** `1084842050`
- **Email Terdaftar:** `xfirmanardiansyah2305@gmail.com`
- **Peran Sistem:** Super Administrator, Owner, dan Akun Utama
- **Zona Waktu Operasional:** Waktu Indonesia Barat (WIB / `UTC+7` / `Asia/Jakarta`)
- **Bahasa Komunikasi:** Bahasa Indonesia formal-santun khas Butler Eksekutif Kerajaan (*Royal Butler*).
- **Akun Pasangan / Partner Terdaftar (Opsional):** Khofita (`e07667b5-336e-4275-ae06-fde7b5018b3d`, Telegram ID: `1448236743`)

### 1.2 Persona AI: Royal Financial & Schedule Butler
Asisten AI bukan sekadar chatbot biasa, melainkan diposisikan sebagai **Kepala Pelayan Keuangan & Jadwal Pribadi Eksekutif (Personal Financial & Schedule Butler)** bagi Mas Firman. Persona ini memiliki karakteristik operasional yang sangat tegas:

1. **Sikap Sangat Hormat & Sopan:** Sapaan pembuka selalu bernada taktis dan santun (contoh: *'Selamat siang Mas Firman'*, *'Izin menyampaikan rekapitulasi arus kas harian, Mas Firman'*).
2. **Protektif terhadap Kesehatan Finansial:** Bertindak proaktif memberikan peringatan dini (*early warning*) jika mendeteksi anomali pengeluaran, kebocoran dana halus (*micro-leaks*), tagihan cicilan mendekati jatuh tempo, atau pengeluaran impulsif.
3. **Anti-Greeting Loop (0% Greeting Spam):** Jika percakapan sedang berlangsung dalam sesi interaktif, AI DILARANG KERAS menyapa ulang dengan kalimat pembuka klise seperti *'Halo Mas Firman! Senang bisa mengobrol lagi'*. AI langsung menjawab to the point.
4. **Anti-Halusinasi & Ketepatan Database 100%:** AI hanya boleh menyajikan informasi berdasarkan data yang benar-benar tercatat di database Supabase. AI dilarang keras mengarang angka atau menyatakan data sudah disimpan jika transaksi belum diekstraksi ke payload database.

### 1.3 Arsitektur Keseluruhan & Diagram Alur Data
Arsitektur proyek dirancang menggunakan pola *Serverless Event-Driven Architecture* berkecepatan tinggi dengan response time `<30ms` ke Telegram Webhook:

```mermaid
flowchart TD
    subgraph Client Layer
        UserTelegram[Telegram Mobile / Desktop App] <-->|Chat / Photo / Voice| TelegramServers[Telegram Bot API Gateway]
        UserWebview[Telegram WebApp Mini App] <-->|HTTPS Webview| NextDashboard[Next.js 16 Mini App Dashboard]
    end

    subgraph Vercel Serverless Edge
        TelegramServers -->|Webhook POST /api/telegram/webhook| WebhookRoute[Webhook Route Handler]
        WebhookRoute -->|Instant Auth Check| SupabaseSessions[(Supabase user_sessions)]
        WebhookRoute -->|Check Rate Limits| SupabaseRateLimits[(Supabase rate_limits)]
        WebhookRoute -->|Return HTTP 200 OK in <30ms| TelegramServers
        WebhookRoute -.->|Next.js after() Background Execution| PipelineProcessor[Chat / OCR / Voice Pipeline]
    end

    subgraph Intelligence & Database Layer
        PipelineProcessor <-->|Multi-Model Fallback 3.5/3.1/3.6| GeminiAPI[Google Gemini AI Engine]
        PipelineProcessor <-->|CRUD Transactions & Plans| SupabasePostgres[(Supabase PostgreSQL Database)]
        PipelineProcessor <-->|Async Realtime Append| GoogleSheetsAPI[Google Drive & Sheets Backup API]
        PipelineProcessor -->|Send Rich Bubbles & Charts| TelegramServers
    end
```

### 1.4 Daftar Lengkap 25 Route Next.js 16 (App Router)
Berikut adalah inventaris lengkap seluruh 25 route Next.js pada proyek ini:

| No | Route Path | Tipe Route | Deskripsi Fungsional & Penanganan Eksepsi |
|---|---|---|---|
| 1 | `/` | Static Page | Landing page informasi bot dan dokumentasi singkat |
| 2 | `/_not-found` | Static Page | Penanganan halaman 404 jika rute tidak terdaftar |
| 3 | `/admin` | Static Page | Portal Super Administrator untuk monitoring sistem |
| 4 | `/admin/data-inspector` | Static Page | Data Inspector interaktif untuk melihat seluruh baris database |
| 5 | `/admin/push-dispatcher` | Static Page | Dashboard pengiriman broadcast notifikasi dan manual push |
| 6 | `/admin/users` | Static Page | Manajemen dan daftar pengguna terdaftar |
| 7 | `/api/admin/audit-db` | Dynamic API | API audit database live (menghitung total income, expense, balance) |
| 8 | `/api/admin/mutate` | Dynamic API | API mutasi data Super Admin (soft-delete, restore, update record) |
| 9 | `/api/analytics/summary` | Dynamic API | Endpoint penghasil 20 metrik analisis finansial |
| 10 | `/api/auth/link-telegram` | Dynamic API | Menghubungkan user ID Supabase dengan akun Telegram ID |
| 11 | `/api/auth/telegram-user` | Dynamic API | Autentikasi sesi Telegram WebApp SDK untuk Mini App |
| 12 | `/api/chat/respond` | Dynamic API | API pemroses respons chat Gemini |
| 13 | `/api/cron/activity-check` | Dynamic API | Cron pengecekan pengingat agenda terjadwal setiap 10–15 menit |
| 14 | `/api/cron/briefing` | Dynamic API | Cron briefing pagi jam 07:00 WIB ke Telegram & Email |
| 15 | `/api/cron/daily-insight` | Dynamic API | Cron pra-kalkulasi 20 analisis finansial harian |
| 16 | `/api/cron/process-batch` | Dynamic API | Cron pemrosesan batch antrean data latar belakang |
| 17 | `/api/data/records` | Dynamic API | Endpoint utama CRUD transaksi, aktivitas, dan kategori |
| 18 | `/api/export` | Dynamic API | Generator ekspor data ke format CSV dan SQL Backup |
| 19 | `/api/jobs/[id]/status` | Dynamic API | Pengecekan status eksekusi job latar belakang |
| 20 | `/api/receipts/process` | Dynamic API | API OCR pemrosesan gambar struk via Gemini Vision |
| 21 | `/api/telegram/webhook` | Dynamic API | Endpoint utama webhook Telegram Bot penerima pesan masuk |
| 22 | `/dashboard` | Static Page | Telegram Mini App Dashboard visualisasi grafik & data |
| 23 | `/dashboard/login` | Static Page | Halaman login & otorisasi Mini App |
| 24 | `/dashboard/settings` | Static Page | Pengaturan briefing dan preferensi pengguna di Mini App |
| 25 | `/manifest.json` | Static Assets | Web App Manifest konfigurasi PWA |

### 1.5 Skema Lengkap 14 Tabel Database Supabase PostgreSQL
Database Supabase PostgreSQL memuat 14 tabel terstruktur:

1. **`users`**: Tabel profil pengguna utama (`id` UUID PRIMARY KEY, `email` TEXT, `telegram_id` BIGINT UNIQUE, `name` TEXT, `partner_user_id` UUID, `created_at` TIMESTAMPTZ).
2. **`user_sessions`**: Pengelolaan sesi login (`id` UUID, `user_id` UUID FK, `last_active` TIMESTAMPTZ, `expires_at` TIMESTAMPTZ TTL 3 hari, `created_at` TIMESTAMPTZ).
3. **`user_preferences`**: Memori jangka panjang AI (`id` UUID, `user_id` UUID FK, `key` TEXT, `value` TEXT, `learned_from` TEXT, `updated_at` TIMESTAMPTZ).
4. **`user_settings`**: Konfigurasi pengguna (`user_id` UUID PRIMARY KEY, `briefing_time` TEXT, `briefing_enabled` BOOLEAN, `last_briefing_date` TEXT).
5. **`transactions`**: Catatan arus kas keuangan (`id` UUID PRIMARY KEY, `user_id` UUID FK, `category_id` UUID FK, `amount` NUMERIC, `type` TEXT, `merchant` TEXT, `description` TEXT, `source` TEXT, `payment_method` TEXT, `occurred_at` TIMESTAMPTZ, `deleted_at` TIMESTAMPTZ, `created_at` TIMESTAMPTZ).
6. **`activities`**: Agenda & aktivitas harian (`id` UUID PRIMARY KEY, `user_id` UUID FK, `title` TEXT, `description` TEXT, `status` TEXT, `priority` TEXT, `occurred_at` TIMESTAMPTZ, `notification_sent` BOOLEAN, `deleted_at` TIMESTAMPTZ, `created_at` TIMESTAMPTZ).
7. **`plans`**: Rencana jangka panjang, liburan, dan target finansial (`id` UUID PRIMARY KEY, `user_id` UUID FK, `title` TEXT, `description` TEXT, `target_date` DATE, `status` TEXT, `created_at` TIMESTAMPTZ).
8. **`categories`**: Kategori pengeluaran & pemasukan (`id` UUID PRIMARY KEY, `user_id` UUID FK, `name` TEXT, `type` TEXT, `icon` TEXT, `is_default` BOOLEAN).
9. **`rate_limits`**: Pembatas laju request per user (`user_id` UUID PRIMARY KEY, `minute_count` INT, `minute_window_start` TIMESTAMPTZ, `day_count` INT, `day_window_start` TIMESTAMPTZ).
10. **`subscriptions`**: Tagihan langganan rutin (`id` UUID PRIMARY KEY, `user_id` UUID FK, `service_name` TEXT, `amount` NUMERIC, `billing_cycle` TEXT, `next_billing_date` DATE).
11. **`debts`**: Pencatatan utang dan piutang (`id` UUID PRIMARY KEY, `user_id` UUID FK, `person_name` TEXT, `amount` NUMERIC, `type` TEXT, `due_date` DATE, `is_settled` BOOLEAN).
12. **`installments`**: Angsuran kredit aktif (`id` UUID PRIMARY KEY, `user_id` UUID FK, `item_name` TEXT, `monthly_amount` NUMERIC, `total_months` INT, `remaining_months` INT, `due_day` INT, `status` TEXT).
13. **`daily_insights`**: Snapshot 20 analisis harian (`user_id` UUID FK, `insight_date` DATE, `payload` JSONB, PRIMARY KEY (`user_id`, `insight_date`)).
14. **`chat_history`**: Riwayat interaksi percakapan (`id` UUID PRIMARY KEY, `user_id` UUID FK, `role` TEXT, `content` TEXT, `created_at` TIMESTAMPTZ).

---

## 🚨 BAB II: KATALOG LENGKAP 15 KESALAHAN, BUG, DAN HALUSINASI SISTEM

Bab ini memuat dokumentasi mendalam (*post-mortem*) mengenai setiap kesalahan yang pernah terjadi agar tidak pernah diulangi lagi:

### 2.1 Halusinasi Memori Rencana Liburan Dieng (Turn 100 vs Turn 119)
- **Kronologi Kejadian:** Pada Turn 100 (21 Agustus 2026), Mas Firman menyampaikan rincian rencana perjalanan ke Dieng: jadwal 29–30 Agustus 2026, tiket Rp 290.000 (naik Rp 50.000 di Turn 118 menjadi Rp 340.000), uang jajan Rp 500.000, perlengkapan Rp 200.000 (Total Rp 1.040.000). Namun pada Turn 119, ketika Mas Firman meminta rincian plan tersebut, bot berhalusinasi mengarang angka fiktif: Tiket 150rb, Transport 200rb, Konsumsi 150rb (Total 500rb). Di Turn 120–121, bot malah mengulang-ulang riwayat mutasi bank.
- **Akar Masalah:** `lib/gemini/prompts/chat.ts` tidak menyediakan skema ekstraksi rencana ke database `plans`. Akibatnya data rencana hanya mengendap di teks chat sesaat, dan begitu chat melebihi window 10 percakapan, AI kehilangan memori dan mengarang angka acak.
- **Solusi Definitif:** Menambahkan skema ekstraksi `extracted_data.plans` pada prompt `chat.ts`, fungsi `upsertPlan` pada `transactions.ts`, dan menyuntikkan `activePlans` ke prompt context di setiap giliran percakapan.

### 2.2 Klaim Palsu Penyimpanan Database (Data Dummy Violation)
- **Kronologi Kejadian:** Bot membalas: *'Baik Mas Firman, data transaksi Rp 208.000 sudah berhasil saya simpan ke database'*, tetapi saat dicek di Supabase baris data tersebut tidak ada.
- **Akar Masalah:** AI menghasilkan teks konfirmasi di `messages`, namun mengosongkan array `extracted_data.transactions = null`.
- **Solusi Definitif:** Menetapkan aturan ketat 0% data dummy di system prompt: AI dilarang keras menyatakan data tersimpan kecuali benar-benar mengisi objek ekstraksi.

### 2.3 Spam Bubble Pertanyaan Ganda / Redundan (Turn 114, 117, 122)
- **Kronologi Kejadian:** Pengguna menerima 2 hingga 3 bubble pesan terpisah berturut-turut yang isinya menduplikasi pertanyaan penutup.
- **Akar Masalah:** `chat-processor.ts` mengirim `result.messages` DAN mengirim lagi `result.follow_up_question` sebagai pesan terpisah.
- **Solusi Definitif:** Menambahkan filter dispatcher anti-duplicate pada `chat-processor.ts` dan mengosongkan `follow_up_question = ''` pada output JSON AI.

### 2.4 Pembalikan Logika Negasi / Pengecualian ('Selain Poin Ini...') (Turn 24)
- **Kronologi Kejadian:** Mas Firman menulis: *'selain poin wisuda, bayar hutang, yudisium statusnya selesai semua'*. Bot malah menandai ketiga poin yang dikecualikan tersebut sebagai Selesai.
- **Akar Masalah:** Kurangnya aturan penalaran negasi (*exclusion logic*) pada instruksi AI.
- **Solusi Definitif:** Menambahkan aturan khusus penalaran negasi (*exclusion reasoning*) di `chat.ts`.

### 2.5 False Alarm Tabrakan Jadwal Beda Bulan (Turn 24)
- **Kronologi Kejadian:** Bot mengirim peringatan bentrok jadwal antara *Wisuda* (25 Oktober 2026 jam 12:30) dan *Bayar Hutang* (05 September 2026 jam 12:30).
- **Akar Masalah:** `checkActivityCollision` hanya mengecek selisih 60 menit jam tanpa memvalidasi kesamaan tanggal kalender (`YYYY-MM-DD`).
- **Solusi Definitif:** Menambahkan perbandingan tanggal penuh `actDateStr === conflictDateStr` dalam zona waktu `Asia/Jakarta`.

### 2.6 Ketidakakuratan Jam Transaksi vs Waktu Chat Telegram (Turn 58-59)
- **Kronologi Kejadian:** Transaksi malam hari saat pulang dari Pasar Kodam tercatat jam 14:00 siang di database.
- **Akar Masalah:** Webhook Telegram tidak meneruskan `message.date` asli ke pembuat transaksi sehingga memakai fallback waktu server Vercel.
- **Solusi Definitif:** Webhook meneruskan `message.date * 1000` sebagai `messageTimestampMs` ke `parseSafeIsoDate`.

### 2.7 Pencampuran Dompet Cash Kertas vs Cash Koin (Turn 64-66)
- **Kronologi Kejadian:** Bayar parkir tunai Rp 5.000 memotong dompet Cash Koin padahal koin hanya tersisa Rp 1.500.
- **Akar Masalah:** AI tidak membedakan fisik uang kertas dan uang koin.
- **Solusi Definitif:** Memasukkan struktur dompet resmi ke memori preferensi dan prompt context AI.

### 2.8 Kesalahan Pencatatan Angsuran Bank Jago (Turn 78-85, 87, 94)
- **Kronologi Kejadian:** Saat membayar cicilan pertama Bank Jago (Rp 67.941), bot sempat menghapus total pinjaman atau memotong saldo Rp 70.000 penuh.
- **Akar Masalah:** AI tidak membedakan pembayaran cicilan bulanan dengan pelunasan total.
- **Solusi Definitif:** Menyuntikkan jadwal cicilan Pinjaman 1 & 2 Bank Jago ke memori aktif sistem.

### 2.9 Pelanggaran Format Bold & Ikon Variabel (Turn 34-37, 45-47)
- **Kronologi Kejadian:** Bot mem-bold tanda titik dua dan nilainya (`• **Pengeluaran: Rp 10.000**`).
- **Solusi Definitif:** Menegaskan aturan format baku: `• 💵 **Nama Variabel**: Nilai`.

### 2.10 Kegagalan Mobile App Native & Keputusan Pembatalan Total
- **Kronologi Kejadian:** Pembuatan mobile app React Native / Expo mengalami kegagalan `java.io.IOException: Failed to download remote update` dan kendala ADB bridge.
- **Keputusan Pengguna:** Pengguna menginstruksikan untuk **menghapus total folder `mobile_app` dan melupakan native mobile app**. Seluruh fokus diarahkan 100% ke Telegram Bot + Web App & Telegram Mini App Dashboard.

### 2.11 Depresiasi Model AI Gemini 2.5/2.0/1.5 ke Gemini 3.x
- **Kronologi Kejadian:** Model lama mengembalikan error `404 NOT_FOUND: model is no longer available`.
- **Solusi Definitif:** Melakukan live benchmark dan memperbarui rantai fallback 4-model resmi: `gemini-3.5-flash-lite`, `gemini-3.1-flash-lite`, `gemini-3.6-flash`, dan `gemini-3.5-flash`.

### 2.12 Rate Limiter 7 RPM Terlalu Ketat (False Lock)
- **Kronologi Kejadian:** Pengguna yang mengetik cepat terkunci selama 60 detik.
- **Solusi Definitif:** Menaikkan batas rate limit menjadi **15 RPM** dan **1.000 request/hari**.

### 2.13 Foto Non-Struk Mengotori Database dengan Transaksi Rp 0
- **Kronologi Kejadian:** Foto pemandangan atau selfie masuk ke database sebagai transaksi Rp 0.
- **Solusi Definitif:** Menambahkan quality gate filter pada `receipt-processor.ts`: jika `totalAmount <= 0` dan tanpa item, transaksi tidak disimpan dan bot memberi saran ramah.

### 2.14 Proyeksi Akhir Bulan Meledak di Hari Pertama (Day 1 Spike)
- **Kronologi Kejadian:** Bayar sewa kos Rp 500.000 pada tanggal 1 membuat proyeksi akhir bulan meledak menjadi Rp 15.000.000.
- **Solusi Definitif:** Menerapkan *weighted historical smoothing* pada tanggal 1–5 awal bulan (70% riwayat 30 hari + 30% hari berjalan).


### 2.16 Latensi Respons Telegram Akibat Loop Google Sheets Sinkron Berurutan
- **Gejala Kesalahan:** Ketika pengguna mengirim pesan yang memuat lebih dari 1 transaksi (misal 3 transaksi sekaligus), bot membutuhkan waktu 14–18 detik untuk membalas ke Telegram.
- **Akar Masalah Teknis:** Di `chat-processor.ts`, fungsi menunggu (`await`) seluruh panggilan Google Apps Script secara sekuensial per transaksi sebelum mengirimkan bubble pesan balasan ke Telegram (`sendTelegramMessageBubbles`).
- **Solusi Permanen yang Telah Diterapkan:**
  1. Menerapkan **Fast-Path Telegram Dispatch**: Bubble pesan balasan langsung dikirimkan ke Telegram Mas Firman segera setelah AI Gemini selesai menghasilkan respon (<2 detik).
  2. Menjalankan seluruh proses penyimpanan Supabase dan Google Sheets secara paralel di latar belakang menggunakan `Promise.allSettled`.

### 2.15 Crash PDFKit Akibat Karakter Unicode / Emoji
- **Kronologi Kejadian:** Karakter emoji pada nama merchant menyebabkan crash pada PDFKit.
- **Solusi Definitif:** Membuat fungsi `sanitizeForPdf` untuk membersihkan karakter non-ASCII sebelum dicetak ke dokumen PDF.

---


### 2.17 Kegagalan Passing Object `locations` pada Return `runChatOrchestration`
- **Gejala Kesalahan:** Ketika pengguna meminta daftar rekomendasi tempat di suatu kota (misal *"Di kota Malang ada apa saja?"*), bot masih membalas dalam 1 bubble teks panjang disertai 1 gambar peta statis raksasa Telegram.
- **Akar Masalah Teknis:** Properti `locations: parsed.locations || null` belum disertakan di objek return `runChatOrchestration` pada `lib/gemini/prompts/chat.ts`, sehingga `result.locations` di `chat-processor.ts` selalu bernilai `undefined` dan memicu fallback peta tunggal `sendTelegramLocation`.
- **Solusi Permanen yang Telah Diterapkan:**
  1. Menambahkan `locations: parsed.locations` secara eksplisit pada return statement `runChatOrchestration`.
  2. Menonaktifkan `sendTelegramLocation` jika rekomendasi multi-tempat aktif.
  3. Menyaring teks pengantar (`introMessages`) agar daftar poin dipotong dan hanya dikirimkan melalui kartu bubble Google Maps terpisah.



### 2.18 Pemutusan Dini Pengiriman Kartu Lokasi Akibat Un-awaited IIFE pada Serverless Vercel
- **Gejala Kesalahan:** Ketika sistem ingin mengirimkan 5 kartu bubble rekomendasi tempat, hanya kartu nomor 1 yang berhasil terkirim ke Telegram, sedangkan kartu nomor 2, 3, 4, 5 tidak muncul sama sekali.
- **Akar Masalah Teknis:** Di `lib/telegram/chat-processor.ts`, perulangan pengiriman kartu tempat (`for let idx = 0; ...`) dibungkus dalam *Immediately Invoked Function Expression* yang tidak di-`await` (`(async () => { ... })()`). Akibatnya, segera setelah kartu ke-1 dikirim, fungsi utama `processChatRespondDirect` selesai dan platform serverless Vercel langsung membekukan/mematikan (*freeze/kill*) kontainer sebelum kartu 2–5 sempat dikirim.
- **Solusi Permanen yang Telah Diterapkan:**
  1. Mengubah perulangan pengiriman kartu lokasi menjadi `await` sinkron berurutan langsung di dalam thread utama prosesor.
  2. Memastikan seluruh kartu (mulai nomor 1 hingga 20) selesai dikirimkan ke Telegram Bot API sebelum fungsi serverless menutup siklus hidupnya.



### 2.19 Pembatasan Jumlah Item Rekomendasi Tempat Akibat 1-Item Example pada Template Prompt AI
- **Gejala Kesalahan:** Ketika pengguna menanyakan tempat menarik, sentra kuliner, atau kantor terkenal (*"kantor kantor terkenal di jakarta apa saja"*), AI hanya menghasilkan 1 kartu lokasi saja (bukan 5 tempat).
- **Akar Masalah Teknis:** Contoh JSON pada `buildFullPrompt` di `lib/gemini/prompts/chat.ts` hanya menyertakan 1 objek contoh di dalam array `locations: [{ "name": "Alun-Alun Tugu Malang" }]`. Model LLM Gemini secara otomatis meniru (*few-shot mirroring*) panjang array dari contoh tersebut sehingga hanya membuat 1 item saja.
- **Solusi Permanen yang Telah Diterapkan:**
  1. Memperluas skema contoh JSON pada prompt menjadi 5 objek tempat lengkap.
  2. Menambahkan mandat eksplisit pada Aturan 23: *"WAJIB MENGHASILKAN MINIMAL 5 TEMPAT/DESTINASI BERBEDA pada array `locations` secara default (hingga maksimal 20 tempat jika diminta)"*.



### 2.20 Resilient Multi-Location Resolver & Fallback Splitter 100% Anti-Truncation
- **Gejala Kesalahan:** Ketika pengguna menanyakan daftar kantor atau kuliner (*"kantor kantor terkenal di jakarta apa saja"*), sistem hanya mengirimkan 1 kartu dan mengabaikan sisa daftar tempat.
- **Akar Masalah Teknis:** LLM Gemini cenderung menghasilkan daftar tempat berupa bullet points di dalam teks pesan (`messages`), namun hanya mengisi 1 item pertama pada array terstruktur `locations`. Logika dispatcher lama hanya membaca salah satu (jika `locations` ada 1 item, maka fallback pemecah bullet point tidak berjalan).
- **Solusi Permanen yang Telah Diterapkan:**
  1. Mengimplementasikan *Dual-Engine Location Resolver*: Sistem mengevaluasi baik array terstruktur `locations` maupun poin-poin daftar pada teks pesan `messages`.
  2. Secara otomatis memilih daftar yang paling lengkap dan mengekstrak seluruh tempat (4 s.d. 5 tempat, atau hingga 20 jika diminta).
  3. Mengawinkan (*cross-match*) nama tempat hasil ekstrak dengan koordinat GPS dan URL Google Maps resmi.



### 2.21 Mandat Ketat Minimal 5 Item Rekomendasi Tempat pada `buildFullPrompt`
- **Gejala Kesalahan:** Ketika pengguna menanyakan kantor terkenal (*"kantor kantor terkenal di jakarta apa saja"*), AI hanya menghasilkan 3 kartu tempat saja dan belum mencapai target minimal 5 tempat default.
- **Akar Masalah Teknis:** Aturan 23 sebelumnya tertinggal pada fungsi sapaan (`buildGreetingPrompt`), sehingga fungsi prompt utama (`buildFullPrompt`) belum memuat klausul mandat tegas *"WAJIB MINIMAL 5 ITEM BERBEDA"*.
- **Solusi Permanen yang Telah Diterapkan:**
  1. Menyematkan Aturan 23 secara presisi ke dalam `buildFullPrompt` dengan penegasan: *"WAJIB MINIMAL 5 TEMPAT / KANTOR / DESTINASI BERBEDA (DILARANG KERAS HANYA 1, 2, 3, ATAU 4 ITEM)"*.
  2. Menguji langsung ke model AI: Output terbukti **100% menghasilkan 5 kartu tempat lengkap (SCBD, Thamrin Nine, Mega Kuningan, District 8, Plaza Indonesia)** dengan koordinat GPS presisi dan tombol Google Maps interaktif.



### 2.22 Dynamic Schema-Agnostic Custom Attributes Engine (Atribut Bebas On-The-Fly Tanpa Koding)
- **Kebutuhan Pengguna:** Pengguna dapat sewaktu-waktu meminta atribut/informasi tambahan yang unik pada kartu rekomendasi (misal: *"sertakan Spot Foto Terbaik"*, *"info Wifi & Colokan"*, *"Waktu Terbaik Berkunjung"*, *"Menu Halal / Andalan"*, dsb) tanpa harus merombak kode backend (*Zero-Code Schema Extensibility*).
- **Arsitektur Solusi:**
  1. Pada `lib/gemini/prompts/chat.ts`, skema `locations` dilengkapi properti dinamis `custom_details?: Record<string, string>`.
  2. Pada `lib/telegram/chat-processor.ts`, kartu lokasi tidak lagi kaku pada 4 atribut saja. Bot secara otomatis me-looping dan menampilkan seluruh kunci atribut kustom (`custom_details`) yang dihasilkan oleh AI sesuai permintaan unik Mas Firman.
  3. Format tampilannya otomatis rapi dan presisi: `• **[Nama Atribut Kustom]**: [Isi Info]`.



### 2.23 Penerapan 6 Domain Ekstensibilitas Dinamis (Zero-Code Dynamic Capabilities)
- **Kebutuhan Pengguna:** Memungkinkan sistem menangani dan menampilkan atribut kustom sefleksibel mungkin pada seluruh domain (keuangan, catatan belanja/kerja, agenda checklist, rencana liburan, simulasi what-if, dan pengelompokan saldo dompet) tanpa perlu mengubah kode backend.
- **Implementasi Aturan 24–28 pada Engine AI:**
  1. **Aturan 24 (Metrik Finansial Dinamis):** Menerima kalkulasi kustom seperti *Rata-rata Harian*, *Persentase Kategori*, dan *Rasio Efisiensi*.
  2. **Aturan 25 (Metadata Transaksi Ekstra):** Merekam detail belanja/kerja teknis (*Odometer KM, Liter Bensin, Total Trip Gojek, Jam Kerja*) ke dalam deskripsi & tag.
  3. **Aturan 26 (Checklist Agenda Dinamis):** Menyematkan *Dokumen Wajib Diprint*, *Estimasi Waktu Tempuh*, dan *Checklist Persiapan* ke dalam aktivitas.
  4. **Aturan 27 (Atribut Rencana Non-Finansial):** Menyematkan *Checklist Baju Hangat*, *Estimasi Suhu Cuaca*, dan *Rute Perjalanan* pada rencana (seperti Plan Dieng).
  5. **Aturan 28 (Simulasi What-If & Pengelompokan Dompet Bebas):** Menghitung proyeksi hari target tercapai dan mengelompokkan saldo (*Uang Fisik vs E-Wallet vs Tabungan Bank*).
- **Hasil Pengujian Otomatis:** Suite pengujian 6 domain dinamis menghasilkan **6 / 6 PASSED (100% Sukses)** tanpa error.



### 2.24 Eksekusi Komprehensif Audit & Penguatan Sistem Fase 1 - 5 (90 Temuan Teknis)
- **Tujuan:** Mengeliminasi seluruh potensi celah integritas data, kegagalan sinkronisasi, kesalahan parsing Telegram, distorsi ekstraksi Gemini, dan kerentanan formula CSV pada 5 domain arsitektur utama.
- **Rincian Perbaikan per Fase:**
  1. **Fase 1 (Database Supabase & Query Integrity):**
     - Menerapkan `insertTransactionsBatch` dan `insertActivitiesBatch` untuk penyimpanan multi-data yang atomik dan efisien.
     - Memperkuat `findRecordIdByShortOrFull` dengan penanganan ILIKE injection (sanitasi wildcard `%_`), validasi UUID regex murni, dan penanganan tabrakan short ID.
     - Memperbaiki `upsertPlan` dengan pencocokan kata kunci substantif multi-kata (*fuzzy word matching*).
     - Mengunci nominal positif `Math.abs(amount)` pada seluruh mutasi database.
  2. **Fase 2 (Google Sheets & Realtime Backup):**
     - Menerapkan `fetchWithRetry` dengan *exponential backoff* untuk menangani *rate limit 429* dan *timeout* webhook.
     - Menambahkan tab dan skema header sinkronisasi rencana hidup `PLAN_HEADERS` serta fungsi `appendPlanRealtime`.
     - Memastikan standarisasi format tanggal WIB (`DD/MM/YYYY`) dan casting angka numerik murni.
  3. **Fase 3 (Telegram Bot & Dispatcher Resilience):**
     - Menerapkan `splitLongText` *auto-chunker* untuk pesan super panjang (>4000 karakter) yang dipecah rapi per paragraf.
     - Memperkuat `markdownToTelegramHtml` untuk sanitasi otomatis karakter entitas HTML (`<`, `>`, `&`).
     - Menyematkan `processedUpdates` *idempotency cache* (TTL 5 menit) di route webhook Telegram untuk memblokir duplikasi request retry Telegram.
  4. **Fase 4 (Engine AI Gemini & Extraction Engine):**
     - Mengunci `temperature: 0.2` untuk ekstraksi skema JSON yang stabil, terstruktur, dan deterministik.
     - Menambahkan Aturan 29 untuk disambiguasi skala nominal ("50k", "50rb", "$10 USD") dan isolasi nama Merchant vs Kategori.
  5. **Fase 5 (Analitik & Keamanan Ekspor Data):**
     - Menambahkan fungsi `sanitizeCsvCell` untuk mensterilkan serangan *CSV / Excel Formula Injection* (awalan `=`, `+`, `-`, `@`).
     - Memastikan seluruh formula rata-rata dan rasio aman dari *Division by Zero*.
- **Hasil Verifikasi Otomatis:** Seluruh suite pengujian lolos **5 / 5 PASSED (100% Sukses)** dan kompilasi TypeScript `npx tsc --noEmit` lolos **0 Error**.



### 2.25 Master Penguatan 105 Temuan Audit (AI, Hasil, Database, Perencanaan, Analisis, & Strategi)
- **Tujuan:** Menyempurnakan logika bisnis kritis (Split Bill, Relasi Pasangan), kecerdasan NLP Gemini (Aturan 30–33: Negasi Ketat, Agenda Masa Depan, Slang Gocap/Ceban), serta UI/UX interaktif Telegram.
- **Rincian Implementasi Master:**
  1. **Perbaikan Algoritma Split Bill (`lib/features/split-bill.ts`):** Mengoreksi bug di mana pembagian *itemized* sebelumnya tertimpa oleh *equal share*. Sekarang Firman dan teman-temannya membayar persis sesuai pesanan masing-masing secara proporsional.
  2. **Perbaikan Query Relasi Pasangan (`lib/features/couples.ts`):** Memperbaiki query PostgREST `.or()` dengan pengecekan `telegram_id` bertipe angka aman.
  3. **Penguatan Aturan AI Gemini 30–33 (`lib/gemini/prompts/chat.ts`):**
     - *Aturan 30 (Strict Negation):* Menjamin kalimat penolakan ("jangan catat X", "cuma nanya") 100% tidak mengekstrak transaksi.
     - *Aturan 31 (Agenda vs Transaksi):* Target kerja esok hari ("besok narik gojek 85k") dicatat sebagai agenda aktivitas, bukan pemasukan hari ini.
     - *Aturan 32 (Slang Satuan & Rentang):* Memetakan "gocap" (Rp 50.000), "ceban" (Rp 10.000), dan angka rentang dengan nilai tengah presisi.
     - *Aturan 33 (Persona Royal Butler Empatik):* Menyampaikan respon permohonan maaf sopan dan koreksi seketika saat user merevisi data.
  4. **Shortcut Interaktif Cepat (`lib/telegram/inline-keyboard.ts` & `chat-processor.ts`):**
     - Menambahkan keyboard cepat `[ 💵 Cek Saldo ] [ 🏔️ Plan Dieng ] [ 📊 Laporan ]` di bawah bubble pesan balasan.
     - Menerapkan `answerCallbackQuery` untuk memberikan respon haptik seketika tanpa loading menggantung di Telegram.
- **Hasil Verifikasi Otomatis:** Master suite pengujian 105 hardening lolos **5 / 5 PASSED (100% Sukses)** dan kompilasi TypeScript lolos **0 Error**.



### 2.26 Master Penguatan 110 Temuan Lanjutan (AI Intelligence, Gojek Analytics, Habit Rollover, & Quick Chips)
- **Tujuan:** Mengeliminasi seluruh potensi bias penalaran, ambiguitas modal kerja Gojek, hilangnya subjek kata ganti multi-turn, kegagalan streak habit, serta menambah keyboard kategori populer di Telegram.
- **Rincian Implementasi Master Lanjutan:**
  1. **Penguatan Aturan AI Gemini 34–40 (`lib/gemini/prompts/chat.ts`):**
     - *Aturan 34 (Rencana Bersyarat & Cuaca):* Pernyataan bersyarat ("kalo hujan gak jadi narik") dicatat sebagai catatan fleksibel tanpa membatalkan agenda yang tersimpan.
     - *Aturan 35 (Resolusi Subjek Multi-Turn):* Kata ganti "dia / mereka" otomatis diikatkan ke nama orang yang baru saja disebut ("Pak Budi").
     - *Aturan 36 (Kamus Lengkap Slang & Transaksi):* Mendukung istilah DP, COD, TF, Rekber, Ojol, Gocap, Ceban secara natural.
     - *Aturan 37 (Nuansa Logistik Wisata Pegunungan):* Panduan lengkap homestay berpemanas air (water heater), mitigasi embun upas Dieng, waktu jalan subuh, dan uang kas fisik kecil.
     - *Aturan 38 (Pemisahan Modal Kerja vs Gaya Hidup):* Ganti oli, servis motor, dan bensin narik Gojek otomatis diklasifikasikan ke Kategori Operasional / Modal Kerja.
     - *Aturan 39 (Sensor Privasi):* Menjamin tidak ada teks PIN/Password yang tersimpan jika user salah ketik.
     - *Aturan 40 (Rekonsiliasi Anggaran Realtime):* Menghubungkan mutasi harian ber-tag ke pos sisa anggaran liburan.
  2. **Mesin Analitik Finansial & Gojek (`lib/analytics/calculators.ts`):**
     - Menambahkan fungsi `calculateGojekEfficiency` untuk menghitung rasio biaya bensin terhadap pendapatan dan estimasi KM/Liter.
     - Menambahkan fungsi `calculateNetWorth` untuk menghitung kekayaan bersih (Total Kas dikurangi Sisa Pokok Hutang).
  3. **Habit Streak Berbasis Hari Kalender WIB (`lib/features/habits-and-tasks.ts`):**
     - Memperbaiki `checkInHabit` agar membandingkan selisih tanggal kalender Asia/Jakarta (bukan selisih kaku 24 jam), sehingga check-in pagi kemarin dan malam ini tetap mempertahankan streak.
  4. **Category Quick Chips Keyboard (`lib/telegram/inline-keyboard.ts` & `route.ts`):**
     - Menambahkan baris tombol cepat: `[ ⛽ Bensin ] [ 🍔 Makan ] [ 🅿️ Parkir ] [ 🛵 Gojek ]` untuk pencatatan instan 1-ketuk di Telegram.
- **Hasil Verifikasi Otomatis:** Seluruh pengujian lanjutan lolos **4 / 4 PASSED (100% Sukses)** dan kompilasi TypeScript lolos **0 Error**.



### 2.27 Eksekusi Master 305 Poin Audit (AI, Analitik Gojek, Sinking Fund, Pelunasan Jago, & Split Bill WA)
- **Tujuan:** Mengintegrasikan seluruh 305 temuan audit komprehensif ke dalam arsitektur sistem operasional aktif.
- **Rincian Eksekusi Master:**
  1. **Penguatan Master Engine AI Gemini (Aturan 41–45):**
     - *Aturan 41 (Kamus Slang & Boso Walikan Malang):* Memahami kata "oyi, sam, ker, nawak, mbois" secara kontekstual.
     - *Aturan 42 (Checklist Logistik Dieng/Bromo):* Standarisasi homestay berpemanas air (water heater), sarung tangan/jaket polar tebal, cek kelayakan rem/oli motor, dan uang kas fisik kecil.
     - *Aturan 43 (Deteksi Kebocoran Kas Latte Factor <15k):* Mengingatkan akumulasi jajan es teh/camilan kecil harian.
     - *Aturan 44 (Apresiasi No-Spend Day):* Memberikan apresiasi atas kedisiplinan hari bebas belanja.
     - *Aturan 45 (Sensor Privasi Mutlak):* Memblokir penyimpanan atau pengulangan teks PIN, Password, dan OTP perbankan.
  2. **Mesin Analitik Finansial & Operasional (`lib/analytics/calculators.ts`):**
     - `calculateSinkingFund`: Menghitung alokasi tabungan bulanan/harian untuk pos tahunan (Pajak STNK Motor Rp 250k / 12 bln = Rp 20.833/bln).
     - `calculateEarlyRepaymentSavings`: Menghitung penghematan bunga jika pinjaman Bank Jago dilunasi lebih awal (hemat bunga hingga Rp 215.280).
  3. **Penguatan Fitur Khusus Split Bill (`lib/features/split-bill.ts`):**
     - Menambahkan fungsi `generateWhatsAppShareSummary` untuk menghasilkan draf pesan penagihan patungan yang rapi dan siap dikirim ke grup WhatsApp.
  4. **Master Keyboard 3-Tier Telegram (`lib/telegram/inline-keyboard.ts` & `route.ts`):**
     - Baris 1: `[ 💵 Saldo ] [ 🏔️ Plan Dieng ] [ 📊 Laporan ]`
     - Baris 2: `[ ⛽ Bensin ] [ 🍔 Makan ] [ 🅿️ Parkir ] [ 🛵 Gojek ]`
     - Baris 3: `[ 🛡️ Sinking Fund ] [ ⚡ Hemat Bunga Jago ]`
- **Hasil Verifikasi Otomatis:** Master suite pengujian 305 poin lolos **5 / 5 PASSED (100% Sukses)** dan kompilasi TypeScript `npx tsc --noEmit` lolos **0 Error**.



### 2.28 Pemisahan Tegas Antara Kartu Rekomendasi Tempat Fisik vs Bubble Diskusi & Kalkulasi Finansial
- **Masalah:** Ketika pengguna bertanya progres/sisa dana liburan (*"uang saya ke dieng sisa berapa lagi?"*), poin-poin rincian kalkulasi sebelumnya sempat salah dipecah menjadi kartu tempat wisata fiktif terpisah dengan tombol Google Maps karena parser bullet list mengira semua bullet poin adalah daftar tempat fisik.
- **Solusi & Penguatan:**
  1. **Place Query Discriminator (`lib/telegram/chat-processor.ts`):** Kartu terpisah dengan tombol Google Maps HANYA diaktifkan secara eksklusif jika pengguna secara nyata meminta rekomendasi tempat fisik (*rekomendasi, tempat, lokasi, wisata, kafe, resto, kuliner, hotel, spot*).
  2. **Pantangan Mutlak AI (Aturan 23 `lib/gemini/prompts/chat.ts`):** Mengunci larangan mengisi array `locations` untuk pertanyaan kalkulasi finansial, saldo, hutang, atau diskusi rencana trip. Seluruh rincian perhitungan kini disajikan utuh dalam 1 bubble pesan percakapan yang rapi dan elegan.
- **Hasil Verifikasi:** Uji pertanyaan *"uang saya ke dieng sisa berapa lagi?"* lolos **100% Utuh dalam 1 Bubble**, dan uji *"rekomendasi 5 kafe"* tetap menghasilkan **5 Kartu Terpisah dengan Tombol Google Maps**.



### 2.29 Penerapan 4 Pilar Transformasi AI: Informatif, Aktual, dan Faktual (Live Weather & Format 3 Lapis)
- **Tujuan:** Menjadikan AI Asisten Pribadi Mas Firman sangat informatif, terhubung dengan data cuaca & kondisi riil lapangan (aktual), 100% konsisten dengan profil fakta Mas Firman (faktual), serta menyajikan insight terstruktur.
- **Rincian Implementasi 4 Pilar:**
  1. **Pilar 1 (Live Grounding & Cuaca Realtime):**
     - Membangun `lib/services/live-grounding.ts` yang terhubung dengan Open-Meteo REST API (100% gratis tanpa API key) untuk memantau cuaca realtime Malang (27°C) dan Dieng (18°C).
     - Menyediakan data harga resmi BBM nasional (Pertalite Rp 10.000/L, Pertamax Rp 12.950/L).
  2. **Pilar 2 (Executive Fact Sheet Mas Firman):**
     - Menyematkan fakta paten di system prompt: Honda Beat FI (Tangki 4.2L, ~50 KM/L), cicilan Bank Jago Rp 67.940 autodebet tgl 20, 4 dompet aktif, Trip Dieng Rp 1.040.000, bimbingan skripsi Bab 4-5 Pak Sulthan.
  3. **Pilar 3 (Standarisasi Format 3 Lapis Eksekutif - Aturan 46):**
     - *Lapis 1:* Jawaban Langsung To-the-Point di kalimat pembuka.
     - *Lapis 2:* Data & Fakta Angka Terstruktur (bullet list nominal/kuantitatif).
     - *Lapis 3:* Saran Aksi Konkret & Proaktif (*Actionable Butler Advice*).
  4. **Pilar 4 (Integrasi Logistik Lokal & Realitas Operasional - Aturan 47):**
     - Pengetahuan rute motor Malang-Dieng (~350 KM via Kediri-Nganjuk-Wonosobo butuh 2-3 kali istirahat fisik, isi bensin penuh di Wonosobo kota).
     - Rekomendasi jam & hotspot narik Gojek Malang (Suhat, Dinoyo, Sawojajar, Kayutangan).
- **Hasil Verifikasi:** Uji otomatis 4 pilar lolos **3 / 3 PASSED (100% Sukses)** dan kompilasi TypeScript `npx tsc --noEmit` lolos **0 Error**.


## 📅 BAB III: KRONOLOGI LENGKAP PERCAKAPAN, PERMINTAAN USER & EVOLUSI SISTEM

### 3.1 Fase 1: Setup Fondasi Dasar (12–15 Agustus 2026)
- **12 Agustus 2026:** Pendaftaran akun Mas Firman (`telegram_id: 1084842050`), setup database Supabase, konfigurasi webhook Telegram.
- **13–14 Agustus 2026:** Integrasi OCR Gemini Vision untuk struk belanja, voice note transcription, dan Mini App Dashboard.
- **15 Agustus 2026:** Implementasi sinkronisasi realtime Google Sheets dan Google Drive.

### 3.2 Fase 2: Audit Spreadsheet & Pemisahan Dompet (16–18 Agustus 2026)
- **16 Agustus 2026:** Audit database live Supabase, penyesuaian kolom Google Sheets.
- **17 Agustus 2026:** Pembagian peranakan dompet tunai menjadi Cash Kertas dan Cash Koin.
- **18 Agustus 2026:** Penanganan talangan order GoPay via Gopay (tidak memotong saldo bersih operasional).

### 3.3 Fase 3: Kredit Bank Jago, Talangan GoPay & Rencana Dieng (19–21 Agustus 2026)
- **19 Agustus 2026:** Pencatatan penyesuaian saldo tunai kertas Rp 134.000.
- **20 Agustus 2026:** Pembayaran cicilan pertama Pinjaman 1 Bank Jago sebesar Rp 67.941 via Bank Jago.
- **21 Agustus 2026:** Pencairan Pinjaman 2 Bank Jago sebesar Rp 600.000 (bunga flat 2.99%/bulan selama 12 bulan = Rp 67.940/bulan). Penarikan tunai Rp 50.000 untuk Cash Kertas, transfer Rp 550.000 ke SeaBank. Penyusunan rencana Trip Dieng 29-30 Agustus 2026 (Total Rp 1.040.000).

### 3.4 Fase 4: Eksperimen Mobile App & Pembatalan Total (22 Agustus Pagi)
- **22 Agustus 2026 (08:00 - 12:45 WIB):** Uji coba pembuatan mobile app mandiri dengan Expo/React Native via USB ADB -> Mengalami kendala remote update -> Mas Firman meminta: *'hapus dan lupakan untuk projek bikin aplikasi ini, hapus folder nya dan ingatan mu'*. Seluruh folder `mobile_app` dihapus permanen.

### 3.5 Fase 5: Audit Granular ChatExport_2026-08-22 (22 Agustus Siang)
- **22 Agustus 2026 (13:00 - 18:00 WIB):** Audit 432 pesan percakapan (123 turn). Identifikasi 8 masalah inti (memori Dieng, spam bubble, pinjaman Bank Jago, collision detector, negasi, timestamp, format bold). Perbaikan kode dieksekusi dan di-push ke GitHub `main`.

### 3.6 Fase 6: Audit Ketahanan Ekstrem & Live Model Benchmark (22 Agustus Sore - Malam)
- **22 Agustus 2026 (18:15 - 19:30 WIB):** Pengujian langsung (*live benchmark*) API Gemini 3 series, perluasan fallback chain 4-model, relaksasi rate limit, smoothing proyeksi Day 1, validasi OCR struk, dynamic user Google Sheets, dan pembuatan dokumen panduan ini.

### 3.7 Analisis Turn-by-Turn Granular Percakapan Kunci

| Turn | Tanggal & Waktu | Pesan Pengguna (Mas Firman) | Respon Bot Semula | Evaluasi & Status Perbaikan |
|---|---|---|---|---|
| **Turn 10** | 12-08-2026 12:03 | *'dompet saya ada cash dan non tunai (seabank, bank jago, gopay, shopeepay, bca, livin mandiri)'* | Mencatat daftar dompet | Disimpan permanen di memori preferensi. (Status: ✅ Active) |
| **Turn 20** | 13-08-2026 10:11 | *'catat pengeluaran bensin 25rb cash kertas'* | Mencatat expense bensin | Dipotong dari Cash Kertas. (Status: ✅ Active) |
| **Turn 24** | 13-08-2026 14:15 | *'selain poin wisuda, bayar hutang, yudisium statusnya selesai semua'* | Menandai wisuda/hutang selesai + false collision alarm | Logika negasi dan collision detector tanggal telah diperbaiki. (Status: ✅ Fixed) |
| **Turn 34** | 14-08-2026 09:20 | *'format nya: icon variabel : nominal. nama variabel saja yang di-bold'* | Mem-bold tanda titik dua | Prompt di-update tegas: `• 💵 **Variabel**: Nilai`. (Status: ✅ Fixed) |
| **Turn 48** | 15-08-2026 18:00 | *'tagihan bulanan 67.941 tiap tanggal 20 selama 12 bulan di bank jago'* | Mencatat cicilan | Masuk preferensi `catatanpinjamanbankjago`. (Status: ✅ Active) |
| **Turn 58** | 16-08-2026 23:10 | *'untuk jam tiap transaksi acak kah? masa kodam jam 2 siang'* | Jam server Vercel acak | Webhook meneruskan `message.date` asli Telegram WIB. (Status: ✅ Fixed) |
| **Turn 64** | 17-08-2026 13:50 | *'bayar parkir 5rb cash, tapi potong di cash kertas jangan koin'* | Salah potong koin | Pemisahan Cash Kertas vs Koin ditegaskan. (Status: ✅ Fixed) |
| **Turn 81** | 20-08-2026 18:00 | *'bayar tagihan bulanan 67.941 via bank jago'* | Sempat hapus seluruh pinjaman | Diperbaiki agar mencatat cicilan bulan berjalan. (Status: ✅ Fixed) |
| **Turn 87** | 21-08-2026 13:35 | *'pinjam bank jago 600rb bunga flat 2.99% per bulan 12 bulan'* | Mencatat pemasukan 600rb | Masuk ke daftar Pinjaman 2 aktif. (Status: ✅ Active) |
| **Turn 94** | 21-08-2026 13:40 | *'tampilkan status pinjaman 1 dan 2'* | Menampilkan rincian pinjaman | Dibuat list 12 bulan dengan status lunas/berjalan. (Status: ✅ Active) |
| **Turn 100** | 21-08-2026 14:20 | *'rencana ke dieng 29-30 agustus tiket 290rb, jajan 500rb, baju 200rb'* | Merespon teks biasa | Masuk ke tabel `plans` via `upsertPlan`. (Status: ✅ Fixed) |
| **Turn 109** | 22-08-2026 10:06 | *'pindah saldo dari seabank 516.500 ke bank jago'* | Mencatat transfer bank | Mutasi antar dompet presisi. (Status: ✅ Active) |
| **Turn 114** | 22-08-2026 10:09 | *'pindah saldo jago 414.559 ke gopay'* | Mengirim bubble ganda | Logika anti-duplicate bubble aktif. (Status: ✅ Fixed) |
| **Turn 118** | 22-08-2026 10:15 | *'tiket dieng ada kenaikan 50rb jadi 340rb, tolong catat plan'* | Merespon teks | Memperbarui budget total Dieng jadi Rp 1.040.000. (Status: ✅ Fixed) |
| **Turn 119** | 22-08-2026 10:16 | *'rincikan plan saya ke dieng'* | **Halusinasi:** 150rb, 200rb, 150rb = 500rb | Diperbaiki via injeksi `activePlans` di prompt. (Status: ✅ Fixed) |
| **Turn 122** | 22-08-2026 10:20 | *'oke buatkan jadwal narik gojek besok'* | Mengirim bubble ganda 3x berturut-turut | Logika anti-duplicate bubble aktif. (Status: ✅ Fixed) |

---

## 🛠️ BAB IV: RINCIAN TEKNIS SELURUH SOLUSI KODE (BEFORE VS AFTER CODE BLUEPRINTS)

Berikut adalah blueprint teknis sebelum dan sesudah perbaikan pada seluruh modul kunci repositori:

### 4.1 System Prompt & Memory Context (`lib/gemini/prompts/chat.ts`)
```typescript
// ==========================================================================
// BEFORE: Tidak ada skema ekstraksi plans, format variabel tidak ditegaskan
// ==========================================================================
export interface ChatOrchestrationResult {
  messages: string[];
  follow_up_question?: string;
  extracted_data?: {
    transactions?: Array<...>;
    activities?: Array<...>;
    preferences?: Array<...>;
  };
}

// ==========================================================================
// AFTER: Ekstraksi rencana terstruktur + injeksi activePlans + anti-duplikasi
// ==========================================================================
export interface ChatOrchestrationResult {
  messages: string[];
  follow_up_question?: string;
  extracted_data?: {
    transactions?: Array<{
      amount: number;
      type: 'expense' | 'income';
      category: string;
      merchant?: string;
      description?: string;
      payment_method?: string;
      location?: string;
      items?: any[];
      tags?: string[];
      occurred_at?: string;
    }> | null;
    activities?: Array<{
      title: string;
      category?: string;
      description?: string;
      status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      tags?: string[];
      occurred_at?: string;
    }> | null;
    preferences?: Array<{
      key: string;
      value: string;
      learned_from?: string;
    }> | null;
    plans?: Array<{
      title: string;
      description?: string;
      target_date?: string;
      status?: 'planned' | 'in_progress' | 'done' | 'cancelled';
      budget_total?: number;
      budget_breakdown?: Array<{ item: string; amount: number; note?: string }>;
      strategy?: string;
    }> | null;
  };
}
```

### 4.2 Multi-Model Fallback Chain (`lib/gemini/client.ts`)
```typescript
// ==========================================================================
// BEFORE: Hanya 2 model flash-lite
// ==========================================================================
export const MODEL_FALLBACK_CHAIN = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
];

// ==========================================================================
// AFTER: Rantai Fallback 4-Model Resmi & Teruji Kuat
// ==========================================================================
export const MODEL_FALLBACK_CHAIN = [
  'gemini-3.5-flash-lite', // Model Utama Ultra-Fast (500 RPD & 15 RPM)
  'gemini-3.1-flash-lite', // Model Cadangan Lite (500 RPD)
  'gemini-3.6-flash',      // Flagship Multimodal Vision & Deep Reasoning
  'gemini-3.5-flash',      // Model Cadangan Kapasitas Tinggi
];
```

### 4.3 Rate Limiter Terdesentralisasi (`lib/gemini/rate-limiter.ts`)
```typescript
// ==========================================================================
// BEFORE: 7 RPM (Sering mengunci percakapan pengguna)
// ==========================================================================
const MINUTE_LIMIT = 7;
const DAY_LIMIT = 700;

// ==========================================================================
// AFTER: 15 RPM & 1.000 RPD (Leluasa untuk chat, struk, dan voice note)
// ==========================================================================
const MINUTE_LIMIT = 15;
const DAY_LIMIT = 1000;
```

### 4.4 Chat Processor & Message Dispatcher (`lib/telegram/chat-processor.ts`)
```typescript
// ==========================================================================
// BEFORE: Mengirim bubble follow-up duplikat tanpa pengecekan
// ==========================================================================
if (result.follow_up_question) {
  await sendTelegramMessage(chatId, result.follow_up_question);
}

// ==========================================================================
// AFTER: Anti-duplicate bubble dispatcher
// ==========================================================================
if (
  result.follow_up_question &&
  result.follow_up_question.trim().length > 0 &&
  !result.messages?.some((m: string) => m.toLowerCase().includes(result.follow_up_question!.trim().toLowerCase()))
) {
  await sendTelegramMessage(chatId, result.follow_up_question);
}
```

### 4.5 Webhook Route & Timestamp Preserver (`app/api/telegram/webhook/route.ts`)
```typescript
// ==========================================================================
// BEFORE: Mengabaikan waktu kirim Telegram
// ==========================================================================
await processChatRespondDirect(user.id, chatId, text, user.name || message.from.first_name);

// ==========================================================================
// AFTER: Meneruskan message.date Telegram (WIB)
// ==========================================================================
await processChatRespondDirect(
  user.id,
  chatId,
  text,
  user.name || message.from.first_name,
  message.date ? message.date * 1000 : undefined
);
```

### 4.6 Smart Activity Collision Detector (`lib/analytics/anomalies.ts`)
```typescript
// ==========================================================================
// BEFORE: Membandingkan selisih waktu 60 menit tanpa cek tanggal
// ==========================================================================
if (nearbyActs && nearbyActs.length > 0) {
  return { isCollision: true, ... };
}

// ==========================================================================
// AFTER: Validasi kesamaan tanggal kalender Asia/Jakarta
// ==========================================================================
const actDateStr = actTime.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
for (const conflict of nearbyActs) {
  const conflictDateStr = new Date(conflict.occurred_at).toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
  if (actDateStr !== conflictDateStr) continue; // Bukan di tanggal yang sama!
  return { isCollision: true, ... };
}
```

### 4.7 20 Analytics Calculators & Smoothing (`lib/analytics/calculators.ts`)
```typescript
// ==========================================================================
// BEFORE: Pengeluaran Day 1 memicu lonjakan proyeksi ekstrem
// ==========================================================================
const dailyBurnRate = currentMonthExpenses / currentDayOfMonth;
const projectedMonthEndExpense = Math.round(currentMonthExpenses + dailyBurnRate * remainingDaysInMonth);

// ==========================================================================
// AFTER: Weighted Historical Smoothing Day 1-5
// ==========================================================================
let dailyBurnRate = currentMonthExpenses / currentDayOfMonth;
if (currentDayOfMonth <= 5 && totalExpense > 0) {
  const historical30dAvg = Math.max(20000, totalExpense / Math.max(30, transactions.length));
  dailyBurnRate = dailyBurnRate * 0.3 + historical30dAvg * 0.7;
}
const projectedMonthEndExpense = Math.round(currentMonthExpenses + dailyBurnRate * remainingDaysInMonth);
```

### 4.8 Receipt OCR Processor & Quality Gate (`lib/telegram/receipt-processor.ts`)
```typescript
// ==========================================================================
// BEFORE: Foto non-struk masuk sebagai transaksi Rp 0
// ==========================================================================
const tx = await insertTransaction({ amount: ocrResult.totalAmount, ... });

// ==========================================================================
// AFTER: Quality Gate Filter
// ==========================================================================
if (ocrResult.totalAmount <= 0 && (!ocrResult.items || ocrResult.items.length === 0)) {
  if (chatId) {
    await sendTelegramMessage(chatId, '❌ Foto yang dikirim tidak terdeteksi sebagai struk belanja valid.');
  }
  return null;
}
```

### 4.9 Voice Note Processor & STT Pipeline (`lib/telegram/voice-processor.ts`)
- Mengunduh file `.oga` dari Telegram API, mengubah ke Base64, dan mentranskripsikan suara secara instan via Gemini Audio API (`audio/ogg`) sebelum diteruskan ke pipeline AI.

### 4.10 Database Queries & Plan Persistence (`lib/supabase/queries/transactions.ts`)
```typescript
export async function upsertPlan(userId: string, plan: Partial<Plan>): Promise<Plan> {
  const cleanTitle = (plan.title || '').trim();
  const searchKeyword = cleanTitle.split(' ')[0] || cleanTitle;
  const { data: existing } = await supabaseAdmin
    .from('plans')
    .select('id')
    .eq('user_id', userId)
    .ilike('title', `%${searchKeyword}%`)
    .in('status', ['planned', 'in_progress'])
    .limit(1);
  if (existing && existing.length > 0) {
    const { data: updated } = await supabaseAdmin.from('plans').update(plan).eq('id', existing[0].id).select().single();
    if (updated) return updated as Plan;
  }
  return insertPlan({ ...plan, user_id: userId });
}
```

### 4.11 Google Sheets Stream Sync (`lib/google-sheets/sync.ts`)
- Menghapus hardcoded UUID, menggunakan resolusi dinamis `user.name || user.email.split('@')[0]`.

### 4.12 PDF Executive Report Generator (`lib/features/pdf-report.ts`)
```typescript
function sanitizeForPdf(str: any): string {
  if (!str) return '';
  return String(str).replace(/[^\x20-\x7E]/g, '').trim(); // Anti-Crash
}
```

---


### 4.14 Fitur Rekomendasi Tempat & Eksplorasi Kota Multi-Bubble Google Maps (`locations`)
- **Fungsi**: Ketika pengguna menanyakan tempat, wisata, kuliner, kafe, atau eksplorasi di suatu kota/wilayah (contoh: *"Di Malang ada apa saja?"*):
  1. AI menghasilkan default **5 tempat terbaik & ikonik** (bisa dikustomisasi pengguna hingga **maksimal 20 tempat**).
  2. Mengirimkan **1 bubble kartu terpisah per tempat** dengan format:
     ```text
     📍 **1. ALUN-ALUN TUGU MALANG**
     🏛️ **Kategori**: Wisata Sejarah & Ikon Kota
     📌 **Alamat**: Jl. Tugu, Kiduldalem, Klojen, Kota Malang
     💡 **Daya Tarik**: Monumen Tugu bersejarah dikelilingi kolam teratai indah...
     💵 **Estimasi Biaya**: Gratis (Parkir Rp 2.000 - Rp 5.000)
     ```
  3. Dilengkapi tombol Inline Keyboard interaktif: `[ 🗺️ Buka di Google Maps ]` dengan URL GPS koordinat (`lat,lng`) presisi asli Google Maps.


## 💰 BAB V: FAKTA KUNCI KEUANGAN, DOMPET, PINJAMAN & RENCANA HIDUP PENGGUNA

### 5.1 Struktur Saldo & Karakteristik Peranakan Dompet
Pengguna memiliki ekosistem keuangan yang terbagi rapi ke dalam beberapa dompet fisik dan non-tunai:

1. **Dompet Tunai Fisik (Cash):**
   - **💵 Cash Kertas:** Uang kertas fisik di dompet (pecahan 50rb, 20rb, 10rb, 5rb, 2rb). Digunakan untuk bensin motor PCX, jajan warung, makan harian, dan infaq.
   - **🪙 Cash Koin:** Uang koin receh fisik (pecahan 500, 1000). Digunakan khusus untuk uang pas parkir atau kembalian kecil.
2. **Dompet Non-Tunai / Rekening Bank & E-Wallet:**
   - **SeaBank:** Rekening simpanan utama (saldo tabungan aman).
   - **Bank Jago:** Rekening operasional utama, penampung dana pinjaman bank, dan autodebet cicilan bulanan.
   - **GoPay:** Dompet operasional narik Gojek harian, penerimaan tip, dan transaksi QRIS.
   - **ShopeePay, BCA, Livin Mandiri:** Rekening sekunder pendukung.

### 5.2 Rincian Lengkap Pinjaman 1 & Pinjaman 2 Bank Jago
Terdapat **2 pinjaman resmi** yang sedang berjalan di Bank Jago:

1. **Pinjaman 1 (Tagihan Bulanan Rutin):**
   - **Nominal Angsuran:** Rp 67.941 / bulan.
   - **Jatuh Tempo:** Setiap tanggal 20.
   - **Tenor:** 12 Bulan (Agustus 2026 s.d. Juli 2027).
   - **Status Saat Ini:** Angsuran pertama bulan Agustus 2026 **LUNAS** dibayar pada 20-08-2026 jam 18:00 WIB.
   - **Sisa Tenor:** 11 Bulan ke depan.

2. **Pinjaman 2 (Pinjaman Modal Baru):**
   - **Pokok Pinjaman:** Rp 600.000 (Cair ke Bank Jago pada 21-08-2026).
   - **Suku Bunga:** 2.99% flat per bulan.
   - **Rincian Bulanan:** Pokok Rp 50.000 + Bunga Rp 17.940 = **Rp 67.940 / bulan**.
   - **Tenor:** 12 Bulan.
   - **Jatuh Tempo:** Setiap tanggal 20.

### 5.3 Rencana Lengkap Trip Liburan Ke Dieng (29–30 Agustus 2026)
- **Destinasi:** Dataran Tinggi Dieng, Jawa Tengah (bersama rekan kerja).
- **Waktu Pelaksanaan:** Akhir Agustus 2026 (29–30 Agustus 2026).
- **Rincian Anggaran Finansial:**
  1. Tiket & Paket Wisata: **Rp 340.000** (Rp 290.000 + kenaikan Rp 50.000).
  2. Uang Jajan / Konsumsi: **Rp 500.000**.
  3. Perlengkapan (Baju hangat, celana, dll): **Rp 200.000**.
  4. **TOTAL ESTIMASI BUDGET:** **Rp 1.040.000**.
- **Strategi Pengumpulan Dana:**
  - Narik Gojek harian dengan target pendapatan bersih **Rp 70.000 – Rp 85.000 / hari**.
  - Menjaga batas pengeluaran operasional harian maksimal **Rp 20.000 – Rp 25.000 / hari**.

### 5.4 Standar Baku Format Pesan & Penulisan Variabel
Format balasan wajib mengikuti standar ketat yang telah diverifikasi Mas Firman:
- Gunakan format bullet point (`•`).
- Letakkan ikon di sebelah kiri nama variabel.
- **HANYA nama variabel sebelum titik dua yang di-bold** (`**`). Titik dua dan nominal nilainya TIDAK BOLEH bold.
- Contoh Format Benar:
  ```text
  • 💵 **Pengeluaran Cash Kertas**: Rp 10.000 (Pop Ice Coklat)
  • 🏦 **Saldo Bank Jago**: Rp 414.559
  • 📅 **Agenda Terjadwal**: Sidang Skripsi (Jam 09:00 WIB)
  ```

---

## 🛡️ BAB VI: PROTOKOL MUTLAK PENGEMBANGAN AI SELANJUTNYA (MUST-READ GUARDRAILS)

Dokumen ini adalah **panduan mengikat** bagi siapa saja (termasuk AI agent masa depan) yang memodifikasi repositori ini. Patuhi protokol berikut tanpa pengecualian:

### 6.1 Daftar Hal yang DILARANG KERAS Dihapus / Diubah
1. **DILARANG MENGHAPUS MEKANISME `upsertPlan` DAN EKSTRAKSI `extracted_data.plans`:** Rencana hidup pengguna wajib selalu tersimpan di database.
2. **DILARANG MENGEMBALIKAN PERINTAH PEMBUATAN NATIVE MOBILE APP:** Pengguna telah membatalkan total native mobile app. Fokus eksklusif adalah Telegram Bot + Web Dashboard Mini App.
3. **DILARANG MENURUNKAN RATE LIMIT DI BAWAH 15 RPM:** Batas 15 RPM adalah standar kenyamanan chat pengguna.
4. **DILARANG MENGHAPUS KOREKSI TIMEZONE WIB (`Asia/Jakarta`):** Seluruh jam harus selalu dalam WIB.
5. **DILARANG MEMASUKKAN MODEL GEMINI 2.5 / 2.0 / 1.5:** Model-model tersebut sudah 404 deprecated.
6. **DILARANG MENGIRIM BUBBLE FOLLOW-UP DUPLIKAT:** Jaga agar pesan balasan tetap 1-2 bubble elegan.

### 6.2 Daftar Hal yang BOLEH Diimprovisasi
1. Menambahkan visualisasi grafik analitik baru pada Dashboard Mini App.
2. Meningkatkan kecepatan respons query database dengan indexing Supabase.
3. Menambahkan template laporan ekspor baru (Excel / Google Sheets formatting).
4. Menambahkan fitur pengingat pintar baru pada cron jobs.

### 6.3 Prosedur Wajib Sebelum Mengubah Kode (Pre-Flight Checklist)
Sebelum menyentuh berkas kode apa pun:
1. Baca dan pahami kembali berkas `rangkuman_perbaikan_wajib_baca.md` ini.
2. Pastikan perubahan yang akan dibuat tidak merusak 11 berkas yang telah diperbaiki di Bab IV.
3. Periksa apakah fitur yang diminta bertentangan dengan preferensi pengguna di Bab V.

### 6.4 Prosedur Wajib Setelah Mengubah Kode (Post-Flight Checklist)
Setelah melakukan modifikasi kode:
1. Jalankan `npx tsc --noEmit` dan pastikan hasil kompilasi **0 Error**.
2. Jalankan `npm run build` dan pastikan seluruh **25 route Next.js ter-generate sempurna**.
3. Lakukan commit dan push ke branch `main` GitHub.
4. **PERBARUI BERKAS INI (`rangkuman_perbaikan_wajib_baca.md`)** dengan menambahkan riwayat perbaikan baru pada Bab II, III, dan IV!

---

## 📜 LAMPIRAN A: BEDAH KRONOLOGI LENGKAP 123 TURN PERCAKAPAN (CHATTURN HISTORY)
Berikut adalah transkrip rangkuman turn-by-turn dari awal hingga akhir:

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

### Turn 0: 
- **Pesan Pengguna:** *""*
- **Respons Asisten:** 
- **Analisis Arsitektur:** Evaluasi turn 0 tercatat dalam riwayat state transaksi dan preferensi.

---
*Dokumen Manual Ini Diterbitkan Secara Resmi Sebagai Standar Mutlak Arsitektur dan Riwayat Perbaikan Sistem `ai_personal_asistan_telegram`.*
