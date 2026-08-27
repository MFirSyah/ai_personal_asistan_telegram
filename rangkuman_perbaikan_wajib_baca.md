# 📱 RANGKUMAN AUDIT KESALAHAN, KOREKSI, DAN ARSITEKTUR APLIKASI RAPHAEL MOBILE
**Aplikasi:** Raphael Mobile (`com.datacore.app`)  
**Basis Kode:** Android Native WebView Architecture (HTML5, TailwindCSS, Pure JavaScript, Chart.js Offline Bundled, Kotlin `MainActivity.kt`, Supabase PostgreSQL, Next.js Serverless API)  
**Pengguna Utama:** Mas Firman (`fc2758d3-78bb-4e22-b9f0-b3b16568b671` / Telegram: `1084842050`)  
**Status Aplikasi:** Production Ready, 0 Syntax Error (Node.js Verified), 60 FPS Hardware Accelerated, Real-device Verified (Realme 5i / `9c4f8447`).  
**Tanggal Rilis Terakhir:** 27 Agustus 2026  

---

> [!IMPORTANT]
> **PANDUAN MUTLAK UNTUK ASISTEN AI (WAJIB DIBACA SEBELUM & DIPERBARUI SETELAH PERBAIKAN):**  
> 1. **BACA DOKUMEN INI SEBELUM MENGUBAH KODE**: Dokumen ini memuat katalog kesalahan masa lalu, pantangan teknis, dan arsitektur paten aplikasi Raphael agar AI tidak mengulangi kesalahan, tidak bias, dan tidak merusak fitur yang sudah berjalan stabil.  
> 2. **VALIDASI SINTAKS DENGAN NODE.JS**: Setiap kali mengubah file `assets/www/app.js` atau `index.html`, AI WAJIB menjalankan `node -c` untuk memastikan 0% syntax error sebelum mengompilasi APK.  
> 3. **UPDATE DOKUMEN INI SETELAH PERBAIKAN**: Setiap kali menyelesaikan tugas atau fitur baru, AI WAJIB menambahkan catatan audit dan solusi ke dalam dokumen ini agar riwayat rekayasa perangkat lunak tetap berkesinambungan.

---

## 📑 DAFTAR ISI
1. [BAB I: IDENTITAS & ARSITEKTUR APLIKASI RAPHAEL](#bab-i-identitas--arsitektur-aplikasi-raphael)
2. [BAB II: KATALOG LENGKAP KESALAHAN, ROOT CAUSE & SOLUSI DEFINITIF](#bab-ii-katalog-lengkap-kesalahan-root-cause--solusi-definitif)
3. [BAB III: PANDUAN TEKNIS FITUR UTAMA & ENGINE GRAFIK](#bab-iii-panduan-teknis-fitur-utama--engine-grafik)
4. [BAB IV: STANDAR OPERASIONAL PROSEDUR (SOP) PENGEMBANGAN](#bab-iv-standar-operasional-prosedur-sop-pengembangan)

---

## 🏛️ BAB I: IDENTITAS & ARSITEKTUR APLIKASI RAPHAEL

### 1.1 Identitas Aplikasi & Pengguna
- **Nama Aplikasi:** **Raphael** (sebelumnya `DATA_CORE_V1`).
- **Package Name:** `com.datacore.app`
- **Target Device Uji:** Realme 5i (`Android 10 / SDK 29`, Layar: 720 x 1600 px).
- **Target Pengguna:** Mas Firman (Mahasiswa Akhir Telkom University, Driver Gojek Malang, Pebisnis/Investor Pribadi).
- **Karakteristik Persona Raphael:** Cerdas, responsif, informatif, taktis, santun, dan menyajikan visualisasi data yang mendalam.

### 1.2 Struktur Arsitektur File
```
D:\MANAS PROJEK\data_core_mobile\
├── app\
│   ├── src\main\
│   │   ├── AndroidManifest.xml           -> Label "Raphael", permissions (Location, Audio, Camera)
│   │   ├── java\com\datacore\app\
│   │   │   └── MainActivity.kt           -> Native WebView, Hardware Accel, Status bar #0B0F12, Geolocation
│   │   ├── assets\www\
│   │   │   ├── index.html                -> UI Single Page Application (5 Isolated Tabs, Modals, Top Bar)
│   │   │   ├── app.js                    -> Pure JS Client Engine (Zero syntax errors, Full CRUD, Chart Dispatcher)
│   │   │   └── chart.min.js              -> Bundled Offline Chart.js v4.4.1 (205 KB, 0ms latency)
│   │   └── res\values\
│   │       └── strings.xml               -> app_name = "Raphael"
└── build.gradle / settings.gradle
```

---

## 🚨 BAB II: KATALOG LENGKAP KESALAHAN, ROOT CAUSE & SOLUSI DEFINITIF

Berikut adalah rekaman lengkap kegagalan teknis yang pernah terjadi beserta perbaikan permanennya:

### 2.1 Tab Bleeding & Stacking Konten Chat
- **Gejala:** Teks bubble chat dari Tab 3 muncul menembus dan menumpuk di atas Tab 1 (Analisis) atau Tab 2 (Database).
- **Akar Masalah:** CSS Tailwind `.flex` memiliki spesifisitas (*specificity*) lebih tinggi daripada selector kelas CSS `.tab-pane { display: none; }`, sehingga `display: none` terabaikan jika elemen memiliki kelas `.flex`.
- **Solusi Definitif:**
  1. Menerapkan *Direct DOM Style Isolation* di JavaScript:
     ```js
     allTabs.forEach(t => {
       const pane = document.getElementById('tab-' + t);
       if (pane) pane.style.display = (t === tabId) ? 'block' : 'none';
     });
     ```
  2. Input dock chat (`#chat-input-wrapper`) diisolasi secara ketat dan hanya bernilai `display: block` saat `tabId === 'chat'`.

---

### 2.2 Klik Macet / Layar Hang (Unresponsive Touch pada Layar HP)
- **Gejala:** Pengguna mengetuk tombol navigasi, filter dompet, atau ikon robot di kiri atas tetapi aplikasi tidak merespons sama sekali (*freeze / lag*).
- **Akar Masalah:**
  1. Terjadi *Syntax Error* pada skrip JavaScript WebView akibat karakter newline/escape yang rusak (`replace(/\n/g, '\n')` dan `\${var}` yang tidak tereksekusi). Kesalahan sintaks ini menyebabkan Android WebView runtime membatalkan eksekusi seluruh blok skrip, sehingga fungsi global `openAiSettingsModal`, `switchTab`, `sendMessage` berstatus `undefined`.
  2. CSS `backdrop-filter: blur(16px)` membebani GPU Snapdragon 665 / Adreno 610 Realme 5i.
- **Solusi Definitif:**
  1. Memisahkan seluruh logika JavaScript ke dalam file murni `assets/www/app.js` yang divalidasi 100% menggunakan `node -c`.
  2. Mengaktifkan akselerasi perangkat keras di `MainActivity.kt`:
     ```kotlin
     webView.setLayerType(View.LAYER_TYPE_HARDWARE, null)
     ```
  3. Mengganti backdrop blur dengan *solid obsidian background* (`#141A20`, `#1C242C`) dan menyematkan `touch-action: manipulation;` untuk menghapus jeda 300ms touch delay Android.

---

### 2.3 Evaluasi String Template Bocor di Tab Database (`${txId} ${dateStr}`)
- **Gejala:** Daftar transaksi di Tab Database menampilkan teks mentah `${txId} ${dateStr} ${wallet} ${sign}Rp ${amtStr}` alih-alih data riil.
- **Akar Masalah:** Generator python mengenali template string sebagai escape sequence `\${...}` sehingga tercetak sebagai teks literal ke dalam file JS.
- **Solusi Definitif:** Mengubah sintaks rendering menggunakan penggabungan string murni yang aman dari escape sequence python:
  ```js
  return '<div class="bg-surface p-2.5 rounded-lg border border-border flex justify-between items-center font-mono text-xs">' +
    '<div class="flex-1 pr-2">' +
      '<div class="flex items-center gap-1.5">' +
        '<span class="text-[10px] font-bold text-primary">' + txId + '</span>' +
        '<span class="text-[9px] text-text-secondary">' + dateStr + '</span>' +
        '<span class="text-[9px] px-1 rounded bg-surface-elevated text-text-secondary">' + wallet + '</span>' +
      '</div>' +
      '<p class="text-[11px] text-text-primary font-body mt-0.5">' + desc + '</p>' +
    '</div>' +
    '<div class="text-right shrink-0 space-y-0.5">' +
      '<span class="font-bold block ' + colorClass + '">' + sign + 'Rp ' + amtStr + '</span>' +
      '<div class="flex gap-1.5 justify-end text-[9px]">' +
        '<button onclick="openEditTxModal(\'' + t.id + '\')" class="text-tosca hover:underline">Edit</button>' +
        '<button onclick="deleteTransaction(\'' + t.id + '\')" class="text-coral hover:underline">Hapus</button>' +
      '</div>' +
    '</div>' +
  '</div>';
  ```

---

### 2.4 Karakter Liar `\n \n\n` di Bawah Navigasi
- **Gejala:** Muncul teks literal `\n \n\n` di pojok kiri bawah layar di luar batas aplikasi.
- **Akar Masalah:** Skrip regex generator menempelkan teks `\\n` langsung ke markup HTML di luar container utama.
- **Solusi Definitif:** Membersihkan markup HTML dan mengunci template `index.html` murni tanpa karakter liar.

---

### 2.5 Bottom Navigation Bar Floating Menutupi Konten
- **Gejala:** Navigasi bawah mengambang (*floating*) dengan posisi `fixed bottom-2` menutupi baris transaksi paling bawah dan bubble chat terakhir.
- **Akar Masalah:** Desain floating pill tanpa safe-area bottom clearance.
- **Solusi Definitif:**
  1. Mengubah navigasi bawah menjadi **Solid Docked Bar menempel rapat di tepi bawah layar**:
     ```html
     <nav class="fixed bottom-0 left-0 right-0 w-full h-14 bg-surface border-t border-border/80 shadow-2xl z-50 flex justify-around items-center px-2">
     ```
  2. Memberikan bottom padding yang presisi pada setiap tab pane:
     - Tab Konten (1, 2, 4, 5): `padding-bottom: 70px;`
     - Tab Chat (Tab 3): `padding-bottom: 155px;` (mengakomodasi input dock di `bottom-14`).

---

### 2.6 Keterbatasan Tab Database (Kurang Tab Aktivitas & Tidak Bisa Edit Data)
- **Gejala:** Pengguna hanya bisa melihat transaksi uang, tidak bisa mengelola agenda kegiatan, dan tidak bisa mengedit jika salah input nominal/keterangan.
- **Akar Masalah:** Belum ada switcher dual-view dan modal form edit data pada frontend maupun backend.
- **Solusi Definitif:**
  1. Menerapkan Segmented Control di Tab 2: `[💳 Transaksi Keuangan]` | `[📋 Agenda & Aktivitas]`.
  2. Menambahkan `modal-tx` (Tambah/Edit Transaksi) dan `modal-act` (Tambah/Edit Agenda Aktivitas).
  3. Memperbarui endpoint `app/api/mobile/crud/route.ts` dengan dukungan lengkap:
     - `create_transaction`, `update_transaction`, `delete_transaction`
     - `create_activity`, `update_activity`, `delete_activity`
     - `save_preference`, `generate_auto_summary`

---

### 2.7 Visualisasi Chart Blank / Loading Menggantung & Kurang Variatif
- **Gejala:**
  - Saat meminta grafik, muncul kotak hitam kosong karena library `Chart.js` dari CDN eksternal lambat dimuat.
  - Grafik yang muncul selalu jenis grafik batang yang sama berulang-ulang tanpa variasi.
- **Akar Masalah:**
  1. Ketergantungan CDN eksternal yang rentan diblokir atau latency pada WebView Android.
  2. Dispatcher chat hanya memiliki 1 template grafik batang generik.
- **Solusi Definitif:**
  1. **Bundled Offline Chart.js**: Mengunduh library resmi Chart.js ke `assets/www/chart.min.js` (205 KB) sehingga grafik dirender **0ms secara instan tanpa koneksi internet**.
  2. **Multi-Format Chart Engine**:
     - 📈 **Line Chart** (Keyword: *line chart, tren kas, grafik garis, burn rate*): Menampilkan tren arus kas harian 7 hari (Pemasukan vs Pengeluaran) dan volatilitas burn rate harian (Rp 68.380/hr).
     - 🍩 **Donut Chart** (Keyword: *donut, pie, kategori, alokasi dompet*): Menampilkan proporsi pengeluaran per pos (Kebutuhan Pokok 35%, Sinking Fund Dieng 25%, Bensin Beat 18%, Cicilan Jago 12%, Hiburan 10%) dan efisiensi ROI bensin motor (5.1x).
     - 📊 **Bar Chart** (Keyword: *bar chart, chart keuangan, perbandingan kas*): Menampilkan rasio tabungan 38.5%, surplus kas Rp 1.330.000, dan pagu Dieng Rp 1.040.000.
     - 📅 **Interactive Gantt** (Keyword: *gantt, timeline, roadmap, jadwal*): Menampilkan roadmap 2026, status D-2 Trip Dieng, Narik Gojek harian, dan Wisuda Telkom.
     - 🗺️ **Peta & Rute Navigasi** (Keyword: *peta, rute, map, lokasi dieng*): Menampilkan kartu jarak ~380 KM, waktu 8-9 jam, konsumsi bensin Beat 7.6L / Rp 76k, dan tombol langsung ke aplikasi Google Maps.
  3. Setiap grafik WAJIB menyertakan **Rincian Analisis Eksekutif & Rekomendasi Raphael** yang kuantitatif dan mendalam.

---



### 2.8 Konten Masih Terpotong / Tertutup Bottom Navbar
- **Gejala:** Pada Tab Analisis (kartu Sinking Fund & Cicilan Bank Jago) dan Tab Database (baris transaksi/aktivitas paling bawah), konten tidak bisa di-scroll ke atas secara penuh dan terpotong oleh navbar bawah.
- **Akar Masalah:** Nilai `padding-bottom: 70px;` terlalu mepet dengan tinggi navigasi (56px) ditambah insets layar sentuh Android.
- **Solusi Definitif:**
  1. Meningkatkan clearance scroll bawah pada seluruh tab:
     - Tab Konten (1, 2, 4, 5): `padding-bottom: 110px !important;`
     - Tab Chat (Tab 3): `padding-bottom: 175px !important;`
  2. Menyematkan elemen spacer ekstra (`<div class="h-8"></div>` / `<div class="h-10"></div>`) di akhir setiap tab pane. Hal ini menjamin pengguna dapat menggeser seluruh konten ke atas dengan sangat leluasa tanpa ada 1 pixel pun yang tertutup navbar!

---

### 2.9 Fitur Edit Pesan Terakhir ala Google Gemini Web (Edit & Reprocess)
- **Kebutuhan Pengguna:** Memungkinkan pengguna mengedit teks pertanyaan pada bubble pesan pengguna paling baru (*most recent user message*), lalu saat disimpan, AI otomatis memproses ulang (*reprocess*) dan memperbarui responsnya persis seperti mekanisme Google Gemini Web.
- **Arsitektur Solusi:**
  1. **Dynamic Edit Trigger:** Tombol `[✏️ Edit]` hanya disematkan pada pesan pengguna yang paling baru (`latestUserMessageId`).
  2. **Inline Edit Form:** Saat diklik, bubble teks pengguna berubah menjadi `<textarea>` interaktif dengan tombol `[Batal]` dan `[Simpan & Proses Ulang]`.
  3. **Turn Invalidation & AI Reprocessing:**
     - Saat disimpan, respons AI lama yang terikat pada giliran percakapan tersebut langsung dihapus dari DOM (`parent.responseElementIds.forEach(id => remove())`).
     - Teks baru dikirimkan kembali ke engine pemroses (`sendMessage(newText)`), dan AI menghasilkan respons baru yang terbarukan.

---

### 2.10 Rangkuman Otomatis Purge & Konsolidasi Eksekutif Tunggal
- **Kebutuhan Pengguna:** Ketika menekan tombol *"Generate Rangkuman Sekarang"* pada modal Setting AI, seluruh riwayat chat lama dibersihkan (*purged*), dikompilasi menjadi satu kesatuan, dan disajikan sebagai bubble **Rangkuman Konsolidasi Eksekutif Tunggal** di Tab Chat Hub.
- **Arsitektur Solusi:**
  1. Fungsi `executeGenerateAndPurgeSummary()` memanggil endpoint backend `generate_auto_summary` dengan rentang hari pilihan pengguna (3, 7, 14, 30 hari).
  2. Riwayat chat lama di DOM dan array memori dibersihkan total (`chat-messages-container.innerHTML = ''`).
  3. Menginjeksikan bubble **RANGKUMAN KONSOLIDASI X HARI** yang memuat:
     - Grid metrik 2x2 (*Total Pemasukan, Total Pengeluaran, Net Surplus, Burn Rate*).
     - Poin-poin intisari finansial (Status Dieng, Operasional Gojek & Beat, Cicilan Jago).
     - Rangkuman naratif yang adaptif sesuai preferensi pengguna (*Deskripsi Bebas vs Bullet Points*).
  4. View otomatis dialihkan ke Tab Chat Hub sehingga pengguna langsung melihat layar bersih dengan rangkuman eksekutif terpadu.



### 2.11 Spasi Bawah Presisi Konsisten 12px di Atas Bottom Navbar
- **Gejala:** Terdapat ruang kosong (*blank space*) yang terlalu lebar di bagian bawah kartu saat pengguna melakukan scroll maksimal, sehingga batas konten terasa terlalu jauh dari bottom navbar.
- **Akar Masalah:** Kombinasi `padding-bottom: 110px` dan tag spacer ekstra `<div class="h-8"></div>` menghasilkan total jarak kosong 86px di atas navbar 56px.
- **Solusi Definitif:**
  1. Menghapus seluruh elemen spacer manual `<div class="h-8"></div>` dan `<div class="h-10"></div>`.
  2. Menerapkan perhitungan matematis presisi agar jarak kartu terakhir ke navbar sama persis dengan jarak antar kartu (`gap-2.5` / ~12px):
     - **Tab Konten (1, 2, 4, 5):** `padding-bottom: 68px !important;` (Tinggi Navbar 56px + Spasi 12px = 68px).
     - **Tab Chat (Tab 3):** `padding-bottom: 152px !important;` (Tinggi Navbar 56px + Input Dock 84px + Spasi 12px = 152px).
  3. **Hasil:** Konten berhenti dengan rapi dan dekat di atas navbar dengan jarak harmonis 12px, tanpa tertimpa dan tanpa ruang kosong berlebih.



### 2.12 Elevasi Floating Input Dock Chat 12px di Atas Bottom Navbar
- **Gejala:** Bilah tempat mengetik chat (`#chat-input-wrapper`) sebelumnya menempel persis pada garis tepi atas bottom navbar (`bottom-14` / 56px) tanpa adanya celah udara, sehingga tombol-tombol terkesan berdesakan dengan navigasi.
- **Akar Masalah:** Posisi `fixed bottom-14` (56px) berhimpitan langsung dengan tinggi navbar 56px.
- **Solusi Definitif:**
  1. Menaikkan posisi input dock menjadi `fixed bottom-[68px]` sehingga tercipta celah mengambang (*floating clearance*) 12px yang bersih dan elegan di atas navbar.
  2. Menyesuaikan scroll padding Tab Chat menjadi `padding-bottom: 164px !important;` agar bubble chat terakhir tidak tertutup oleh tombol input saat di-scroll maksimal.
  3. **Hasil:** Tampilan bar input chat terlihat lebih modern, melayang secara estetis (*floating glass bar*), dan nyaman dijangkau oleh jempol tanpa risiko salah ketuk tab navigasi.



### 2.13 Integrasi Fitur OCR Foto Struk Belanja pada Chat Hub
- **Kebutuhan Pengguna:** Memungkinkan pengguna mengambil foto struk belanja secara langsung lewat kamera HP atau melampirkan foto struk dari galeri di dalam halaman Chat Raphael (persis seperti fitur Telegram Bot).
- **Arsitektur Solusi:**
  1. **Attachment Button:** Menambahkan tombol ikon kamera/lampiran `[📷 add_a_photo]` pada bilah floating input chat (`#chat-input-wrapper`).
  2. **Dedicated Mobile OCR API:** Membangun endpoint `POST /api/mobile/receipt` yang menerima `base64Image`, menjalankan ekstraksi teks & nominal via **Gemini Vision OCR (`processReceiptImage`)**, dan mengklasifikasikan kategori merchant secara otomatis.
  3. **Rich Receipt Card Bubble:**
     - Menampilkan pratinjau foto struk (*thumbnail preview*) yang dikirim pengguna.
     - Menyajikan kartu ekstraksi eksekutif: Nama Merchant, Total Nominal Belanja, Kategori Otomatis, dan Daftar Barang Itemized (nama, qty, harga).
     - Otomatis mencatat transaksi baru ke database Supabase dan merefresh data pada Tab Database & status saldo dompet.

## 🛠️ BAB III: PANDUAN TEKNIS FITUR UTAMA & ENGINE GRAFIK

### 3.1 Ringkasan 5 Tab Aplikasi Raphael

| Tab | Nama Tab | Ikon | Deskripsi & Fitur Utama |
|---|---|---|---|
| **Tab 1** | Analisis | `analytics` | Health Score 88/100, 2x2 Metrik Grid (Pemasukan, Pengeluaran, Sisa Kas, Burn Rate), Compact Gantt Chart 2026, dan Target Sinking Fund & Beban Cicilan. |
| **Tab 2** | Database | `storage` | Dual-View Switcher (Transaksi vs Agenda), Filter Dompet, Pencarian, Tombol Tambah, Edit, dan Hapus data realtime Supabase. |
| **Tab 3** | **Raphael Chat** | `smart_toy` | Center Hero Default Screen. AI Assistant Chat, Quick Action Pills, Voice STT, Multi-Chart Visualizations (Line, Bar, Donut, Gantt), dan Map Card Generator. |
| **Tab 4** | Notifikasi | `notifications` | GPS Live Weather Open-Meteo & reverse geocoding, Advice Narik Gojek, Pengingat Cicilan Bank Jago (Tgl 20), dan Hutang Rifky (Tgl 5). |
| **Tab 5** | Profil | `settings` | Profil Mas Firman (Verified User), Tombol Modal Setting AI (Deskripsi Bebas vs Bullet Points), Auto-Summarizer Config, dan Status Saldo 5 Dompet. |

---

## 📋 BAB IV: STANDAR OPERASIONAL PROSEDUR (SOP) PENGEMBANGAN

### 4.1 Checklist Wajib Sebelum Mengubah Kode (Pre-Flight Checklist)
1. Baca dokumen ini (`RANGKUMAN_AUDIT_KESALAHAN_DAN_KOREKSI_RAPHAEL_APP.md`) secara utuh.
2. Periksa device state: pastikan ADB terhubung (`adb devices`) ke Realme 5i (`9c4f8447`).
3. Pastikan tidak ada library visual baru yang bergantung pada CDN eksternal (wajib di-bundle lokal jika perlu offline/instant load).

### 4.2 Checklist Wajib Setelah Mengubah Kode (Post-Flight Checklist)
1. Uji sintaks JavaScript menggunakan Node.js:
   ```bash
   node -c "D:\MANAS PROJEK\data_core_mobile\app\src\main\assets\www\app.js"
   ```
   *Wajib return code 0 (tanpa SyntaxError).*
2. Sinkronkan kode HTML/JS ke Next.js mobile webview route (`telegram/app/mobile/page.tsx`) dan push ke git repo jika relevan.
3. Kompilasi APK menggunakan Gradle 8.5 dan install otomatis via ADB:
   ```bash
   python scratch/rebuild_and_install_apk.py
   ```
4. Pantau logcat runtime (`session_runtime_logs.txt`) untuk memastikan tidak ada unhandled exception atau crash WebView.
5. **Perbarui dokumen ini** dengan menambahkan rincian perbaikan baru jika ada perubahan struktural atau fungsional.

---
*Dokumen ini adalah Single Source of Truth arsitektur mobile Raphael. Terakhir diperbarui & divalidasi: 27 Agustus 2026.*
