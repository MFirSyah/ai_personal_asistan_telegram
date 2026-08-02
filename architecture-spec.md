# Spesifikasi Arsitektur: Asisten Keuangan & Aktivitas Personal (Telegram Bot + Web Dashboard)

> Dokumen ini ditujukan untuk diberikan ke AI coding agent (Claude Code / sejenis) sebagai panduan implementasi. Semua keputusan arsitektur sudah final — agent tinggal eksekusi sesuai urutan build di bagian akhir.

---

## 1. Ringkasan Produk

Sistem pencatatan keuangan & aktivitas personal berbasis chat (Telegram), dengan:
- AI (Gemini) sebagai partner diskusi kontekstual, bukan sekadar pencatat
- Web dashboard (Vercel) untuk analisis mendalam & visualisasi
- Multi-user terbatas (2 user: pemilik + pasangan), masing-masing terisolasi datanya
- 100% free tier di semua layanan

---

## 2. Prinsip Arsitektur

1. **Channel-agnostic backend** — Telegram bot HANYA jadi channel input/output. Semua logic bisnis (parsing, kategorisasi, rate limiting, AI orchestration) hidup di backend API (Next.js API Routes di Vercel). Ini WAJIB, supaya migrasi ke mobile app nanti tidak perlu menulis ulang logic, cukup tambah channel baru yang memanggil API yang sama.
2. **User identity independen dari Telegram** — `users.id` (UUID) adalah primary key, `telegram_id` cuma kolom tambahan. Auth via Supabase Auth (magic link email).
3. **AI calls harus hemat & terkontrol** — rate limit per user, cache insight harian, jangan panggil Gemini untuk hal yang bisa dihitung deterministik (agregasi, sum, dsb).
4. **Semua state percakapan tersimpan di DB**, bukan in-memory — supaya serverless (Vercel) tetap stateless-friendly dan bisa restart kapan saja tanpa kehilangan context.

---

## 3. Tech Stack (Semua Free Tier)

| Layer | Teknologi | Alasan |
|---|---|---|
| Hosting + API | Next.js 14 (App Router) di Vercel Hobby | API routes = backend, sekaligus hosting dashboard |
| Database | Supabase (PostgreSQL + pgvector) | Realtime, auth, storage, embedding search, semua satu tempat |
| Bot | Telegram Bot API (webhook, bukan polling) | Gratis, webhook cocok untuk serverless |
| AI | Gemini API (model flash terbaru) via `@google/genai` | Google Search grounding tool untuk browsing, vision untuk OCR struk |
| Auth | Supabase Auth (magic link) | Gratis, terintegrasi langsung dengan DB |
| Cron | cron-job.org (external, hit endpoint tiap menit) | Vercel Hobby cron cuma 1x/hari, tidak cukup presisi |
| Charting (dashboard) | Recharts (React) | Sudah tersedia, ringan |
| Charting (chat Telegram) | QuickChart.io (gratis, image generation via URL) | Grafik statis untuk dikirim sebagai foto di bubble chat |

---

## 4. Struktur Folder Project

```
/project-root
├── app/
│   ├── api/
│   │   ├── telegram/
│   │   │   └── webhook/route.ts        # entry point semua pesan Telegram
│   │   ├── cron/
│   │   │   ├── briefing/route.ts        # dicek tiap menit oleh cron-job.org
│   │   │   ├── daily-insight/route.ts   # generate insight dashboard 1x/hari
│   │   │   └── process-batch/route.ts   # dicek tiap menit, proses batch job sedikit demi sedikit
│   │   ├── receipts/
│   │   │   └── process/route.ts         # OCR struk via Gemini vision
│   │   ├── chat/
│   │   │   └── respond/route.ts         # core AI orchestration (dipakai bot & nanti mobile app)
│   │   ├── jobs/
│   │   │   └── [id]/status/route.ts     # cek progress batch job (dipanggil dashboard/bot)
│   │   └── analytics/
│   │       └── summary/route.ts         # data agregat untuk dashboard
│   ├── dashboard/
│   │   ├── page.tsx                     # halaman utama 20 analisis, dibuka via Telegram Web App
│   │   └── login/page.tsx               # magic link login
│   └── layout.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── queries/                     # semua query terisolasi per domain
│   │       ├── transactions.ts
│   │       ├── categories.ts
│   │       ├── preferences.ts
│   │       └── sessions.ts
│   ├── gemini/
│   │   ├── client.ts
│   │   ├── prompts/
│   │   │   ├── chat.ts
│   │   │   ├── categorize.ts
│   │   │   ├── ocr-receipt.ts
│   │   │   └── daily-briefing.ts
│   │   └── rate-limiter.ts
│   ├── telegram/
│   │   ├── send-message.ts
│   │   ├── send-chart.ts                # generate URL QuickChart, kirim via sendPhoto
│   │   ├── send-location.ts             # wrapper sendLocation untuk hasil pencarian tempat
│   │   ├── verify-webhook.ts
│   │   ├── inline-keyboard.ts           # builder untuk tombol web_app & konfirmasi
│   │   └── verify-webapp-init-data.ts   # validasi data user saat dashboard dibuka dari Telegram
│   ├── jobs/
│   │   ├── create-job.ts                # insert ke batch_jobs, tidak eksekusi langsung
│   │   ├── processors/
│   │   │   ├── delete-all.ts
│   │   │   ├── generate-data.ts
│   │   │   └── reprocess-receipts.ts
│   │   └── notify-progress.ts           # kirim update Telegram saat job selesai/gagal
│   └── analytics/
│       └── calculators.ts               # 20 analisis: yang deterministik dihitung di sini, bukan via AI
├── supabase/
│   └── migrations/
│       └── 001_init.sql                 # schema lengkap, lihat bagian 5
├── vercel.json
└── .env.example
```

---

## 5. Database Schema (Supabase / PostgreSQL)

```sql
-- Extension untuk semantic matching kategori
create extension if not exists vector;

create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  telegram_id bigint unique,
  name text,
  created_at timestamptz default now()
);

create table user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  last_active timestamptz default now(),
  expires_at timestamptz not null, -- last_active + 3 hari, di-refresh tiap interaksi
  created_at timestamptz default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  embedding vector(768),           -- dari Gemini text-embedding-004
  usage_count int default 0,
  created_at timestamptz default now(),
  unique(user_id, name)
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  category_id uuid references categories(id),
  amount numeric not null,
  type text check (type in ('expense', 'income')) not null,
  merchant text,
  description text,
  source text check (source in ('receipt_ocr', 'chat_manual')) not null,
  raw_ai_response jsonb,            -- simpan output mentah Gemini untuk audit/debug
  occurred_at timestamptz not null,
  created_at timestamptz default now()
);

create table activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  category_id uuid references categories(id),
  title text not null,
  description text,
  occurred_at timestamptz not null,
  created_at timestamptz default now()
);

create table plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  title text not null,
  description text,
  target_date date,
  status text check (status in ('planned', 'in_progress', 'done', 'cancelled')) default 'planned',
  created_at timestamptz default now()
);

create table chat_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  role text check (role in ('user', 'assistant')) not null,
  content text not null,
  created_at timestamptz default now()
);

create table user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  key text not null,               -- misal: "kategori_preference", "gaya_bahasa", "koreksi_kategori"
  value text not null,
  learned_from text,                -- ringkasan konteks kapan preference ini muncul
  updated_at timestamptz default now()
);

create table rate_limits (
  user_id uuid primary key references users(id) on delete cascade,
  minute_count int default 0,
  minute_window_start timestamptz default now(),
  day_count int default 0,
  day_window_start timestamptz default now()
);

create table daily_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  insight_date date not null,
  payload jsonb not null,           -- 20 analisis tersimpan di sini, hasil generate 1x/hari
  created_at timestamptz default now(),
  unique(user_id, insight_date)
);

create table user_settings (
  user_id uuid primary key references users(id) on delete cascade,
  briefing_enabled boolean default false,
  briefing_time time,                -- validasi backend: harus 00:01 - 08:00
  timezone text default 'Asia/Jakarta',
  updated_at timestamptz default now()
);

create table batch_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  type text check (type in ('delete_all', 'generate_data', 'reprocess_receipts')) not null,
  status text check (status in ('pending', 'processing', 'done', 'failed', 'cancelled')) default 'pending',
  total_items int default 0,
  processed_items int default 0,
  batch_size int default 5,          -- berapa item diproses tiap kali cron jalan
  payload jsonb,                     -- detail job & parameter spesifik per type
  error_message text,
  confirmed_at timestamptz,          -- diisi setelah user tap konfirmasi, null = masih menunggu
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Soft delete: tabel yang bisa kena `/hapus_semua` diberi kolom ini
alter table transactions add column deleted_at timestamptz;
alter table activities add column deleted_at timestamptz;
```

---

## 6. Alur Kerja Per Fitur

### 6.1 Pesan masuk dari Telegram (teks/foto)
1. `app/api/telegram/webhook/route.ts` terima payload
2. Verifikasi signature/secret token Telegram
3. Cek `user_sessions` — kalau expired/tidak ada, balas minta login (kirim magic link), stop
4. Cek `rate_limits` — kalau lewat batas (lihat bagian 7), balas minta tunggu, stop
5. Kalau foto → download file, kirim ke `lib/gemini/prompts/ocr-receipt.ts`
6. Kalau teks → lanjut ke `app/api/chat/respond/route.ts`

### 6.2 Chat orchestration (`chat/respond`)
1. Tarik context: transaksi/aktivitas kemarin, hari ini, plan aktif, 10-15 `user_preferences` terbaru, 6-10 pesan terakhir dari `chat_history`
2. Susun prompt sesuai `lib/gemini/prompts/chat.ts`, aktifkan Google Search grounding tool
3. Wajibkan output JSON terstruktur:
   ```json
   {
     "messages": ["string", "string?", "string?"],  // 1-3 bubble teks (boleh sisipkan emoji & link biasa)
     "follow_up_question": "string",
     "extracted_data": { "transaction": {...} | "activity": {...} | "preference": {...} | null },
     "reasoning": "string",  // alasan singkat, disisipkan natural di salah satu bubble
     "chart": { "type": "bar|line|pie", "labels": [...], "datasets": [...] } | null,
     "location": { "name": "string", "lat": 0.0, "lng": 0.0 } | null,
     "sources": [{ "title": "string", "url": "string" }] | []  // dari hasil Google Search grounding
   }
   ```
4. Kalau `extracted_data` ada, insert ke tabel terkait (transactions/activities/preferences) — kategori lewat proses matching di 6.4
5. Simpan `messages` + `follow_up_question` ke `chat_history`
6. Kirim ke Telegram sesuai urutan berikut (detail tiap jenis konten di 6.10):
   - Tiap elemen `messages` sebagai bubble teks terpisah (jeda 1-2 detik)
   - Kalau `chart` ada → generate & kirim sebagai gambar
   - Kalau `location` ada → kirim sebagai kartu peta
   - Kalau `sources` ada isinya → sisipkan sebagai bagian teks (link preview otomatis muncul dari Telegram)
   - Terakhir, `follow_up_question` sebagai bubble penutup

### 6.3 OCR Struk
1. Gambar dikirim ke Gemini vision dengan prompt ekstraksi terstruktur (item, harga, total, tanggal, merchant)
2. Hasil JSON divalidasi (total = sum item, kalau tidak cocok tandai `needs_review: true`)
3. Lanjut ke proses kategorisasi (6.4), lalu insert ke `transactions`

### 6.4 Kategorisasi (reuse-first)
1. Query semua `categories` milik user
2. Kirim daftar nama kategori sebagai konteks ke Gemini bersama data transaksi, minta match atau usulkan baru (lihat prompt yang sudah dibahas sebelumnya)
3. Kalau Gemini bilang kategori baru: hitung embedding nama kategori, cosine similarity ke semua kategori existing user (pakai `pgvector`)
4. Similarity > 0.85 → pakai kategori lama. Selain itu → insert kategori baru
5. Increment `usage_count` kategori yang dipakai

### 6.5 Morning Briefing (cron)
1. `cron-job.org` hit `app/api/cron/briefing/route.ts` tiap 1 menit
2. Query `users` yang `briefing_time` (di tabel settings, lihat catatan bagian 9) cocok dengan waktu sekarang (dikonversi ke timezone user) DAN dalam range 00:01–08:00
3. Generate ringkasan via `lib/gemini/prompts/daily-briefing.ts` (pakai data `daily_insights` hari sebelumnya kalau sudah ada, hemat request)
4. Kirim via Telegram, format tetap 1-3 bubble + follow-up question

### 6.6 Daily Insight untuk Dashboard (cron, 1x/hari)
1. Jalan sekali tiap pagi (misal barengan briefing)
2. `lib/analytics/calculators.ts` hitung analisis yang deterministik (tren, agregat, proyeksi linear) — TIDAK pakai AI
3. Gemini dipanggil HANYA untuk narasi insight dari hasil kalkulasi tadi (1 request per user per hari)
4. Simpan ke `daily_insights.payload` sebagai array 20 item, masing-masing: `{ type: "text"|"chart", title, data/chart_config, insight_text }`
5. Dashboard (`app/dashboard/page.tsx`) render langsung dari cache ini, tidak panggil AI saat dibuka

### 6.7 Dashboard via Telegram Web App

1. Daftarkan Menu Button permanen lewat @BotFather (`/setmenubutton`) → arahkan ke URL dashboard Vercel, atau kirim inline button bertipe `web_app` dari bot kapan saja user minta lihat dashboard
2. Halaman dashboard load script resmi Telegram (`telegram-web-app.js`), ambil `initData` yang berisi info user Telegram terverifikasi
3. Backend (`lib/telegram/verify-webapp-init-data.ts`) validasi `initData` pakai `TELEGRAM_BOT_TOKEN` (cek hash sesuai dokumentasi resmi Telegram) — ini menggantikan proses login manual saat dashboard dibuka dari dalam Telegram, karena identitas user sudah terverifikasi oleh Telegram sendiri
4. Kalau valid → tarik `user_id` terkait dari `telegram_id`, render dashboard dari `daily_insights` cache seperti biasa
5. Kalau dashboard diakses lewat browser biasa (bukan dari Telegram) → tetap wajib magic link login seperti alur di bagian 8

### 6.8 Command destruktif (hapus semua data, dll)

1. User kirim command, misal `/hapus_semua` atau minta lewat chat natural ("hapus semua data bulan ini")
2. Backend TIDAK eksekusi langsung — balas dengan inline keyboard: `[Ya, hapus] [Batal]`, sertakan ringkasan singkat apa yang akan terhapus (jumlah item, rentang tanggal)
3. Kalau user tap "Ya, hapus" → baru insert row ke `batch_jobs` (type `delete_all`) berisi scope penghapusan di `payload`, status `pending` → `confirmed_at` diisi timestamp sekarang
4. Kalau tap "Batal" atau tidak ada respons dalam waktu tertentu → job tidak pernah dibuat, tidak ada efek apapun
5. Eksekusi sebenarnya tetap lewat job queue (lihat 6.9) — soft delete (`deleted_at`), bukan hard delete, supaya bisa direstore kalau ternyata salah pencet

### 6.9 Batch job queue (proses berat & throttled)

Berlaku untuk: hapus massal, generate/reprocess data, atau operasi lain yang berpotensi banyak memanggil Gemini sekaligus.

1. Command/permintaan batch masuk → `lib/jobs/create-job.ts` insert ke `batch_jobs` (status `pending`, hitung & simpan `total_items`), balas ke user: "Diproses di background, nanti aku kabari kalau selesai"
2. `app/api/cron/process-batch/route.ts` dipanggil `cron-job.org` tiap 1 menit
3. Endpoint ambil job dengan status `pending`/`processing` (urutkan `created_at`, proses satu job dulu sampai selesai baru lanjut job berikutnya — hindari race antar job milik user yang sama)
4. Cek sisa kuota rate limit user di menit itu dari tabel `rate_limits` (lihat bagian 7) → proses sejumlah `batch_size` item atau sisa kuota, mana yang lebih kecil
5. Panggil processor sesuai `type` (`lib/jobs/processors/*.ts`), update `processed_items`, `status` jadi `processing` kalau belum selesai semua
6. Kalau `processed_items >= total_items` → `status = done` → `lib/jobs/notify-progress.ts` kirim Telegram: "Selesai! Data kamu sudah siap dipakai lagi ✅"
7. Kalau processor melempar error → `status = failed`, simpan `error_message`, tetap kirim notifikasi (jangan biarkan user menunggu tanpa kabar)
8. User bisa cek progress kapan saja: tanya ke bot ("gimana progress-nya?") → backend baca `processed_items / total_items` langsung dari tabel, tidak perlu tunggu job selesai; atau lewat `app/api/jobs/[id]/status/route.ts` dari dashboard

### 6.10 Rich Content di Chat Telegram (grafik, peta, link sumber)

Telegram bubble chat tidak bisa render grafik interaktif — semua konten visual di chat berbentuk **snapshot statis**. Interaksi penuh (zoom, hover, filter) hanya tersedia di dashboard Web App (6.7). Berikut cara tiap jenis konten dikirim:

**Grafik (`chart`)**
1. `lib/telegram/send-chart.ts` terima config chart dari response Gemini (`type`, `labels`, `datasets`)
2. Susun jadi Chart.js config object, encode sebagai query param ke QuickChart.io (`https://quickchart.io/chart?c={config}`) — tidak perlu render gambar sendiri, tinggal generate URL
3. Kirim URL itu via `sendPhoto` — Telegram otomatis fetch & tampilkan sebagai gambar di bubble
4. Cocok untuk grafik ringkas (misal "pengeluaran minggu ini per kategori") yang muncul langsung dalam diskusi, tanpa user harus buka dashboard

**Lokasi (`location`)**
1. Kalau Gemini (lewat Google Search grounding) menemukan tempat spesifik yang relevan (misal user tanya "rekomendasi tempat makan murah dekat sini" atau mencatat aktivitas dengan lokasi), sertakan `lat`/`lng` di response
2. `lib/telegram/send-location.ts` panggil `sendLocation` dengan koordinat itu
3. Muncul sebagai kartu peta mini di bubble, tap langsung buka Google Maps/Apple Maps sesuai OS user — tidak perlu link manual

**Link sumber hasil browsing (`sources`)**
1. Sisipkan URL sumber di salah satu bubble teks (Gemini yang tentukan bubble mana paling pas menyebutkan sumbernya)
2. Telegram otomatis generate **link preview** (judul, deskripsi, thumbnail) selama halaman tujuan punya Open Graph tags — tidak perlu proses tambahan dari backend
3. Kalau ingin preview tidak terlalu memakan tempat di layar kecil, bisa pakai format link markdown Telegram (`[teks](url)`) supaya preview lebih ringkas tanpa card besar — opsional, sesuaikan preferensi tampilan nanti

**Kapan pakai chat vs dashboard:**
- Chat: quick check waktu diskusi berjalan (1 grafik ringkas cukup untuk menjawab pertanyaan sesaat)
- Dashboard: analisis mendalam, multi-grafik, interaktif (20 analisis dari `daily_insights`)

---

## 7. Rate Limiting

- Per user: 7 request/menit, 700 request/hari (dari kuota global 15/menit, 1500/hari untuk 2 user)
- Simpan counter di tabel `rate_limits`, sliding window sederhana (reset `minute_count` tiap window 60 detik lewat, reset `day_count` tiap window 24 jam lewat)
- Cek di awal `chat/respond` dan `receipts/process` SEBELUM memanggil Gemini
- Kalau lewat limit menit: antri/tunda dengan pesan ke user
- Kalau lewat limit hari: informasikan limit tercapai, sarankan lanjut besok

---

## 8. Auth & Session (3 hari expire)

- Login via Supabase Auth magic link (dikirim ke email yang didaftarkan, terhubung ke `telegram_id`)
- Tiap interaksi Telegram masuk → `last_active` di-update, `expires_at` = `last_active + 3 hari`
- Kalau `expires_at` sudah lewat saat pesan baru masuk → tolak, minta login ulang
- Login pertama kali: user kirim `/start` ke bot → bot minta email → kirim magic link → user klik → link redirect ke `app/dashboard/login` yang link `telegram_id` ke `user_id` di Supabase

---

## 9. Yang Masih Perlu Diputuskan Sebelum Build (isi dulu sebelum kasih ke agent)

Beberapa hal ini sengaja belum saya tentukan di spec karena butuh keputusan/preferensi kamu:

1. **Timezone default** — WIB/WITA/WIT? Asumsi saya WIB kalau tidak disebutkan.
2. **Tabel `user_settings`** belum saya buat eksplisit di schema — perlu ditambah kolom `briefing_time`, `timezone`, `briefing_enabled` per user. Saya bisa tambahkan kalau kamu konfirmasi.
3. **Nama & branding bot** (untuk daftar ke @BotFather)
4. **Model Gemini spesifik** yang dipakai (flash terbaru direkomendasikan untuk hemat kuota) — cek versi model terbaru saat build karena ini bisa berubah.
5. **20 analisis dashboard** — saya sudah kasih kerangka 3 kelompok (refleksi/kondisi sekarang/proyeksi), tapi list final 20 item perlu difinalisasi biar agent tidak menebak-nebak.
6. **Daftar command destruktif/batch** yang perlu ada di awal — minimal `/hapus_semua`, apa lagi selain itu (misal "generate ulang kategori", "reprocess semua struk bulan ini")?
7. **`batch_size` default** tiap tipe job — saya kasih default 5 item/menit di schema, tapi bisa disesuaikan tergantung seberapa berat tiap item diproses (misal reprocess struk = 1 request Gemini/item, generate data bisa lebih ringan)

---

## 10. Environment Variables yang Dibutuhkan

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Telegram
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=

# Gemini
GEMINI_API_KEY=

# Cron
CRON_SECRET=              # untuk verifikasi request dari cron-job.org, bukan sembarang orang bisa hit endpoint cron
```

---

## 11. Urutan Build yang Disarankan (untuk AI Agent)

1. Setup project Next.js + Supabase project + jalankan migration schema (bagian 5, ditambah `user_settings`)
2. Setup Telegram bot (@BotFather) + webhook endpoint dasar (echo test dulu)
3. Implementasi auth flow (magic link + link ke `telegram_id`) + session check middleware
4. Implementasi rate limiter (`lib/gemini/rate-limiter.ts`) + tabel `rate_limits`
5. Implementasi chat orchestration dasar (tanpa kategori dulu, langsung insert manual)
6. Implementasi kategorisasi reuse-first (embedding + similarity check)
7. Implementasi OCR struk
8. Implementasi rich content di chat: `send-chart.ts` (QuickChart), `send-location.ts` (sendLocation), penanganan `sources` di teks
9. Implementasi cron briefing
10. Implementasi cron daily-insight + kalkulator analytics
11. Build dashboard UI (render dari `daily_insights` cache) + integrasi Telegram Web App (`initData` verification, menu button)
12. Implementasi command konfirmasi destruktif (`/hapus_semua` + inline keyboard konfirmasi)
13. Implementasi job queue (`batch_jobs` table, `create-job.ts`, `cron/process-batch`, notifikasi selesai/gagal)
14. Testing end-to-end dengan 2 user (kamu + pasangan), termasuk uji batch job dengan data besar untuk pastikan tidak nabrak rate limit

---

*Dokumen ini adalah living spec — update bagian 9 dulu sebelum diserahkan ke AI agent supaya tidak ada asumsi yang salah di tengah jalan.*
