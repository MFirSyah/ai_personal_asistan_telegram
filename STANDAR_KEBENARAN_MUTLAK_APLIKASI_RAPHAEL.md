# 🏛️ STANDAR KEBENARAN MUTLAK APLIKASI RAPHAEL COCKPIT EXECUTIVE (SSOT)
**Dokumen Tunggal Rujukan Kebenaran Sistem (Single Source of Truth)**
*Status: FINAL RECONCILED & AUDITED — Versi 3.2.0 Enterprise Skripsi-Grade*
*Tanggal Harmonisasi: 29 Agustus 2026*

---

## 📌 DAFTAR ISI & STRUKTUR HARMONISASI
1. **Audit Duplikasi Penomoran & Eliminasi Tumpang Tindih Dokumen**
2. **Rekonsiliasi Regresi (Hal yang Dulu Benar Namun Menjadi Salah di Versi Berikutnya)**
3. **Standar Kebenaran Mutlak 5 Tab Navigasi Utama**
   - Tab 1: Cockpit Analisis Lengkap (6 Card Eksekutif & Gantt Chart)
   - Tab 2: Pusat Data Transaksi & Aktivitas (Matriks Eisenhower & CRUD Modal)
   - Tab 3: Raphael AI Executive Butler (Chat Hub, Docking Presisi 8px & Guardrails)
   - Tab 4: Pusat Notifikasi, Cuaca GPS & Morning Briefing
   - Tab 5: Profil Pengguna, Dynamic Hub & Pengaturan Sistem
4. **Prinsip AI Wajib Jujur (Honest by Default) & Batasan Sistem**
5. **Standar Desain Visual, Tipografi, & Safe-Area Clearance**
6. **Matriks Verifikasi Teknis & Hasil Uji Perangkat Fisik (Realme RMX2030)**

---

## 1. AUDIT DUPLIKASI PENOMORAN & ELIMINASI TUMPANG TINDIH

### A. Temuan Duplikasi Penomoran Bab
Pada logbook riwayat pembaruan sebelumnya, ditemukan **23 duplikasi nomor bab** (Bab 2.16 hingga Bab 2.39 dicatat dua kali):
- **Kelompok 1 (Arsip Lama v2.1.0 – v2.7.8):** Penomoran evolusi awal yang dicatat mundur dari Bab 2.51 hingga 2.14.
- **Kelompok 2 (Arsip Rebuild v3.0.0 – v3.2.0):** Pembaruan besar antarmuka modern yang secara keliru mengulang kembali nomor bab dari Bab 2.16 hingga Bab 2.39, bukan melanjutkan ke Bab 2.52+.

### B. Resolusi Standar Penomoran Resmi
Semua fitur dan pembaruan kini distandarisasi secara kronologis tunggal tanpa duplikasi nomor:
- **Fase Fondasi (v1.0 – v2.0):** Telegram Bot & Supabase Core Engine.
- **Fase Transisi Android (v2.1 – v2.7):** Migrasi WebView, SharedPreferences, Local Notification.
- **Fase Transformasi Modern (v3.0 – v3.2):** Glassmorphism Dark Mode, 5 Tab Eksekutif, Visual Gantt Chart, Matrix Eisenhower, dan Prinsip AI Wajib Jujur.

---

## 2. REKONSILIASI REGRESI (YANG DULU BENAR TAPI MENJADI SALAH)

| No | Fitur / Aspek | Kondisi Benar Sebelumnya | Regresi (Menjadi Salah di Versi Berikutnya) | Resolusi Mutlak (Kondisi Terkini) |
|---|---|---|---|---|
| 1 | **Jarak Docking Bubble Chat** | Pada Bab 2.23 disetel presisi clearance 12px di atas dock input. | Pada Bab 2.34/2.35 ditambahkan `pb-32` (128px) di `#tab-chat` + `h-36` (144px) di anchor + `154px` inline padding, menyebabkan **ruang kosong 302px** dan bubble melayang. | **DIPERBAIKI:** `#tab-chat` menggunakan `min-h-[calc(100vh-175px)]` dengan `flex flex-col justify-end`, `mt-auto`, anchor `h-1` (4px), dan padding kontainer `132px`. Bubble terbukti menempel presisi **8px** di atas dock input. |
| 2 | **Inisialisasi Kartu Analitik** | Pada Bab 2.40 kartu Arus Kas, Runway, dan 50/30/20 dibuat untuk menampilkan metrik finansial. | Fungsi `changeAnalyticsTimeframe()` hanya dipicu saat tombol diklik manual, sehingga saat aplikasi pertama dibuka semua kartu menampilkan `Rp 0`. | **DIPERBAIKI:** Memanggil `changeAnalyticsTimeframe('month', false)` otomatis saat startup (`DOMContentLoaded`) dan saat membuka Tab Analitik (`switchTab`). |
| 3 | **Mode Suara / Audio / Mikrofon** | Bab 2.47 dan 2.36 menegaskan **100% Visual/Modal (NO TTS/STT)** dan menghapus izin mikrofon demi privasi & performa. | Dokumen awal Bagian A & B (poin 127, 149, 209, 216, 279) dan Bab 2.16 lama masih menyebutkan Voice Note, Audio Player, dan TTS. | **DIPERTEGAS MUTLAK:** Tidak ada fitur Voice TTS / STT. Aplikasi 100% visual dan modal-driven. AI dilengkapi guardrail untuk menolak klaim perintah suara secara santun dan jujur. |
| 4 | **Tema Antarmuka (Tema Gelap vs Terang)** | Bab 2.16 baru sempat mendesain Light Mode iOS 18 style. | Pengguna mengeluhkan silau dan kurang kontras pada layar AMOLED / IPS HP Realme. | **DIPERTEGAS MUTLAK:** Tema baku adalah **Glassmorphism Dark Mode Eksekutif** (Background: `#0B0819`, `#0D0A1E`, aksen Neon Violet `#7C3AED`, Tosca/Cyan `#06B6D4`, Emerald `#10B981`, dan Lime `#84CC16`). |
| 5 | **Tombol Logout & Ekspor Spreadsheet** | Handler fungsi dihubungkan dengan modal profil. | Terjadi perbedaan penamaan fungsi (`handleLogout()` vs `logoutUserSession()` dan `exportFullDataSpreadsheet()` vs `exportToExcel()`). | **DIPERBAIKI:** Dibuatkan fungsi global bridge sehingga kedua nama handler berfungsi 100%. |
| 6 | **Encoding Karakter Emoji (Mojibake)** | Emoji tampil sempurna sebagai UTF-8. | Script modifikasi teks tertentu merusak byte UTF-8 sehingga emoji `⚠️`, `⚡`, `🛡️` berubah menjadi `âš ï¸` dan `??`. | **DIPERBAIKI:** Seluruh file HTML dan JS dibersihkan total menggunakan UTF-8 murni bebas karakter rusak. |
| 7 | **Duplikasi Arsip Morning Briefing** | Arsip briefing 7 hari menyimpan 1 briefing per hari. | Pengujian tombol notifikasi menyebabkan entri uji coba tersimpan berulang kali (muncul 4 kartu Jumat 28 Agustus). | **DIPERBAIKI:** Ditambahkan deduplikasi otomatis berbasis tanggal pada `loadMorningBriefingArchive()`. |

---

## 3. STANDAR KEBENARAN MUTLAK 5 TAB NAVIGASI UTAMA

### 📱 TAB 1: COCKPIT ANALISIS LENGKAP
1. **Grafik Tren Keuangan Multi-Perspektif:**
   - Mendukung 3 tipe visualisasi: **Garis** (Line Chart tren harian), **Alokasi** (Doughnut Chart 50/30/20), dan **Batang** (Bar Chart komparasi).
   - Filter 5 periode aktif: `Hari Ini`, `7 Hari`, `Bulan Ini` (default aktif), `90 Hari`, `Semua`.
2. **6 Kartu Eksekutif Mandiri:**
   - **Card 1: Arus Kas & Cash Runway:** Menampilkan Pemasukan, Pengeluaran, Net Tabungan, Daily Burn Rate, dan Estimasi Runway Hari.
   - **Card 2: Alokasi Kaidah 50/30/20:** Kebutuhan Pokok (50%), Keinginan (30%), Tabungan (20%).
   - **Card 3: Pola Waktu Belanja (Time-Bucket):** Pagi (05-11), Siang (11-15), Sore (15-18), Malam (18-24), Dini Hari (00-05).
   - **Card 4: Komparasi Hari Kerja vs Akhir Pekan:** Rata-rata belanja Senin-Jumat vs Sabtu-Minggu.
   - **Card 5: Produktivitas & Eksekusi Agenda:** Skor Eisenhower (% prioritas tuntas).
   - **Card 6: Visual Gantt Chart Roadmap Kegiatan:** Integrasi timeline multi-hari (Trip Dieng, Skripsi, Agenda Karir, Gojek Rutin) dengan progress bar warna-warni.

### 📊 TAB 2: PUSAT DATA TRANSAKSI & AKTIVITAS
1. **Sub-Tab Switcher:** Berpindah instan antara **Transaksi Keuangan** dan **Agenda Aktivitas**.
2. **Matriks Kuadran Eisenhower:**
   - Filter 4 kuadran: **Q1 (Mendesak & Penting)**, **Q2 (Penting Tidak Mendesak)**, **Q3 (Mendesak Tidak Penting)**, **Q4 (Tidak Mendesak & Tidak Penting)**.
3. **Tombol Entri Cepat In-App Modal:** Tombol `+ Catat Transaksi` dan `+ Tambah Aktivitas` membuka dialog modal interaktif tanpa browser prompt bawaan.

### 💬 TAB 3: RAPHAEL AI EXECUTIVE BUTLER (HERO SCREEN)
1. **Tata Letak & Spacing "Nempel Paling Bawah":**
   - Bubble chat paling bawah harus berada tepat **8px - 12px** di atas kapsul input chat.
   - Tidak boleh ada ruang kosong hitam melompong (black void).
   - Input chat dibungkus dalam tag `<form>` dengan atribut `enterkeyhint="send"` dan touch trigger `onpointerdown` pada tombol kirim agar responsif terhadap virtual keyboard Android.
2. **12 Varian Kartu Visual Interaktif:**
   - Gantt Chart multi-hari, Line Chart tren kas, Donut Chart alokasi dompet, Bar Chart komparasi, Checklist Dieng, Checklist Skripsi, Simulasi Bank Jago, Odometer & Servis Beat FI, Peta Google Maps Trip Dieng, Deteksi Tabrakan Jadwal, Emergency ICE, dan Kartu Klarifikasi Ambigu.
3. **Konteks Riwayat Pesan:** Menampilkan bubble dua arah (User & Raphael) yang tersimpan secara lokal dan persisten. Long-press 1 detik pada bubble pesan pengguna memunculkan opsi edit dan salin teks.

### 🔔 TAB 4: PUSAT NOTIFIKASI, CUACA GPS & MORNING BRIEFING
1. **Kartu Cuaca GPS Realtime:** Memantau cuaca lokasi pengguna (Sidoarjo/Malang) dengan indikator kondisi jalanan narik Gojek / mobilitas motor.
2. **Morning Briefing Harian:** Menampilkan ringkasan batas belanja aman per hari, saldo kas likuid, dan daftar tugas darurat (Hutang Rifky Rp 150k, Cicilan Jago Rp 67.940).
3. **Arsip Riwayat Briefing 7 Hari:** Arsip terdeduplikasi rapi dengan fitur long-press untuk menghapus riwayat.
4. **Status Notifikasi Sistem:** Terhubung langsung ke Android `NotificationManager` status bar.

### ⚙️ TAB 5: PROFIL PENGGUNA, DYNAMIC HUB & PENGATURAN
1. **Header Identitas:** Nama pengguna dinamis ("Firman") dengan tombol pensil edit inline dan inisial avatar otomatis.
2. **Hub Pengaturan Modular (8 Tile Eksekutif):**
   - Kecerdasan & Persona AI (Model Gemini, Grounding & Tab Keterbatasan AI).
   - Jadwal Morning Briefing (Waktu notifikasi status bar).
   - Armada Motor & Odometer (Honda Beat FI N 4321 ABC, riwayat servis).
   - Status Dompet & Saldo (Kas Kertas, Gopay, SeaBank, Bank Jago).
   - Target Menabung & Liburan (Trip Dieng 2026, Servis, Skripsi).
   - Profil Darurat Medis (SOS / ICE, Golongan Darah O+, Kontak Darurat).
   - Status Database & Integrasi (Supabase Live Sync, Ekspor Spreadsheet).
   - Informasi Versi Sistem (Changelog Viewer v3.2.0).
3. **Tombol Keluar / Ganti Akun:** Tombol merah transparan dengan konfirmasi aman.

---

## 4. PRINSIP AI WAJIB JUJUR (HONEST BY DEFAULT)

Raphael Cockpit memegang teguh prinsip kejujuran mutlak dan transparansi teknis:
1. **Penolakan Transaksi Finansial Riil:** AI tidak memiliki otorisasi perbankan untuk mentransfer uang riil, debet rekening, atau mutasi bank otomatis. Raphael wajib menolak secara santun dan menawarkan simulasi atau pencatatan lokal.
2. **Penolakan Sintesis Suara / TTS / STT:** AI menegaskan bahwa modul suara dinonaktifkan demi privasi, kestabilan memori, dan efisiensi baterai.
3. **Penolakan Kendali Mesin / IoT:** AI tidak mengklaim dapat menyalakan mesin motor atau membuka pintu jarak jauh tanpa modul sensor IoT eksternal.
4. **Pencatatan Otomatis Keterbatasan:** Setiap perintah di luar kapabilitas sistem otomatis tercatat di Tab 3 Modal Preferensi AI (`🛡️ Keterbatasan AI`) lengkap dengan timestamp dan alasan teknis.
5. **Penanganan Perintah Ambigu:** Kata tidak jelas (seperti `"anu"`, `"tolong"`, `"???"`) ditangani dengan kartu klarifikasi ramah dan 3 pilihan tombol aksi cepat.

---

## 5. STANDAR VISUAL & TEKNIS

- **Desain:** Obsidian Glassmorphism (`backdrop-filter: blur(20px)`).
- **Tipografi:** Syne / Space Grotesk (Headline), Inter / JetBrains Mono (Body & Angka Finansial).
- **Android Integration:** Target SDK 34, Android 10+ (Tested Realme 5i / RMX2030), WebView Hardware Acceleration, Local Notification Channel `raphael_executive_channel`.
- **Ekspor Data:** CSV / Excel spreadsheet download langsung via Web Bridge.

---

## 7. LOGBOOK REKONSILIASI PEMBARUAN TERBARU (BAB 2.40 - 2.42)

### Bab 2.40: Safe Zone Clearance & Eliminasi Tertimpa Bilah Input
- **Akar Masalah:** `anchor.scrollIntoView({ block: 'end' })` menarik jangkar ke batas paling bawah layar fisik (Y = 100vh) tepat di balik bilah input fixed bawah (128px), sehingga paragraf penutup, action chips, dan jam tertutup.
- **Koreksi:** Menghapus `scrollIntoView` dan menggunakan pengguliran langsung kontainer (`mainScroll.scrollTop = mainScroll.scrollHeight`).

### Bab 2.41: Kalibrasi Presisi Golden Snug Clearance 14px (Mepet Alami Bebas Tertimpa)
- **Akar Masalah:** Padding 176px membuat kartu bubble melayang terlalu tinggi (~48px).
- **Koreksi:** Menyetel `paddingBottom` ke **`140px`** dan spacer `#chat-bottom-anchor` ke **`h-2`** (8px).
- **Hasil:** Dengan batas atas bilah input di `126px`, kartu berhenti presisi **`14px`** di atas tempat tulis chat (mepet alami, padat, dan 100% aman).

### Bab 2.42: Pemulihan Pure Greeting Orchestrator & Eliminasi Salah Klasifikasi Ambigu
- **Akar Masalah:** Kata sapaan `"halo"`, `"hai"`, dan `"p"` keliru dimasukkan ke regex filter ambigu sehingga memicu kartu teguran dan karakter rusak `??`.
- **Koreksi:** Mengaktifkan kembali orkestrator sapaan murni (salam waktu hari pagi/siang/sore/malam ramah) di urutan prioritas teratas, membersihkan kata sapaan dari filter ambigu, dan memulihkan simbol `📊`, `🛵`, `•`, `➔`.

## BAB 8: STANDAR SISTEM FILTER TANGGAL & AUDIT 5 TAB UTAMA (v3.2.1)
1. **Fitur Filter Tanggal Tab Database:**
   - Tab Database (baik Sub-Tab Transaksi maupun Sub-Tab Agenda) wajib menyediakan bilah filter tanggal presisi:
     - Quick Pills: `Semua`, `Hari Ini`, `7 Hari`, `Bulan Ini`, dan `Kustom`.
     - Kontainer Rentang Tanggal Kustom: input `Dari Tanggal` dan `Sampai Tanggal` dengan tombol reset cepat.
     - Indikator Counter Realtime: menampilkan jumlah data yang lolos filter (contoh: `50 dari 50 data`).
   - Filter tanggal harus bekerja secara harmonis dan simultan dengan filter dompet (pada transaksi) dan kuadran prioritas Eisenhower (pada agenda).
2. **Kepatuhan Tampilan Atribut Terstruktur:**
   - Seluruh entitas transaksi wajib menampilkan: ID transaksi, tanggal/jam format WIB, nama deskripsi, nominal bertanda (+/-), kategori, dompet, serta badge opsional (*recurring, sinking fund, fuel liters, business ops*).
   - Seluruh entitas agenda wajib menampilkan: ID agenda, status (*scheduled/completed*), prioritas (*urgent*), tanggal/jam WIB, judul agenda, catatan, kategori, serta badge (*travel buffer, progress %, milestone*).
3. **Integritas Visual 5 Tab:**
   - Tab 1: Grafik tren keuangan (Garis, Donut 50/30/20, Batang) dan 6 kartu eksekutif wajib terisi data dinamis.
   - Tab 3: Bubble chat harus mempertahankan jarak aman ultra-snug 7px dari dock input.
   - Tab 4: Cuaca GPS realtime dan kartu Morning Briefing harus terhubung langsung dengan notifikasi lokal status bar Android.
   - Tab 5: Profil terverifikasi Mas Firman dan seluruh 8 tile pengaturan modular eksekutif harus responsif.

## BAB 9: STANDAR DESAIN UI/UX, TIPOGRAFI HYBRID & ERGONOMI MOBILE (v3.3.0)
1. **Standar Tipografi Dual-Font Hybrid:**
   - **Font UI Utama (85%):** Wajib menggunakan **`Plus Jakarta Sans`** (fallback: `DM Sans`, `Inter`, sans-serif) untuk seluruh judul (*headline*), teks tubuh (*body copy*), label tombol, menu, subtitle, dan bubble percakapan. DILARANG KERAS menggunakan font monospace untuk teks kalimat naratif.
   - **Font Teknis & Numerik (15%):** Wajib menggunakan **`JetBrains Mono`** / `Geist Mono` khusus untuk: ID entitas (`TX-...`, `ACT-...`), penanda jam format WIB (`16:18 WIB`), nominal angka mata uang tabular (`Rp 78.000`), pelat nomor kendaraan (`N 4321 ABC`), dan angka odometer (`45.200 KM`).
2. **Standar Palet Warna & Glassmorphism (Eliminasi White Card Anomaly):**
   - Latar belakang wajib gelap konsisten (`#0D0A1E`) dengan ambient radial gradient orbs (violet dan biru).
   - Seluruh kartu wajib bertema Dark Cyber-Glass (`glass-card` / `glass-card-elevated`). DILARANG menggunakan kartu putih polos atau elemen bernuansa light mode (`bg-white`, `bg-emerald-50`, `bg-cyan-50`) di dalam hierarki antarmuka utama.
   - Kartu identitas pengguna (Hero Profile Card) wajib menggunakan Obsidian Cyber-Glass dengan border aksen `border-primary/40`, monogram avatar berlatar gelap dengan ring gradasi, dan lencana terverifikasi berwarna emerald neon.
3. **Standar Ergonomi Touch Targets & Aksi Kartu:**
   - Seluruh tombol aksi interaktif (khususnya `Edit` dan `Hapus` pada kartu transaksi/agenda) wajib memiliki dimensi sentuh minimal tinggi 30-36px dengan padding `px-3 py-1.5` serta animasi umpan balik `active:scale-95`.
   - Tombol aksi wajib disertai ikon Material Symbols yang representatif (`edit` dan `delete`) untuk kejelasan visual instan.
4. **Standar Pengendali Navigasi & Auto-Scroll:**
   - Navigasi tab non-chat (`switchTab`) wajib mereset posisi scroll ke titik teratas (`mainScroll.scrollTop = 0`) secara otomatis saat dibuka.

5. **Standar Persistensi Widget & Chart Riwayat Chat:**
   - Setiap fungsi pembuatan bubble khusus/widget (`appendLineChartBubble`, `appendDoughnutChartBubble`, `appendBarChartBubble`, `appendRichGanttBubble`, dsb.) **WAJIB** menyimpan `widgetType` yang identik dengan jenis kartu aslinya ke dalam `chatHistory`.
   - **DILARANG KERAS** meng-copy-paste string `widgetType: 'gantt'` ke widget lain.
   - Fungsi `loadSavedChatMessages()` wajib memiliki *self-healing recovery* yang mampu memulihkan tipe widget berdasarkan prompt user jika terjadi anomali data cache lama.

6. **Standar Desain Clean Glassmorphism & Responsif Adaptif Tablet/Smartphone:**
   - **Prinsip Layar Smartphone (< 640px):** Wajib menggunakan format kartu vertikal 1-kolom (`grid-cols-1`) yang ergonomis untuk navigasi jempol satu tangan. Dilarang memaksa tabel spreadsheet tidur yang menimbulkan geser samping berlebih.
   - **Prinsip Layar Tablet (>= 768px / Landscape):** Wajib mengaktifkan kisi responsif 2-kolom (`md:grid-cols-2`) pada daftar database, cockpit analisis, dan profil agar ruang layar lebar terisi proporsional.
   - **Prinsip Ramah Mata (Eye-Friendly):** Background wajib bernuansa obsidian dark (`#0A0818` s/d `#0D0A1E`), teks utama berwarna soft slate (`#F1F5F9`), dan tingkat transparansi kaca bergradasi lembut `rgba(255,255,255,0.065)` dengan blur minimal 16px. Dilarang menggunakan kontras tinggi yang menyilaukan mata.

6. **STANDAR ESTETIKA TRUE FROSTED GLASSMORPHISM & RESPONSIVITAS MULTI-DEVICE (WAJIB & TIDAK BOLEH DILANGGAR):**
   - **Zero Solid Borders:** Dilarang keras menggunakan border solid tebal (seperti `border-l-2` atau `border-l-4` berwarna kaku). Status item (selesai, tertunda, urgent) harus diekspresikan melalui lencana pil bundar (*pill badge*) semi-transparan dengan border mikro lembut.
   - **Specular Highlight & Super-Ellipse:** Setiap kartu kaca harus memiliki sudut membulat elegan (`rounded-2xl` atau minimal 16px-20px), garis kilau atas (`border-top: 1px solid rgba(255,255,255,0.25)`), dan `backdrop-filter: blur(20px) saturate(180%)`.
   - **No Opaque Inner Rectangles:** Dilarang meletakkan container datar gelap solid (`bg-background`) di dalam kartu kaca. Sub-komponen di dalam kartu harus tetap menggunakan translusensi mikro (`bg-white/[0.04]` s/d `bg-white/[0.06]`).
   - **Luminous Glowing Charts:** Garis grafik keuangan wajib menggunakan warna neon menyala ramah mata (Emerald `#10B981` dan Rose `#F43F5E`) dengan kurva halus (`tension: 0.35-0.4`) dan kontainer responsif tablet (`h-48 md:h-64`).
   - **Dual-Mode Layout Responsif:** Pada mode smartphone (vertikal), elemen tersusun 1 kolom ramah jempol. Pada mode tablet (horizontal/landscape), seluruh daftar kartu (database kas, agenda, cockpit analisis, menu profil) wajib otomatis terbagi menjadi 2 kolom berdampingan (`grid-cols-1 md:grid-cols-2`) dengan batas lebar maksimum (`max-w-6xl`).

7. **STANDAR DUAL-NAVIGATION & EXECUTIVE FROSTED SIDEBAR TABLET (v3.5.0):**
   - **Tablet Landscape Layout (>= 768px):** Navigasi bawah (*bottom bar*) **WAJIB DIHILANGKAN** (md:hidden) dan digantikan oleh *Executive Frosted Glass Sidebar* mandiri di sisi kiri (<aside id="tablet-sidebar" class="hidden md:flex w-64 ...">).
   - **Elemen Wajib Sidebar Tablet:**
     1. Brand Header: RAPHAEL COCKPIT dengan lencana versi dan avatar glowing neon.
     2. Vertical Tab Menu: 5 tombol navigasi dengan icon Material Symbols, typography Plus Jakarta Sans, dan active indicator pill dengan border glow violet.
     3. System Integration Dock: Status koneksi Supabase Cloud (LIVE indicator).
     4. Executive User Capsule: Inisial avatar 'MF', nama pengguna 'Mas Firman', badge 'Executive User', dan tombol logout.
   - **Sinkronisasi Tab State:** Fungsi navigasi switchTab() wajib secara simultan memperbarui status visual aktif baik pada navigasi bawah ponsel maupun pada sidebar tablet.
   - **Main Content Cockpit:** Kontainer konten sebelah kanan harus membentang responsif (lex-1 min-w-0), menyematkan header mandiri bersudut membulat (*independent glass header*), dan mengalirkan kartu ke kisi multi-kolom yang seimbang.
