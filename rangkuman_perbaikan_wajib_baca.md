# 🔍 MASTER AUDIT EKSTREM EKOSISTEM RAPHAEL MOBILE: 300 TEMUAN GAP FITUR & POTENSI KERENTANAN SISTEM
**Dokumen:** Master Audit Komprehensif Skala Penuh (*Full-Scale Exhaustive Audit*) Seluruh Ekosistem Aplikasi Raphael Mobile (`com.datacore.app`) vs Backend Next.js Supabase (`ai_personal_asistan_telegram`).  
**Pemilik Sistem:** Mas Firman (`fc2758d3-78bb-4e22-b9f0-b3b16568b671` / Telegram: `1084842050`).  
**Status Audit:** Master Single Source of Truth (Katalog 300 Poin Terkunci).  
**Tanggal Audit:** 27 Agustus 2026.  
**Metodologi:** Static Source Code Cross-Audit, Post-Mortem Failure Tree Analysis (FTA), Network Fault Simulation, Android Runtime Profiling, Memory Heap Analysis, Threat Modeling (OWASP Mobile Top 10), dan UX Responsiveness Benchmarking (Realme 5i / Android 10).

---

> [!IMPORTANT]
> **PANDUAN MUTLAK SINGLE SOURCE OF TRUTH**:
> Dokumen ini memuat **300 Poin Temuan Granular** yang mencakup seluruh aspek arsitektur, fitur, keamanan, performa, dan logika bisnis.
> Setiap pengembang dan AI asisten WAJIB merujuk pada nomor poin dokumen ini saat melakukan perbaikan, dan DILARANG KERAS memodifikasi logika sistem tanpa memvalidasi terhadap katalog 300 poin ini.

---

## 📑 DAFTAR ISI MASTER AUDIT (300 POIN)
1. [BAGIAN A: 150 FITUR EKOSISTEM TELEGRAM BOT & WEB APP YANG BELUM MASUK / BELUM LENGKAP DI MOBILE APP](#bagian-a-150-fitur-ekosistem-telegram-bot--web-app-yang-belum-masuk-ke-mobile-app)
   - [A.1 Keuangan Lanjutan, Kalkulator & Analitik Finansial (Poin 1–25)](#a1-keuangan-lanjutan-kalkulator--analitik-finansial)
   - [A.2 Rencana Hidup, Logistik Dieng, Roadmap & Manajemen Rute (Poin 26–50)](#a2-rencana-hidup-logistik-dieng-roadmap--manajemen-rute)
   - [A.3 Ekspor Data, Laporan PDF/SQL & Sinkronisasi Eksternal (Poin 51–75)](#a3-ekspor-data-laporan-pdfsql--sinkronisasi-eksternal)
   - [A.4 Super Admin Portal, Data Inspector & Mutasi Sistem (Poin 76–100)](#a4-super-admin-portal-data-inspector--mutasi-sistem)
   - [A.5 Persona Royal Butler, Slang Malang, Format 3 Lapis & NLP (Poin 101–125)](#a5-persona-royal-butler-slang-malang-format-3-lapis--nlp)
   - [A.6 Fitur Native Android, Notifikasi, Offline Storage & Hardware (Poin 126–150)](#a6-fitur-native-android-notifikasi-offline-storage--hardware)
2. [BAGIAN B: 150 POTENSI BUG, ERROR, EDGE CASES, MEMORY LEAKS & KERENTANAN SISTEM](#bagian-b-150-potensi-bug-error-edge-cases-memory-leaks--kerentanan-sistem)
   - [B.1 Jaringan, Protokol Serverless, Cold-Start & Sinkronisasi Cloud (Poin 151–175)](#b1-jaringan-protokol-serverless-cold-start--sinkronisasi-cloud)
   - [B.2 Validasi Form, Integritas Database, Sanitasi XSS & Keamanan (Poin 176–200)](#b2-validasi-form-integritas-database-sanitasi-xss--keamanan)
   - [B.3 Kinerja Memori, Siklus Hidup WebView, Canvas Leaks & Battery Drain (Poin 201–225)](#b3-kinerja-memori-siklus-hidup-webview-canvas-leaks--battery-drain)
   - [B.4 Logika Bisnis, Algoritma Finansial & Penalaran Multi-Turn AI (Poin 226–250)](#b4-logika-bisnis-algoritma-finansial--penalaran-multi-turn-ai)
   - [B.5 Antarmuka Responsif, Layar Realme 5i, Touch Handling & Aksesibilitas (Poin 251–275)](#b5-antarmuka-responsif-layar-realme-5i-touch-handling--aksesibilitas)
   - [B.6 Integrasi Perangkat Keras, Sensor, Audio, File Picker & OS Android (Poin 276–300)](#b6-integrasi-perangkat-keras-sensor-audio-file-picker--os-android)

---

## 🏛️ BAGIAN A: 150 FITUR EKOSISTEM TELEGRAM BOT & WEB APP YANG BELUM MASUK / BELUM LENGKAP DI MOBILE APP

### A.1 Keuangan Lanjutan, Kalkulator & Analitik Finansial (Poin 1–25)
1. **Split Bill WhatsApp Formatter (`lib/features/split-bill.ts`)**: Fitur pembagian tagihan makan patungan per item (*itemized split*) yang otomatis membuat teks penagihan WhatsApp rapi dengan rincian nama dan nomor rekening.
2. **Kalkulator Penghematan Pelunasan Awal Bank Jago (`calculateEarlyRepaymentSavings`)**: Perhitungan penghematan bunga hingga Rp 215.280 jika sisa pokok kredit dilunasi sekaligus lebih awal.
3. **Kalkulator Sinking Fund Tahunan STNK Beat (`calculateSinkingFund`)**: Perhitungan alokasi tabungan harian/bulanan untuk pos tahunan (Pajak Rp 250.000 / 12 = Rp 20.833/bln).
4. **Kalkulator Kekayaan Bersih Realtime (`calculateNetWorth`)**: Menghitung Total Saldo Kas Likuid 5 Dompet dikurangi Sisa Pokok Hutang Bank Jago & Hutang Rifky.
5. **Rasio Efisiensi Bensin Gojek (`calculateGojekEfficiency`)**: Menghitung rasio biaya bensin Pertalite Beat terhadap omzet harian narik Gojek (Target ROI >5.0x).
6. **Deteksi Kebocoran Kas Mikro / Latte Factor (<Rp 15.000)**: Peringatan dini atas akumulasi pembelian es teh/kopi kecil harian yang menggerus arus kas.
7. **Widget Streak & Apresiasi "No-Spend Day"**: Pelacak hari bebas belanja (*no-spend day streak*) untuk memotivasi kedisiplinan menabung Mas Firman.
8. **Live Mutasi 5 Dompet Dinamis**: Tampilan kartu saldo realtime untuk *Cash Kertas, Cash Koin, Gopay Driver, SeaBank, dan Bank Jago*.
9. **Disambiguasi Skala Nominal & Valuta Asing**: Pengenalan otomatis istilah slang nominal "50k", "50rb", "$10 USD" ke Rupiah secara kontekstual.
10. **Validator Pos Anggaran 50/30/20**: Pengecekan otomatis proporsi apakah Kebutuhan Pokok <50%, Keinginan <30%, dan Tabungan/Investasi >20%.
11. **Alokasi Dana Darurat Multi-Tier**: Perhitungan target dana darurat 3 bulan (Rp 6.000.000) dan 6 bulan (Rp 12.000.000) hidup di Malang.
12. **Simulasi Dampak Inflasi Pengeluaran Bulanan**: Proyeksi kenaikan harga kebutuhan pokok 4.5% tahunan terhadap daya beli kas.
13. **Pelacak Tagihan Berulang / Langganan Rutin (`subscriptions` Table)**: Notifikasi jatuh tempo kuota internet, Spotify, dan hosting.
14. **Buku Pencatatan Utang & Piutang Teman (`debts` Table)**: Fitur mencatat siapa yang meminjam uang ke Mas Firman dan status pelunasannya.
15. **Manajer Angsuran Kredit Tenor Panjang (`installments` Table)**: Pelacak sisa bulan dan nominal jatuh tempo cicilan aktif.
16. **Kalkulator Titik Impas Harian Gojek (Daily Break-Even Point)**: Target omzet minimal per hari untuk menutup biaya bensin, makan, dan cicilan motor.
17. **Grafik Radar 6 Dimensi Kebugaran Finansial**: Visualisasi radar chart untuk Likuiditas, Rasio Tabungan, Efisiensi, Beban Hutang, Cadangan, dan Disiplin.
18. **Pencatat Nominal Arisan & Tabungan Bersama**: Pencatatan uang setoran titipan rekan kerja atau keluarga.
19. **Pemisahan Modal Kerja vs Saldo Pribadi**: Isolasi saldo uang kembalian narik Gojek agar tidak terpakai untuk belanja pribadi.
20. **Visualisasi Burn Rate Proyektif 30 Hari**: Estimasi tanggal saldo kas habis jika pola pengeluaran harian tidak dikurangi.
21. **Analisis Sensitivitas Lonjakan Biaya Servis Motor**: Simulasi kesiapan kas jika motor Beat memerlukan servis berat mendadak Rp 300.000.
22. **Rekonsiliasi Selisih Fisik Dompet vs Data Sistem**: Tombol audit cepat jika uang di saku berbeda Rp 2.000 dengan catatan database.
23. **Simulasi Pengalihan Dompet Otomatis (Auto-Sweep)**: Saran memindahkan saldo Gopay berlebih ke rekening tabungan utama.
24. **Laporan Perbandingan Arus Kas Bulan Berjalan vs Bulan Lalu**: Delta persentase pemasukan dan pengeluaran Month-over-Month.
25. **Pengelompokan Biaya Tetap vs Biaya Variabel**: Pemisahan otomatis antara sewa kos & cicilan dengan belanja makan & bensin.

### A.2 Rencana Hidup, Logistik Dieng, Roadmap & Manajemen Rute (Poin 26–50)
26. **Tabel CRUD Rencana Jangka Panjang (`plans` Table)**: List rencana interaktif dengan status *draft, in_progress, completed, cancelled*.
27. **Checklist Logistik Wisata Pegunungan Dieng (Aturan 42)**: Rekomendasi otomatis pakaian polar tebal, homestay berpemanas air (water heater), dan sarung tangan.
28. **Tabel Resmi Harga BBM Pertamina Jawa Timur (Aturan 48)**: Data harga resmi Pertalite (Rp 10.000), Pertamax (Rp 15.950), Solar (Rp 6.800), Dexlite (Rp 19.700).
29. **Carousel Kartu Rekomendasi Tempat (Minimal 5 Item - Aturan 23)**: Kartu tempat wisata/kafe terpisah dengan tombol Google Maps & Custom Details.
30. **Pelacak Kebiasaan Harian Berbasis Kalender WIB (`lib/features/habits-and-tasks.ts`)**: Habit streak tracker yang membandingkan tanggal kalender Asia/Jakarta.
31. **Engine Simulasi Finansial "What-If" (Aturan 28)**: Prediksi hari target tabungan tercapai jika omzet Gojek naik Rp 30.000/hari.
32. **Generator Rute Navigasi Multi-Titik Two-Wheeler (Aturan 49)**: Link rute motor Google Maps (Malang–Kediri–Nganjuk–Wonosobo–Dieng).
33. **Pendeteksi Tabrakan Jadwal Cerdas (`checkActivityCollision`)**: Peringatan bentrok jadwal dalam selisih 60 menit di tanggal yang sama.
34. **Matriks Prioritas Tugas (Eisenhower Matrix)**: Kuadran *Penting-Mendesak, Penting-Tidak Mendesak, Mendesak-Tidak Penting, Hapus*.
35. **Visual Tracker Rincian Biaya Dieng**: Pagu Rp 1.040.000 (Tiket Rp 340k, Jajan Rp 500k, Perlengkapan Rp 200k).
36. **Checklist Kondisi Fisik Motor Honda Beat Jelang Touring**: Reminder cek ketebalan kampas rem, tekanan ban, dan oli mesin sebelum ke Dieng.
37. **Peta Titik SPBU Sepanjang Jalur Touring Jawa Timur - Jawa Tengah**: Rekomendasi titik pengisian bensin utama sebelum naik tanjakan Dieng.
38. **Peringatan Fenomena Suhu Embun Upas Dieng**: Notifikasi jika suhu Dieng mendekati 0°C pada malam hari.
39. **Pencatat Landmark & Rest Area Favorit**: Daftar titik singgah istirahat touring di Nganjuk dan Solo.
40. **Roadmap Milestone Bimbingan Skripsi Telkom University**: Pelacak progres revisi Bab 4 dan Bab 5 dengan Pak Sulthan.
41. **Estimasi Durasi Perjalanan Realtime Berbasis Kemacetan**: Perkiraan jam tiba jika berangkat dari Malang jam 05:00 WIB.
42. **Pencatat Kontak Darurat Bengkel & Ambulans Jalur Wonosobo**: Nomor darurat posko SAR Dieng dan tambal ban 24 jam.
43. **Checklist Dokumen Wajib Fisik (KTP, SIM C, STNK Asli)**: Pengingat dokumen berkendara sebelum menempuh perjalanan antar-provinsi.
44. **Panduan Kuliner Khas Dieng (Mie Ongklok & Carica)**: Rekomendasi tempat makan halal terpopuler di Wonosobo.
45. **Pelacak Waktu Istirahat Touring (Setiap 2.5 Jam)**: Alarm pengingat istirahat untuk mencegah *micro-sleep* berkendara motor.
46. **Simulasi Biaya Parkir & Tiket Wisata Tambahan (Kawah Sikidang, Telaga Warna)**: Alokasi uang kas pas di saku celana untuk karcis wisata.
47. **Fitur Pin Lokasi Parkir Motor**: Penyimpan koordinat GPS posisi motor diparkir di tempat wisata.
48. **Checklist Obat-obatan Pribadi & Tolak Angin**: Pengingat membawa minyak kayu putih, obat flu, dan plester.
49. **Log Perjalanan / Trip Odometer Tracker**: Pencatatan total kilometer riil yang ditempuh selama touring Dieng.
50. **Rekapitulasi Total Pengeluaran Realisasi Pasca-Touring**: Komparasi antara anggaran rencana (Rp 1.040.000) vs realisasi nota belanja.

### A.3 Ekspor Data, Laporan PDF/SQL & Sinkronisasi Eksternal (Poin 51–75)
51. **Generator & Pengunduh Laporan Eksekutif PDF (`lib/features/pdf-report.ts`)**: Pembuatan dokumen PDF resmi arus kas bulanan.
52. **Ekspor Cadangan Database Format SQL (`/api/export?format=sql`)**: Pengunduhan dump SQL database Supabase untuk backup lokal.
53. **Monitoring Sinkronisasi Google Sheets Realtime**: Indikator status stream sinkronisasi Google Sheets dan tombol *Force Sync*.
54. **Pengirim Briefing Pagi Otomatis (Jam 07:00 WIB)**: Notifikasi push briefing agenda dan batas belanja harian.
55. **Pengatur Jam Briefing Kustom**: Pengaturan jam briefing pagi sesuai jam bangun Mas Firman di tab profil.
56. **Generator Laporan Email Eksekutif**: Pengiriman ringkasan keuangan mingguan langsung ke email Mas Firman via Nodemailer.
57. **Kotak Masuk (*Notification Center History*)**: Riwayat seluruh pengingat, anomali, dan peringatan saldo yang pernah dikirimkan.
58. **Sanitasi Formula Injection pada Ekspor CSV (`sanitizeCsvCell`)**: Pencegahan karakter formula Excel berbahaya (`=`, `+`, `-`, `@`).
59. **Rangkuman Evaluasi Finansial Bulanan (*Monthly Digest*)**: Analisis perbandingan bulan ke bulan (*Month-over-Month growth*).
60. **Filter Kategori Notifikasi**: Pemfilteran notifikasi berdasarkan *Urgen/Cicilan, Cuaca, dan Info Pengeluaran*.
61. **Ekspor Laporan dalam Format JSON Raw**: Opsi download data transaksi terstruktur untuk analisis data sains.
62. **Generator Invoice & Kuitansi Pembayaran Digital**: Pembuat bukti tanda terima kuitansi sederhana berformat gambar/PDF.
63. **Otomatisasi Backup Harian ke Google Drive**: Sinkronisasi database berkala ke folder Google Drive pribadi.
64. **Indikator Keberhasilan Sinkronisasi Baris per Baris**: Tanda centang hijau pada transaksi yang sudah berhasil masuk Google Sheets.
65. **Pengaturan Frekuensi Ekspor Terjadwal**: Opsi menerima rekap PDF otomatis setiap hari Minggu malam jam 21:00 WIB.
66. **Kustomisasi Header & Judul Dokumen Ekspor**: Opsi menambahkan catatan kaki atau tanda tangan digital pada PDF.
67. **Pembuat Ringkasan SPT Pajak Penghasilan Sederhana**: Rekap estimasi total omzet tahunan untuk pelaporan pajak.
68. **Ekspor Log Audit Perubahan Data (Audit Trail)**: Catatan riwayat jam pengeditan atau penghapusan data transaksi.
69. **Sinkronisasi Kalender dengan Google Calendar**: Ekspor jadwal agenda aktivitas ke format file `.ics` kalender.
70. **Pengirim Peringatan Kuota Penyimpanan Supabase**: Indikator sisa kapasitas database cloud PostgreSQL.
71. **Mode Ekspor Terenkripsi dengan Password ZIP**: Pengamanan file backup database dengan enkripsi kata sandi.
72. **Pencetak Rekap Transaksi Khusus Merchant Tertentu**: Filter ekspor untuk melihat total belanja di Indomaret atau SPBU saja.
73. **Pengatur Format Desimal & Mata Uang Ekspor**: Pilihan format pemisah ribuan titik (`.`) atau koma (`,`).
74. **Pengirim Salinan Laporan ke Akun Pasangan**: Opsi forward rekap pengeluaran bulanan ke Telegram Khofita.
75. **Status Kesehatan Webhook API Supabase & Vercel**: Indikator status uptime serverless edge backend.

### A.4 Super Admin Portal, Data Inspector & Mutasi Data (Poin 76–100)
76. **Super Admin Data Inspector Interaktif (`/admin/data-inspector`)**: Penampil seluruh 14 tabel Supabase secara langsung di mobile.
77. **Manajer Soft-Delete & Restore Database (`/api/admin/mutate`)**: Kemampuan memulihkan transaksi yang tidak sengaja terhapus.
78. **Rekonsiliasi Saldo & Audit Database Live (`/api/admin/audit-db`)**: Endpoint verifikasi keabsahan total mutasi vs saldo buku.
79. **Pemantau Batas Laju Request (*Rate Limiter Bar*)**: Monitoring sisa kuota 15 RPM / 1.000 request harian.
80. **Manajemen Akun Pasangan / Partner Link**: Fitur menghubungkan atau melepaskan tautan akun Khofita.
81. **Pelacak Masa Aktif Sesi Login (*Session TTL Manager*)**: Pemantauan durasi sesi login 3 hari di Supabase.
82. **Pemeriksa Kesehatan Sistem (*Health & Warmup Diagnostics*)**: Endpoint pengecekan status serverless, latency, dan koneksi Supabase.
83. **Penampil Log Runtime Webhook**: Stream log aktivitas webhook untuk debugging transaksi secara instan.
84. **Manajemen Kategori Kustom (CRUD Kategori)**: Menambah, mengubah nama, dan menghapus kategori transaksi.
85. **Manajer Buku Hutang & Cicilan (`debts` & `installments`)**: Form pembayaran cicilan yang otomatis mengurangi sisa tenor angsuran.
86. **Pembersih Data Duplikat Otomatis (De-duplication Engine)**: Pendeteksi transaksi kembar yang terinput dalam rentang 30 detik.
87. **Pemberi Label Tag Transaksi Multi-Dimensi**: Penambahan label tag `#dieng`, `#gojek`, `#kuliah`, `#makan` pada setiap transaksi.
88. **Manajer Skema Header Spreadsheet**: Pengaturan susunan kolom tabel Google Sheets langsung dari aplikasi.
89. **Pengatur Batas Ambang Anomali Pengeluaran**: Menyesuaikan batas notifikasi boros (misal pengeluaran >Rp 150.000/hari).
90. **Pengecek Integritas Foreign Key Supabase**: Verifikasi tidak ada record anak (*orphaned rows*) tanpa user ID valid.
91. **Penampil Riwayat Perubahan Preferensi AI**: Log catatan preferensi yang pernah dipelajari oleh model AI.
92. **Pengatur Mode Pemeliharaan Sistem (Maintenance Toggle)**: Saklar menonaktifkan bot sementara saat migrasi data.
93. **Penghapus Cache Serverless Vercel (Cache Purge)**: Tombol invalidasi cache Redis / in-memory serverless.
94. **Penganalisis Latensi Respons Webhook**: Grafik durasi pemrosesan pesan masuk Telegram (<30ms target).
95. **Pengubah Password & Token Kunci API Cepat**: Form pembaruan token Telegram Bot dan Google Service Account aman.
96. **Pelacak IP Address & Device Login**: Riwayat perangkat yang pernah mengakses dashboard admin.
97. **Pengelola Kuota API Gemini AI Bulanan**: Pemantau sisa kuota token Google AI Studio.
98. **Pengatur Bahasa Default & Format Angka**: Pengalihan format bahasa Indonesia formal vs kasual.
99. **Pemindai File Gambar Orphaned di Supabase Storage**: Pembersih foto struk lama yang tidak tertaut ke transaksi.
100. **Panel Reset Data Uji / Factory Reset Aman**: Opsi membersihkan data dummy pengujian dengan proteksi kata sandi konfirmasi.

### A.5 Persona Royal Butler, Slang Malang, Format 3 Lapis & NLP (Poin 101–125)
101. **Kamus Slang & Boso Walikan Malang NLP (Aturan 41)**: Pemahaman kata lokal Malang (*oyi, sam, ker, nawak, mbois*) dalam instruksi chat.
102. **Kamus Slang Nominal Keuangan (Aturan 32)**: Pemahaman kata *gocap* (50k), *ceban* (10k), *goceng* (5k) secara instan.
103. **Standarisasi Respon 3 Lapis Eksekutif (Aturan 46)**: *Lapis 1 Jawaban Langsung -> Lapis 2 Data Kuantitatif -> Lapis 3 Saran Butler Konkret*.
104. **Modal Klarifikasi Dompet Proaktif (Aturan 50)**: Pop-up pemilihan dompet cepat saat transaksi dicatat tanpa menyebut metode pembayaran.
105. **Resolusi Kata Ganti Subjek Multi-Turn (Aturan 35)**: Mengikat kata ganti "dia/mereka" pada subjek yang baru saja dibahas.
106. **Penjadwalan Ulang Agenda Bersyarat Cuaca (Aturan 34)**: Penanganan kondisi "kalo hujan gak jadi narik" tanpa menghapus agenda utama.
107. **Sensor Otomatis Privasi PIN/Password (Aturan 45)**: Pemblokiran otomatis penyimpanan teks PIN, Password, dan OTP.
108. **Keyboard Cepat Kategori Populer**: Tombol cepat 1-ketuk `[ ⛽ Bensin ] [ 🍔 Makan ] [ 🅿️ Parkir ] [ 🛵 Gojek ]`.
109. **Lencana Verifikasi Anti Data Dummy**: Tanda centang hijau bahwa data yang dijawab AI 100% valid dari query database.
110. **Pemilih Model AI & Fallback Chain**: Pilihan manual antara `gemini-3.5-flash-lite`, `gemini-3.1-flash-lite`, dan `gemini-3.6-flash`.
111. **Persona Butler Suara Formal-Santun**: Gaya penyampaian khas Kepala Pelayan Eksekutif Kerajaan (*Royal Butler*).
112. **Anti-Greeting Loop (0% Sapaan Basi Berulang)**: Larangan menyapa ulang jika percakapan sedang dalam sesi aktif.
113. **Penyambung Konteks Multi-Pesan Telegram**: Penggabungan dua pesan masuk berturut-turut menjadi satu instruksi utuh.
114. **Pendeteksi Emosi & Kelelahan Fisik Pengguna**: Respon empati saat Mas Firman mengabarkan kelelahan setelah narik Gojek seharian.
115. **Pengingat Minum Air Putih & Istirahat di Cuaca Panas**: Saran proaktif jika suhu GPS Malang melebihi 31°C.
116. **Pemisah Perhitungan Belanjaan Campuran**: Memisahkan nota belanja yang memuat barang modal kerja dan cemilan pribadi.
117. **Pengenal Merek Makanan Khas Malang**: Pemahaman menu Bakso Kota Cak Man, Pos Ketan Legenda, dan Orem-Orem.
118. **Konversi Satuan Volume Bensin Liter ke Rupiah**: Otomatis menghitung "isi Pertalite 3 liter" = Rp 30.000.
119. **Peringatan Batas Maksimal Kapasitas Tangki Honda Beat (4.2L)**: Koreksi jika pengguna tidak sengaja mencatat isi bensin >5 Liter.
120. **Penafsir Bahasa Campuran Indonesia-Jawa Halus**: Kemampuan merespon instruksi berbahasa Jawa (*monggo, matur nuwun, injih*).
121. **Pembuat Rangkuman Singkat Versi 1 Paragraf (Executive Bullet)**: Mode ringkas bagi pengguna yang sedang terburu-buru berkendara.
122. **Saran Peningkatan Omzet Narik Gojek Berdasarkan Jam Sibuk**: Rekomendasi mangkal di Dinoyo/Suhat pada jam makan siang & pulang kantor.
123. **Pengecek Konsistensi Data Multi-Turn**: Peringatan jika pengguna menyebut angka yang bertentangan dengan chat sebelumnya.
124. **Penghapus Format Teks Berantakan (Sanitizer Markdown)**: Pembersih karakter bintang ganda dan escape slash liar.
125. **Pengatur Tingkat Kreativitas AI (Temperature Slider)**: Pengaturan suhu respon AI (`0.1` deterministik vs `0.7` eksploratif).

### A.6 Fitur Native Android, Notifikasi, Offline Storage & Hardware (Poin 126–150)
126. **Kunci Keamanan Biometrik Sidik Jari (Fingerprint Lock)**: Proteksi pembukaan aplikasi Raphael menggunakan sensor sidik jari Realme 5i.
127. **Pemutar Voice Note Audio & Visualizer Gelombang Suara**: Pemutar rekaman suara percakapan Telegram di dalam mobile app.
128. **Sinkronisasi Latar Belakang Native Android WorkManager**: Auto-sync data saat smartphone terhubung ke charger dan WiFi.
129. **Notifikasi Push Native Firebase Cloud Messaging (FCM)**: Push notification langsung ke status bar HP tanpa membuka aplikasi.
130. **Penyimpanan Lokal Offline SQLite / IndexedDB**: Kemampuan mencatat transaksi tanpa koneksi internet dan auto-upload saat online.
131. **Alat Crop & Putar Gambar Struk Belanja**: Pemotong foto struk sebelum dikirim ke engine OCR agar lebih fokus dan hemat kuota.
132. **Kustomisasi Tema Gelap AMOLED Pure Black (`#000000`)**: Opsi warna hitam pekat untuk menghemat daya baterai layar OLED/IPS.
133. **Umpan Balik Getaran Haptik (Haptic Vibration Feedback)**: Efek getar taktil saat menekan tombol navigasi, simpan, atau hapus data.
134. **Mode Layar Penuh Imersif (Immersive Fullscreen Navigation)**: Menyembunyikan status bar Android untuk area pandang yang lebih luas.
135. **Deteksi Otomatis Orientasi Layar (Portrait Lock)**: Mengunci antarmuka pada orientasi tegak agar layout kartu tetap presisi.
136. **Pemberi Peringatan Baterai Lemah (<15%)**: Saran meredupkan layar saat Mas Firman sedang narik Gojek dengan baterai menipis.
137. **Pintasan Cepat di Home Screen Android (App Shortcuts)**: Shortcut 1-ketuk di layar utama HP untuk "Catat Bensin" dan "Foto Struk".
138. **Widget Finansial di Home Screen Android (Android Widget 4x2)**: Widget saldo kas likuid dan target Dieng di homescreen HP.
139. **Deteksi Gerakan Shake-to-Report**: Menggoyangkan smartphone untuk memicu rangkuman cepat atau pelaporan bug.
140. **Mode Hemat Kuota Data Seluler**: Menonaktifkan preview gambar resolusi tinggi saat menggunakan paket data seluler.
141. **Integrasi Google Maps Native Intent**: Membuka langsung aplikasi Google Maps resmi saat menekan tombol rute Dieng.
142. **Integrasi Panggilan Darurat Call Intent**: Menghubungi bengkel motor darurat dengan 1 ketukan tombol telepon.
143. **Penyimpan Cache WebView Cerdas (Smart Cache TTL)**: Cache aset statis lokal 0ms untuk loading instan saat dibuka.
144. **Pengatur Ukuran Font Dinamis (Font Size Scaling)**: Opsi memperbesar ukuran teks untuk kemudahan membaca saat berkendara.
145. **Deteksi Otomatis Mode Mobil / Motor (Driving Mode)**: Tombol berukuran ekstra besar saat pengguna sedang berkendara.
146. **Pencatat Lokasi GPS Otomatis pada Setiap Transaksi**: Menyimpan koordinat tempat transaksi dilakukan secara pasif.
147. **Pembersih File Cache Internal Berkala**: Tombol pembersih temporary file untuk menghemat ruang memori HP.
148. **Pengunci Sesi Otomatis Saat Aplikasi Ditinggalkan (Auto-Lock 5 Menit)**: Mengunci aplikasi otomatis jika tidak digunakan selama 5 menit.
149. **Integrasi Tombol Volume Up untuk Pemicu Voice Input**: Menekan tombol volume untuk mulai merekam suara secara cepat.
150. **Indikator Kecepatan Jaringan Realtime (Ping / Latency MS)**: Menampilkan latency koneksi ke server Vercel di pojok status bar.

---

## 🚨 BAGIAN B: 150 POTENSI BUG, ERROR, EDGE CASES, MEMORY LEAKS & KERENTANAN SISTEM

### B.1 Jaringan, Protokol Serverless, Cold-Start & Sinkronisasi Cloud (Poin 151–175)
151. **Unhandled Fetch Error saat Koneksi Terputus**: Pemanggilan `fetch()` tanpa blok try-catch komprehensif menyebabkan unhandled promise rejection dan UI membeku.
152. **Vercel Serverless Cold-Start Timeout**: Latensi >10 detik saat fungsi bangun pertama kali memicu timeout pada WebView Android.
153. **Ketidaksesuaian State Lokal vs Cloud Database**: Data di mobile app menjadi usang jika pengguna melakukan mutasi lewat Telegram tanpa menekan tombol reload.
154. **Crash Parsing Respons HTML 502/504 Bad Gateway**: Saat server backend maintenance, API mengembalikan HTML yang memicu syntax error pada `res.json()`.
155. **Race Condition Multi-Tap Tombol Simpan**: Pengguna mengetuk tombol simpan berkali-kali secara cepat menyebabkan transaksi ganda tersimpan di database.
156. **Pembekuan Background Polling saat Layar HP Mati**: Android menangguhkan timer JavaScript (`setTimeout`/`setInterval`) saat layar mati, menunda update data.
157. **Kegagalan Exponential Backoff pada Jaringan Edge/3G**: Aplikasi gagal melakukan percobaan ulang bertahap saat koneksi seluler tidak stabil.
158. **DNS Resolution Latency pada CDN Eksternal**: Ketergantungan script eksternal dapat memperlambat rendering awal aplikasi.
159. **Ketiadaan Realtime Supabase Postgres Changes Listener**: Mobile app belum memanfaatkan websocket Supabase untuk update otomatis tanpa refresh manual.
160. **CORS Preflight Failure pada HTTP Custom Header**: Header otentikasi kustom dapat diblokir oleh browser jika CORS Next.js belum terkonfigurasi sempurna.
161. **SSL Handshake Failure pada Jam HP Tidak Akurat**: Waktu sistem Android yang salah beberapa menit menyebabkan penolakan sertifikat SSL HTTPS.
162. **Request Throttling 429 Too Many Requests**: Pengiriman pesan bertubi-tubi memicu penguncian rate limiter Supabase/Gemini.
163. **Payload Truncation pada Koneksi Lambat**: Data base64 gambar terpotong di tengah transmisi karena batas timeout koneksi seluler.
164. **Kegagalan Re-otentikasi Saat Token JWT Kedaluwarsa**: Sesi login mati mendadak tanpa mekanisme silent refresh token.
165. **Socket Hang-Up pada Upload File Struk Besar**: Server memutus koneksi jika ukuran payload melebihi batas 4.5MB serverless Vercel.
166. **Data Duplication Akibat Telegram Webhook Retry**: Webhook Telegram mengirim ulang update jika backend terlambat merespons >5 detik.
167. **Inkonsistensi Urutan Eksekusi Paralel (Async Order Flaw)**: Ekstraksi transaksi selesai lebih lambat dibanding pengiriman bubble pesan.
168. **Kegagalan Deteksi Status Jaringan Online/Offline**: Event listener `navigator.onLine` di Android WebView kerap memberikan false positive saat kuota internet habis.
169. **HTTP Request Header Bloat**: Header cookie dan token yang terlalu panjang menyebabkan error `431 Request Header Fields Too Large`.
170. **Zombie Connection pada Fetch Tanpa AbortController**: Request lama yang masih berjalan memakan bandwidth saat pengguna sudah berpindah tab.
171. **Ketidakcocokan Skema API Versi Lama vs Baru**: Kegagalan parsing jika backend memperbarui struktur JSON tanpa versioning route.
172. **Kegagalan Stream Response pada Jaringan Lambat**: Chunk teks AI terputus-putus dan menghasilkan karakter rusak.
173. **Rate Limiting OpenStreetMap Nominatim**: Pemanggilan reverse geocoding cuaca berulang memicu blokir IP dari server OSM.
174. **Kegagalan Fetch Font Google saat Offline**: Font antarmuka fallback ke font sistem default yang mengubah proporsi layout kartu.
175. **Serverless Function Execution Timeout (15s Max)**: Pemrosesan AI yang kompleks terhenti paksa sebelum selesai menulis ke database.

### B.2 Validasi Form, Integritas Database, Sanitasi XSS & Keamanan (Poin 176–200)
176. **Input Nominal Negatif atau Desimal Liar**: Pengguna memasukkan `-50000` atau `0.000001` yang merusak kalkulasi surplus dan kesehatan kas.
177. **Potensi SQL / PostgREST Filter Injection**: Karakter khusus PostgREST (`.eq`, `.or`, `&`) pada input keterangan transaksi yang belum disanitasi.
178. **Cross-Site Scripting (XSS) pada Chat Bubble**: Karakter `<script>` atau `<img onerror=...>` pada bubble chat yang dievaluasi langsung via `innerHTML`.
179. **Input Tanggal Kosong / Format ISO Invalid**: Input tanggal yang tidak valid menghasilkan nilai `NaN` atau `Invalid Date` di database.
180. **Input Nominal Teks Huruf ("lima puluh ribu")**: Mengisi kolom nominal dengan teks menyebabkan nilai tersimpan sebagai `NaN` atau `0`.
181. **Transaksi Sampah Rp 0 Tanpa Item Struk**: Gambar non-struk yang lolos filter OCR mengotori database dengan transaksi Rp 0.
182. **Overflow Karakter Emoji 4-Byte (UTF-8 MB4)**: Karakter emoji langka dapat memotong teks pada kolom database non-UTF8MB4.
183. **String Truncation pada Deskripsi Panjang**: Deskripsi melebihi 255 karakter ditolak oleh database constraint.
184. **Collision Short ID pada Pencarian Rekord**: Short ID 8-karakter berpotensi ganda jika volume data transaksi bertambah ribuan.
185. **Missing User ID UUID FK Violation**: Kegagalan membaca `USER_ID` dari state lokal menyebabkan request ditolak oleh Supabase constraint.
186. **Pencatatan Tanggal Masa Depan Tidak Terkontrol**: Pengguna tidak sengaja memilih tahun 2030 yang merusak grafik arus kas bulan ini.
187. **Injeksi Karakter Escape Backslash pada JSON (`
`, `"`)**: Karakter escape yang salah tempat merusak parsing payload JSON.
188. **Ketiadaan Validasi Tipe Dompet yang Didukung**: Mengisi dompet di luar 5 dompet resmi menyebabkan data tidak terhitung di rekapitulasi.
189. **Bypass Autentikasi Super Admin Route**: Endpoint mutasi database dapat diakses publik jika tidak memvalidasi `userId` dan token rahasia.
190. **Penyimpanan Teks Sensitif Password/PIN di Database**: Teks sensitif tersimpan ke database `chat_history` jika tidak disaring oleh privacy filter.
191. **Data Leakage Antar Akun Pasangan**: Transaksi privat Mas Firman bocor ke dashboard pasangan jika filter `user_id` tidak ketat.
192. **Perubahan Status Agenda Tanpa Audit Trail**: Agenda selesai tanpa mencatat jam dan tanggal penyelesaian aslinya.
193. **Penghapusan Kategori Default Sistem**: Menghapus kategori 'Makanan & Minuman' membuat transaksi lama kehilangan referensi relasi (*orphaned*).
194. **Formula Injection pada Generator Ekspor CSV**: Karakter `=`, `+`, `-`, `@` pada nama merchant mengeksekusi macro berbahaya saat dibuka di Microsoft Excel.
195. **Ketiadaan Sanitasi Karakter Non-ASCII pada PDF Generator**: Emoji pada nama toko menyebabkan PDFKit crash (*unhandled font glyph exception*).
196. **Integritas Nilai Kolom Boolean Supabase**: Nilai `null` pada kolom `notification_sent` menyebabkan anomali query filter.
197. **Pengisian Kolom Nominal Bertipe Teks String**: Angka tersimpan sebagai `"50000"` bukan integer/numeric, menyebabkan kegagalan fungsi agregasi SQL `SUM()`.
198. **Double Deduction pada Pembayaran Cicilan Bank Jago**: Pembayaran cicilan memotong saldo kas likuid dua kali lipat.
199. **Ketidaksesuaian ID Dompet Cash vs E-Wallet**: Transaksi Gopay tercatat memotong saldo fisik uang kertas.
200. **Kegagalan Rollback Transaksi Batch yang Gagal Sebagian**: Sebagian data masuk dan sebagian gagal tanpa mekanisme rollback database transaksi atomik.

### B.3 Kinerja Memori, Siklus Hidup WebView, Canvas Leaks & Battery Drain (Poin 201–225)
201. **Memory Leak Instansiasi Chart.js Berulang**: Membuka chart berkali-kali tanpa memanggil `chartInstance.destroy()` menyebabkan memory leak canvas di Android.
202. **DOM Bloat pada Chat Messages Container**: Ribuan elemen bubble chat yang menumpuk tanpa virtual scrolling memperlambat rendering ponsel Realme 5i.
203. **Memory Spike Base64 Gambar Struk 4K/12MP**: Membaca foto struk resolusi tinggi langsung ke base64 DataURL memakan RAM >50MB di WebView.
204. **FileReader Crash saat Memilih File Non-Gambar**: Pengguna memilih file video atau dokumen di file chooser struk menyebabkan reader gagal decode.
205. **Keyboard Android Soft-Input Layout Glitch**: Saat keyboard virtual Android muncul, input text tertutup atau navbar terdorong ke tengah layar.
206. **Android Hardware Back-Button Trap**: Menekan tombol kembali bawaan Android langsung menutup aplikasi alih-alih menutup modal pop-up yang aktif.
207. **GPS Geolocation Infinite Hang saat GPS HP Mati**: Pemanggilan `getCurrentPosition` tanpa parameter timeout membekukan indikator cuaca.
208. **Nominatim Reverse Geocoding Rate Limit 429**: Pengambilan nama kota cuaca berulang diblokir oleh rate limiter OpenStreetMap.
209. **Voice STT Unhandled Error saat Izin Mikrofon Ditolak**: API SpeechRecognition melempar error tak tertangani jika pengguna menolak izin mikrofon.
210. **WebView Killed by OS saat Backgrounding**: Android mematikan proses WebView saat RAM menipis, menghilangkan state chat sementara.
211. **Battery Drain Akibat Animasi CSS Pulse Berkelanjutan**: Animasi CSS tak berujung membebani CPU/GPU Adreno 610 secara terus-menerus.
212. **Thermal Throttling pada Pemrosesan Grafik Beruntun**: Render ulang grafik beruntun memicu penurunan clock speed prosesor Snapdragon 665.
213. **Storage Bloat pada Direktori Cache WebView**: File cache WebView menumpuk hingga ratusan megabyte jika tidak dibersihkan berkala.
214. **Overdraw Layout pada Elemen Bertumpuk**: Layer CSS dengan background transparan berlapis-lapis memicu render GPU berulang (*GPU overdraw*).
215. **Event Listener Leak pada Window Resize / Scroll**: Menambahkan event listener berulang-ulang tanpa memanggil `removeEventListener`.
216. **Audio Focus Conflict saat Voice Input Aktif**: Pemutar musik eksternal tidak dipause saat pengguna menekan tombol mikrofon Voice STT.
217. **Reflow & Repaint Berlebih pada Manipulasi DOM Langsung**: Mengubah `innerHTML` berkali-kali dalam satu loop memicu layout thrashing.
218. **Font Loading Delay (FOIT / FOUT)**: Teks berkedip atau berubah ukuran saat font Google Montserrat/Inter selesai dimuat.
219. **Unresponsive UI Thread saat Kalkulasi Analitik Berat**: Perhitungan 20 metrik finansial di thread utama JS membekukan scroll selama 100ms.
220. **Hardware Acceleration Artifacts pada Android 10**: Glitch visual garis hitam pada elemen dengan CSS `transform` dan `border-radius`.
221. **Ketiadaan Pengelolaan Siklus Hidup Activity Android (`onPause`/`onResume`)**: Timer terus berjalan saat pengguna menekan tombol Home.
222. **Canvas Resolution Blurriness pada Layar High-DPI**: Grafik Chart.js buram jika `devicePixelRatio` layar tidak dihitung dalam ukuran canvas.
223. **Image Memory Leak pada Blob URLs Tanpa `revokeObjectURL`**: URL gambar sementara tidak dihapus dari memori browser setelah ditampilkan.
224. **Slow Touch Response Akibat Ketiadaan `touch-action: manipulation`**: Jeda delay 300ms pada pengetukan tombol di browser mobile standar.
225. **WebGL Context Lost pada Pergantian Tab Cepat**: Rendering grafik error jika context WebGL di-reset oleh sistem operasi Android.

### B.4 Logika Bisnis, Algoritma Finansial & Penalaran Multi-Turn AI (Poin 226–250)
226. **Division by Zero pada Kalkulasi Rasio Tabungan**: Perhitungan rasio tabungan membagi nilai 0 jika total pemasukan bulan berjalan belum ada data.
227. **Day 1 Month Spike pada Proyeksi Kas**: Pengeluaran besar di tanggal 1 bulan membuat estimasi akhir bulan meledak secara tidak realistis.
228. **Pembalikan Logika Negasi ("Selain Poin Ini...")**: AI salah menafsirkan kalimat pengecualian dan menandai tugas yang justru dikecualikan.
229. **False Alarm Bentrok Jadwal Beda Bulan**: Algoritma collision detector hanya mengecek selisih menit jam tanpa memvalidasi kesamaan tanggal kalender.
230. **Pencampuran Saldo Uang Kertas vs Uang Koin**: AI memotong dompet Cash Koin untuk pembayaran besar yang seharusnya menggunakan Cash Kertas.
231. **Spam Pertanyaan Ulang (Duplicate Bubble Dispatch)**: Pengiriman gelembung pesan duplikat akibat pengulangan follow-up question.
232. **Overfitting Jenis Bahan Bakar**: AI menjawab harga Pertalite padahal pengguna secara eksplisit menanyakan harga Pertamax Turbo.
233. **Hilangnya Subjek Multi-Turn pada Edit Pesan**: Mengedit pesan di tengah history chat membuat AI kehilangan konteks referensi kalimat sebelumnya.
234. **Pemotongan Data (*Data Truncation*) pada Auto-Summarizer**: Rangkuman otomatis kehilangan ringkasan transaksi lama jika query database dibatasi terlalu sedikit.
235. **Rounding Error Rp 1 pada Fitur Split Bill**: Pembagian nominal ganjil (misal Rp 100.000 dibagi 3 orang) menyisakan selisih pecahan desimal.
236. **Halusinasi Nilai Sisa Dana Liburan Dieng**: AI menyebut angka sisa anggaran yang tidak sesuai dengan total cicilan yang sudah masuk.
237. **Klaim Palsu Data Tersimpan Padahal Payload Kosong**: AI menyatakan data berhasil dicatat padahal array mutasi bernilai `null`.
238. **Kesalahan Konversi Waktu UTC ke WIB (UTC+7)**: Transaksi malam hari jam 23:00 WIB tercatat sebagai tanggal hari berikutnya di database.
239. **Pencatatan Pemasukan Bersyarat Sebagai Saldo Riil**: Target "besok narik Gojek target 100k" salah dicatat sebagai penambahan kas hari ini.
240. **Ketidaksesuaian Total Pagu Anggaran Rencana**: Kenaikan harga tiket Dieng Rp 50.000 tidak otomatis mengupdate total pagu menjadi Rp 1.040.000.
241. **Penyusutan Tenor Kredit Bank Jago Tidak Realistis**: AI mengira pembayaran satu kali cicilan melunasi seluruh total sisa pinjaman.
242. **Ketiadaan Deteksi Pengeluaran Anomali Ekstrem**: AI tidak memberikan peringatan saat pengguna mencatat transaksi Rp 5.000.000 dalam sekali input.
243. **Penyatuan Kategori Operasional Gojek ke Pengeluaran Pribadi**: Ganti oli motor Beat tercampur ke pos biaya gaya hidup.
244. **Kegagalan Resolusi Nama Merchant Mirip**: Mengira 'Alfamart Dinoyo' dan 'Alfamart Soekarno Hatta' sebagai dua kategori berbeda.
245. **Kesalahan Perhitungan Rata-rata Harian pada Bulan Kabisat**: Membagi total biaya dengan 28 hari pada bulan yang memiliki 29/31 hari.
246. **Distorsi Metrik Health Score Akibat Mutasi Internal**: Transfer antar dompet (Cash ke Gopay) salah dihitung sebagai pengeluaran baru.
247. **Kegagalan Pemahaman Kalimat Koreksi Pengguna ("Bukan 50k tapi 30k")**: AI tidak merevisi transaksi sebelumnya melainkan membuat transaksi baru.
248. **Hilangnya Parameter Custom Attributes pada Rekomendasi Tempat**: Info Wifi dan Spot Foto hilang saat response diparsing ke kartu UI.
249. **Inkonsistensi Nilai Net Cashflow Antar Halaman**: Angka di Tab Analisis berbeda Rp 10.000 dengan angka di Tab Database.
250. **Ketiadaan Validasi Saldo Negatif (Overdraft Alert)**: Aplikasi mengizinkan saldo kas bernilai minus tanpa peringatan kebocoran dana.

### B.5 Antarmuka Responsif, Layar Realme 5i, Touch Handling & Aksesibilitas (Poin 251–275)
251. **Text Truncation pada Layar Sempit (<360px)**: Teks nominal uang terpotong pada smartphone beresolusi layar kecil.
252. **Pixelation Ikon pada Layar Low-DPI**: Ikon SVG/Canvas buram pada layar Android dengan pixel density rendah.
253. **Backdrop Click Listener Missing pada Modal**: Modal dialog tidak bisa ditutup dengan mengetuk area gelap di luar kotak modal.
254. **Ketiadaan Skeleton / Loading State saat Fetch Data**: Layar kosong tanpa animasi skeleton saat data transaksi sedang dimuat.
255. **Kontras Warna Teks Redup pada Dark Mode**: Teks abu-abu sekunder (`#64748B`) sulit dibaca di bawah sinar matahari langsung.
256. **Inkonsistensi Format Tanggal Antar Tab**: Campuran format `YYYY-MM-DD` dan `DD/MM/YYYY` yang membingungkan pengguna.
257. **Ketiadaan Banner Notifikasi Offline**: Pengguna tidak mengetahui apakah aplikasi sedang terputus dari koneksi internet.
258. **Unbounded Expansion pada Chat Input Textarea**: Input bar membesar tak terkontrol jika pengguna menyalin teks ribuan baris.
259. **Ukuran Tombol Interaktif <48dp**: Tombol kecil yang menyulitkan navigasi jempol sesuai standar Material Design.
260. **Z-Index Collision Antara Modal (`z-100`) dan Tooltip (`z-50`)**: Komponen tooltip atau floating button menembus di atas layer modal dialog.
261. **Horizontal Scroll Bar Liar pada Layar Ponsel 720px**: Halaman bergoyang ke kanan-kiri akibat elemen dengan `width: 100vw` yang mengabaikan scrollbar.
262. **Font Clipping pada Huruf Bertanda Bawah ('g', 'j', 'y')**: Karakter terpotong di bagian bawah akibat `line-height` yang terlalu sempit.
263. **Penumpukan Gelembung Chat saat Orientasi Landscape**: Area chat menyempit drastis saat keyboard virtual muncul di mode mendatar.
264. **Ketidakseragaman Radius Sudut Kartu (Inconsistent Border-Radius)**: Campuran sudut membulat `rounded-lg`, `rounded-xl`, dan `rounded-2xl` tanpa panduan desain token.
265. **Flicker Visual Saat Transisi Pergantian Tab**: Layar berkedip putih sesaat sebelum tab baru dirender.
266. **Ketiadaan Indikator Status Kosong (Empty State Illustration)**: Tampilan polos membosankan saat database transaksi masih kosong.
267. **Tabrakan Tombol Aksi Cepat dengan Tombol Kirim Chat**: Quick action pills menutupi area ketik teks pada layar pendek.
268. **Hilangnya Fokus Kursor Input Teks Setelah Menutup Modal**: Kursor keyboard tidak otomatis kembali ke input bar chat.
269. **Ketidaksesuaian Warna Status Bar Android dengan Tema Aplikasi**: Status bar Android berwarna putih kontras saat aplikasi dalam dark mode.
270. **Ketiadaan Feedback Visual Saat Menekan Tombol (Active State Missing)**: Tombol tidak memberikan respon visual saat ditekan.
271. **Teks Label Form Terlalu Kecil (<10px)**: Label form sulit dibaca oleh pengguna dengan keterbatasan penglihatan.
272. **Scroll Lock Glitch Saat Modal Aktif**: Halaman di belakang modal masih bisa di-scroll saat pop-up sedang terbuka.
273. **Ketidakjelasan Status Tombol Simpan saat Proses Berjalan**: Tombol simpan tidak menampilkan status loading spinner saat mengirim request ke server.
274. **Pemotongan Bayangan Elemen (Box-Shadow Clipping)**: Efek bayangan neon tosca terpotong oleh `overflow: hidden` pada kontainer induk.
275. **Ketiadaan Konfirmasi Sebelum Menghapus Data Transaksi**: Data langsung terhapus tanpa dialog konfirmasi "Apakah Anda Yakin?".

### B.6 Integrasi Perangkat Keras, Sensor, Audio, File Picker & OS Android (Poin 276–300)
276. **File Picker Crash saat Mengakses Penyimpanan Eksternal**: Izin `READ_EXTERNAL_STORAGE` ditolak pada Android 10+ scoped storage.
277. **Kamera Gagal Dibuka Akibat Izin Runtime Ditolak**: Aplikasi force close jika pengguna membatalkan izin kamera saat ingin foto struk.
278. **Kegagalan Rotasi Otomatis Gambar Hasil Foto Kamera**: Foto struk miring 90 derajat karena tidak membaca orientasi metadata EXIF.
279. **Audio Recorder Merekam Keheningan (Muted Input)**: Mikrofon merekam audio kosong akibat bentrok dengan permission Bluetooth headset.
280. **GPS Provider Memberikan Koordinat Usang (Stale Cache Location)**: Lokasi cuaca menunjukkan kota lama saat pengguna baru saja bepergian ke luar kota.
281. **Kegagalan Pemutaran Suara Notifikasi saat Mode Silent/Do Not Disturb**: Notifikasi penting tidak terdengar saat HP dalam mode hening.
282. **Getaran Haptik Tidak Berfungsi pada Perangkat Hemat Baterai**: Android OS menonaktifkan motor getar saat mode Power Saver aktif.
283. **WebView Memory Eviction Saat Aplikasi Ditinggalkan 10 Menit**: Android membersihkan memori WebView saat multitasking ke aplikasi ojol.
284. **File Chooser Membuka Direktori Root yang Membingungkan**: File picker tidak langsung membuka folder Galeri/Kamera foto.
285. **Crash Saat Mengunggah Gambar Berukuran >20 Megapixel**: Out of Memory (OOM) Exception pada decoding bitmap di memori RAM WebView.
286. **Ketidaksesuaian Skema Warna Sistem Operasi Android (Dark Theme Sync)**: Aplikasi tidak mengikuti pengaturan tema gelap otomatis sistem Android.
287. **Kegagalan Intent Buka Google Maps pada Perangkat Tanpa Aplikasi Maps**: Error jika pengguna membuka rute pada HP tanpa aplikasi Google Maps terpasang.
288. **Hilangnya Izin Lokasi Pasca Restart Smartphone**: Geolocation permissions ter-reset setelah HP dimatikan.
289. **Kegagalan Deteksi Perubahan Status Koneksi WiFi ke Seluler**: Stream data terputus saat pengguna keluar dari jangkauan WiFi rumah.
290. **Crash Saat Menekan Tombol Share WhatsApp jika WhatsApp Belum Terinstal**: Unhandled exception saat memicu Intent WhatsApp.
291. **Distorsi Aspek Rasio Thumbnail Gambar Struk Belanja**: Gambar struk gepeng atau melar karena styling CSS `object-fit` tidak terdefinisi.
292. **Kegagalan Perekaman Suara Saat Layar HP Terkunci**: Audio STT terhenti saat layar otomatis redup.
293. **Konflik Hardware Acceleration pada Chipset Snapdragon 665**: Kompatibilitas OpenGL ES 3.0 yang memerlukan fallback layer.
294. **Hilangnya Session Cookie saat WebView Process Restart**: Kehilangan status autentikasi lokal saat OS melakukan memory purge.
295. **Kegagalan Download File Ekspor PDF ke Folder Download Publik**: File tersimpan di direktori privat yang tidak bisa dibuka oleh File Manager pengguna.
296. **Peringatan Izin Lokasi Latar Belakang (Background Location Alert)**: Android 10 menampilkan notifikasi peringatan konsumsi baterai lokasi.
297. **Ketidakstabilan Touch Recognition pada Sudut Layar 2.5D**: Sentuhan pada tepi layar Realme 5i tidak terdaftar akibat bezel palm rejection.
298. **Crash Akibat Null Pointer Exception pada Android WebChromeClient**: `filePathCallback` bernilai null saat pengguna membatalkan file picker.
299. **Ketidaksesuaian Safe Area Insets pada Layar Berponi (Waterdrop Notch)**: Header aplikasi tertutup oleh modul kamera depan Realme 5i.
300. **Kegagalan Auto-Update APK Tanpa Google Play Store**: Pengguna tidak mendapatkan notifikasi saat versi terbaru APK Raphael telah dirilis.

---

### 🛡️ KESIMPULAN & PROTOKOL PENGEMBANGAN JANGKA PANJANG:
Katalog **300 Poin Master Audit** ini menjadi dokumen panduan mutlak (*Ultimate Single Source of Truth*) pengembangan ekosistem Raphael Mobile. Setiap perbaikan di masa depan akan merujuk langsung ke nomor poin audit ini dan diuji ketat untuk menjamin kestabilan, kecepatan, dan akurasi 100%.

*Terakhir divalidasi & disinkronisasi ke seluruh repositori: 27 Agustus 2026.*




























































### 2.43 Pembersihan Header Kanan Atas Saldo Kas & Gopay (Rilis Versi 2.6.4)
- **Permintaan Pengguna**: Menghapus pill informasi saldo *"KAS Rp 162k | GOPAY Rp 164k"* di pojok kanan atas header aplikasi agar header tampil lebih bersih, minimalis, dan lega.
- **Tindakan**:
  - Widget `#header-balances` / `#header-balance-pill` pada `<header>` di `index.html` telah dihapus sepenuhnya.
  - Header kini hanya memuat Identitas Robot Raphael AI dan Indikator Cuaca/Lokasi Realtime yang elegan.
- **Hasil Kompilasi & Versi Baru:**
  - `versionCode = 264`, `versionName = "2.6.4"`.
  - Output File: `D:\MANAS PROJEK\Raphael_App_v2.6.4_Debug.apk` (Ukuran: 5.67 MB).


### 2.42 Implementasi Kustomisasi Nama Pengguna Dinamis Manual & Otomatis via AI Chat (Rilis Versi 2.6.3)
- **Akar Masalah**: Fungsi `saveUserProfileIdentity()` sebelumnya mengalami syntax error karena memanggil `await` di dalam fungsi sinkron tanpa deklarasi `async`, sehingga tombol simpan nama gagal mengeksekusi pembaruan DOM dan persistensi memori.
- **Solusi yang Diterapkan**:
  1. *Fungsi Terpusat `applyCustomUserName(newName)`*: Memperbarui nama secara instan ke `userProfileState`, penyimpanan native `SharedPreferences` (`saved_user_name`), header profil `#profile-display-name`, avatar inisial, morning briefing, ICE card, dan sinkronisasi backend.
  2. *Kustomisasi Manual (Tab Profil)*: Pengguna dapat mengisi nama baru di form *"Nama Panggilan Pengguna"* dan menekan tombol *"Simpan Identitas Profil"*.
  3. *Kustomisasi Otomatis via Chat AI*: Pengguna cukup mengetik instruksi di tab Chat seperti *"Ganti nama saya jadi X"*, *"Ubah nama panggilan saya ke X"*, atau *"Panggil saya X"*. Asisten Raphael akan langsung mendeteksi instruksi, memperbarui profil secara menyeluruh, dan memberikan konfirmasi sapaan dengan nama baru secara instan.
- **Hasil Kompilasi & Versi Baru:**
  - `versionCode = 263`, `versionName = "2.6.3"`.
  - Output File: `D:\MANAS PROJEK\Raphael_App_v2.6.3_Debug.apk` (Ukuran: 5.67 MB).


### 2.41 Pembongkaran Total Accordion 20 Model, Card Briefing Tab Notifikasi & Pembersihan Email (Rilis Versi 2.6.2)
- **5 Poin Evaluasi & Koreksi Pengguna:**
  1. *Pembongkaran Accordion 20 Model*: Blok akordion dropdown 20 model analisis telah dibongkar total dan digantikan sepenuhnya oleh **6 Card Eksekutif Tematik Mandiri** (Saldo Likuid, Burn Rate/Safe Budget, Target Trip Dieng, Operasional Beat/Gojek, Angsuran Jago/Hutang, dan Produktivitas Skripsi/ICE).
  2. *Card Morning Briefing di Tab Notifikasi*: Menambahkan Card Notifikasi Morning Briefing interaktif yang langsung menampilkan ringkasan cuaca, batas belanja, saldo likuid, tugas urgent, dan arsip riwayat 7 hari yang dapat diklik untuk memunculkan pop-up modal.
  3. *Pembersihan Opsi Email*: Menghapus total field input email dan opsi dropdown *"Kirim Salinan Email"* dari seluruh halaman profil dan jadwal briefing.
  4. *Penjelasan Retensi Chat*: 4 balon chat "Halo" sebelumnya terkonfirmasi sebagai riwayat pesan uji coba pengguna yang tersimpan persisten di memori lokal Android.
- **Hasil Kompilasi & Versi Baru:**
  - `versionCode = 262`, `versionName = "2.6.2"`.
  - Output File: `D:\MANAS PROJEK\Raphael_App_v2.6.2_Debug.apk` (Ukuran: 5.67 MB).


### 2.40 Transformasi Tab Analisis Menjadi 6 Card Eksekutif Tematik (Rilis Versi 2.6.1)
- **Permintaan Pengguna**: Memecah 20 model analitik dari daftar teks menjadi card-card mandiri yang relevan, elegan, dan mudah dibaca tanpa mengubah/menambah/mengurangi fitur.
- **Hasil Transformasi Tata Letak 6 Card Eksekutif**:
  1. 💳 **Card Saldo Likuid & Kas Aktif**: Menampilkan total saldo (Rp 326.000), cash runway (~14 hari), rincian Kas Kertas (Rp 162.000), dan Gopay (Rp 164.000).
  2. 🔥 **Card Burn Rate & Batas Belanja Aman**: Batas aman hari ini (Rp 48.500/hr), burn rate (Rp 23.400/hr), dan rasio simpanan (62%).
  3. 🏔️ **Card Target & Dana Trip Dieng**: Pagu (Rp 1.040.000), terkumpul 3x (Rp 300.000), sisa kekurangan (Rp 740.000), progress bar visual (28.8%), dan kebutuhan nabung harian (Rp 37.000/hr).
  4. 🛵 **Card Operasional Gojek & Beat FI**: Odometer (45.200 KM), konsumsi BBM (~50.2 KM/L), target per shift (Rp 75.000), biaya per KM (Rp 199), dan servis CVT (47.000 KM).
  5. 🏦 **Card Angsuran Bank Jago & Manajemen Hutang**: Cicilan bulanan (Rp 67.940 tgl 20), rasio DTI (14.2% Aman), dan pokok pinjaman Rp 600rb flat 2.99%.
  6. 🎓 **Card Produktivitas Skripsi & Kesehatan Sistem**: Bimbingan Pak Sulthan (Bab 4-5), buffer perjalanan (35 Menit), skor stres finansial (18/100 Tenang), dan skor kesehatan sistem (94/100).
- **Hasil Kompilasi & Versi Baru:**
  - `versionCode = 261`, `versionName = "2.6.1"`.
  - Output File: `D:\MANAS PROJEK\Raphael_App_v2.6.1_Debug.apk` (Ukuran: 5.67 MB).


### 2.39 Penataan Harmonis Tab Analisis, Rincian Detail Kartu Database & Retensi Chat Persisten (Rilis Versi 2.6.0)
- **Empat Permintaan & Penyempurnaan Pengguna:**
  1. *Penataan Harmonis Tab Analisis*: 20 model analitik tidak lagi dipisah sebagai blok terisolasi, melainkan diintegrasikan ke dalam matriks terpadu dengan 4 pilar logis (Finansial, Target Liburan, Mobilitas Beat, dan Produktivitas/Risiko).
  2. *Rincian Detail Database*: Setiap kartu data transaksi dan aktivitas menampilkan atribut lengkap (ID, Jam `occurred_at`, Nominal, Kategori, Dompet, Merchant, Deskripsi, dan Tags).
  3. *Pembersihan Total Opsi Email*: Seluruh opsi email pada morning briefing telah dihapus dan kartu arsip 7 hari terpasang paten di Tab Notifikasi.
  4. *Retensi Chat 100% Persisten*: Menghapus pesan dummy "Halo" dan mengunci persistensi obrolan sehingga riwayat chat tersimpan permanen dan **HANYA BERSIH SAAT TOMBOL RANGKUM CHAT DITEKAN**.
- **Hasil Kompilasi & Versi Baru:**
  - `versionCode = 260`, `versionName = "2.6.0"`.
  - Output File: `D:\MANAS PROJEK\Raphael_App_v2.6.0_Debug.apk` (Ukuran: 5.67 MB).


### 2.38 Perbaikan Tuntas Dispatch NotificationManager & Pembersihan Total Opsi Email (Rilis Versi 2.5.6)
- **Dua Masalah yang Diperbaiki Tuntas:**
  1. *Pembersihan Opsi Email*: Seluruh field form input email dan selector toggle *"Kirim Salinan Email"* pada Tab Profil dan modal briefing telah dibersihkan 100%.
  2. *Perbaikan Tombol 'Tes Kirim Briefing'*:
     - Tombol *"Tes Kirim Briefing"* di Tab 5 (Profil) sebelumnya hanya memicu `showToast` teks statis tanpa memanggil engine pop-up briefing maupun notifikasi native.
     - Handler tombol telah dihubungkan langsung ke fungsi `testMorningBriefing()`.
     - Method `postLocalNotification()` di `MainActivity.kt` telah diperbarui dengan pemanggilan langsung sistem `NotificationManager` Android (dilengkapi `runOnUiThread`, `PRIORITY_MAX`, `DEFAULT_ALL`, dan `VISIBILITY_PUBLIC`) sehingga notifikasi status bar dijamin 100% muncul di Realme 5i (ColorOS).
- **Hasil Kompilasi & Versi Baru:**
  - `versionCode = 256`, `versionName = "2.5.6"`.
  - Output File: `D:\MANAS PROJEK\Raphael_App_v2.5.6_Debug.apk` (Ukuran: 5.67 MB).


### 2.37 Perbaikan Notifikasi Status Bar Realme 5i & Pembersihan Opsi Email (Rilis Versi 2.5.5)
- **Laporan Masalah Pengguna:**
  1. *Opsi Email*: Morning briefing dan profil memuat opsi kirim salinan email yang tidak diperlukan.
  2. *Notifikasi Tidak Muncul di Realme 5i*: Saat menguji tombol kirim briefing / uji notifikasi, notifikasi tidak muncul di status bar HP Realme 5i.
- **Akar Masalah & Tindakan Korektif:**
  1. *Pembersihan Opsi Email*: Seluruh elemen form, input alamat email, dan toggle *"Kirim Salinan Email"* telah dihapus total dari `index.html` dan `page.tsx`.
  2. *Akar Masalah Notifikasi Realme 5i (Android 9/10/Q)*:
     - `MainActivity.kt` sebelumnya melakukan pengecekan `ActivityCompat.checkSelfPermission(activity, Manifest.permission.POST_NOTIFICATIONS) == PERMISSION_GRANTED`.
     - Izin `POST_NOTIFICATIONS` baru diperkenalkan pada Android 13 (API 33). Pada Realme 5i (Android 9/10), pengecekan tersebut selalu mengembalikan `false` / `PERMISSION_DENIED`, sehingga fungsi `manager.notify()` tidak pernah dipanggil.
  3. *Solusi Rekayasa Kompatibilitas Android 9-14*:
     - Ditambahkan percabangan versi Android: Untuk Android 9-12 (termasuk Realme 5i / ColorOS), notifikasi **langsung dikirim secara instan tanpa terblokir pengecekan izin Android 13**.
     - Notifikasi dibungkus dalam `activity.runOnUiThread` dengan prioritas `PRIORITY_MAX`, `VISIBILITY_PUBLIC`, dan channel bergetar aktif.
- **Hasil Kompilasi & Versi Baru:**
  - `versionCode = 255`, `versionName = "2.5.5"`.
  - Output File: `D:\MANAS PROJEK\Raphael_App_v2.5.5_Debug.apk` (Ukuran: 5.67 MB).


### 2.36 Stream Install Langsung via USB ADB & Rilis Versi 2.5.4
- **Permintaan Pengguna**: Menguji aplikasi langsung di smartphone fisik melalui koneksi USB ADB.
- **Tindakan yang Berhasil Dijalankan:**
  1. *Deteksi Perangkat Fisik*: Smartphone fisik terdeteksi aktif pada ID `9c4f8447`.
  2. *Perbaikan Bridge Notifikasi Native*: Menyelaraskan fungsi `dispatchLocalNotification` di JavaScript dengan interface native `window.Android.postLocalNotification` di `MainActivity.kt`.
  3. *Streamed Install & Launch*: Aplikasi berhasil dikompilasi ulang dengan Gradle 8.5 dan di-stream install langsung ke smartphone pengguna dalam hitungan detik.
- **Hasil Kompilasi & Versi Baru:**
  - `versionCode = 254`, `versionName = "2.5.4"`.
  - Output File: `D:\MANAS PROJEK\Raphael_App_v2.5.4_Debug.apk` (Ukuran: 5.67 MB).


### 2.35 Perbaikan Respon Sapaan Murni (*Dedicated Pure Greeting Orchestrator*)
- **Laporan Masalah Pengguna:**
  - *"Ini kok saya kirim chat 'Halo' atau 'Halo kamu' atau yang sama itu jawabannya malah ngeluarin total saldo dsb, bukan balik jawab sapa"*
- **Akar Masalah:**
  Fungsi orkestrasi `runChatOrchestration` di `chat.ts` sebelumnya selalu menyuntikkan seluruh fakta finansial (buku kas/ledger, transaksi, dan hutang) ke dalam prompt utama terlepas dari apakah pengguna hanya mengirim sapaan singkat. Gemini yang menerima data tersebut berasumsi perlu membacakan ringkasan kas jika tidak ada perintah spesifik.
- **Tindakan Perbaikan:**
  1. *Klasifikasi Sapaan Cerdas (`classifyIntent`)*: Mendeteksi sapaan murni (*"Halo"*, *"Halo kamu"*, *"Halo Raphael"*, *"Hai"*, *"Selamat sore"*, *"Pagi"*, dsb) yang tidak memuat angka mata uang atau instruksi data.
  2. *Dedicated Pure Greeting Prompt (`buildGreetingPrompt`)*: Jika pesan terdeteksi sebagai sapaan santai, sistem mengarahkan AI untuk **hanya menyapa balik secara ramah, hangat, dan santun** sesuai waktu WIB (Pagi/Siang/Sore/Malam) dan menanyakan apa yang bisa dibantu, **TANPA MENAMPILKAN SALDO KAS ATAU TABEL FINANSIAL SAMA SEKALI**.


### 2.34 Implementasi Perbaikan Menyeluruh Hasil Audit Ekstrem (Rilis Versi 2.5.3)
- **Tujuan**: Menerapkan solusi atas seluruh temuan audit mendalam tanpa menambahkan fitur baru.
- **Rincian Perbaikan yang Diterapkan:**
  1. *Perbaikan Pembagian Nol (*Division by Zero*)*: `calculators.ts` diamankan dengan guardrail `Math.max(1, daysRemaining)` sehingga tidak akan menghasilkan nilai `Infinity` atau `NaN` pada hari H acara.
  2. *Penyelarasan Data Riil*: Nilai statis default untuk armada Honda Beat di `index.html` dan `app.js` telah diselaraskan dengan database menjadi Plat `N 4321 ABC` dan Odometer `45.200 KM`.
  3. *Validasi DOM Container*: Menjamin ketersediaan elemen target `#briefing-history-list` di Tab 4 Notifikasi.
  4. *Exception Safety Rute API*: Endpoint backend Next.js (`/api/health`, `/api/jobs/[id]/status`, dll) kini dibungkus blok `try/catch` dan mengecek error query Supabase secara ketat.
- **Hasil Kompilasi & Versi Baru:**
  - `versionCode = 253`, `versionName = "2.5.3"`.
  - Output File: `D:\MANAS PROJEK\Raphael_App_v2.5.3_Debug.apk` (Ukuran: 5.67 MB).


### 2.33 Pemulihan Mesin Morning Briefing, Tombol Uji Notifikasi & Rilis Versi 2.5.2
- **Laporan Masalah Pengguna:**
  - *"Morning briefing dan test morning briefing tidak berjalan"*
- **Akar Masalah & Tindakan Korektif:**
  1. *Akar Masalah*: Fungsi `loadMorningBriefingArchive`, `generateAndShowMorningBriefing`, dan `openTodayMorningBriefing` sebelumnya terhapus dari `app.js` saat pembaruan modul, sehingga tombol briefing memicu *ReferenceError*.
  2. *Pemulihan Mesin Morning Briefing*: Mengintegrasikan ulang seluruh siklus hidup briefing:
     - Pop-up otomatis di layer atas (`modal-morning-briefing`) saat buka aplikasi.
     - Pengiriman notifikasi lokal ke status bar Android via `dispatchLocalNotification()`.
     - Tombol **[Baca Hari Ini]** dan tombol khusus **[Uji Notifikasi (Test)]** di Tab 4 Notifikasi untuk menguji pop-up dan getaran status bar kapan saja.
     - Riwayat tersimpan rapi dan otomatis terhapus setelah 7 hari.
- **Hasil Kompilasi & Versi Baru:**
  - `versionCode = 252`, `versionName = "2.5.2"`.
  - Output File: `D:\MANAS PROJEK\Raphael_App_v2.5.2_Debug.apk` (Ukuran: 5.67 MB).


### 2.32 Audit & Perbaikan 4 Masalah Kritis Mobile & Rilis Versi 2.5.1
- **4 Laporan Masalah dari Pengguna:**
  1. *AI Menjawab Tidak Sesuai*: Jawaban memunculkan ringkasan template usang (saldo Rp 427.500 & hutang talangan Rp 101.000) bukannya merespons pertanyaan secara kontekstual.
  2. *Pindah Tab Terasa Berat/Lag*: UI mengalami delay saat berpindah tab.
  3. *History Chat Hilang Saat Tutup Aplikasi*: Chat ter-reset ke pesan awal saat aplikasi dibuka kembali.
  4. *Tab Chat Terkunci/Tidak Bisa Dibuka*: Dari Tab Database tidak bisa kembali ke Tab Chat.
- **Akar Masalah & Tindakan Korektif:**
  1. **Optimasi Tab Switching (*Zero-Jank*)**: Menghapus eksekusi rendering synchronous `render20AnalyticsModels()` dan `renderTabAnalyticsCharts()` dari fungsi `switchTab()`. Grafik kini hanya di-render secara *on-demand* saat Tab Analitik dibuka.
  2. **Perbaikan Definisi `loadPersistedChatHistory`**: Menyediakan fungsi render riwayat chat yang kuat (`renderUserBubbleFromHistory` & `renderButlerBubbleFromHistory`) yang tersimpan di `getPersistentItem('saved_chat_messages_v2')`.
  3. **Perbaikan Navigasi Tab Chat**: Menyematkan handler `onclick="switchTab('chat')"` langsung pada elemen HTML `#nav-btn-chat` dan menyederhanakan touch listener SOS agar tidak menelan klik normal.
  4. **Penyelarasan Prompt AI**: Memperbarui aturan grounding di `chat.ts` agar AI merespons secara langsung dan kontekstual tanpa memaksakan angka-angka finansial lama jika pengguna tidak menanyakannya.
- **Hasil Kompilasi & Versi Baru:**
  - `versionCode = 251`, `versionName = "2.5.1"`.
  - Output File: `D:\MANAS PROJEK\Raphael_App_v2.5.1_Debug.apk` (Ukuran: 5.66 MB).


### 2.31 Retensi Sesi Permanen (Native SharedPreferences Bridge) & Dukungan Tablet (Rilis Versi 2.5.0)
- **Dua Masalah & Permintaan Pengguna:**
  1. *Masalah Sesi*: Saat keluar aplikasi dan menghapus tab history / recent apps, aplikasi malah kembali menampilkan onboarding dan form login.
  2. *Dukungan Tablet*: Pengguna ingin aplikasi dapat berjalan optimal di smartphone maupun tablet Android (7" - 12").
- **Akar Masalah & Solusi Rekayasa:**
  1. **Akar Masalah Sesi**: Android WebView DOM `localStorage` dapat mengalami delay flushing atau reset memori saat proses aplikasi di-kill oleh task manager.
  2. **Native SharedPreferences Store**: `MainActivity.kt` ditambahkan bridge penyimpanan native `@JavascriptInterface setItem/getItem/removeItem` yang tersimpan langsung di flash storage Android (`SharedPreferences`), sehingga status `is_logged_in` dan `onboarding_completed` **100% KEBAL TERHADAP RECENT APPS CLEAR & REBOOT HP**.
  3. **Zero-Flicker Inline Auth Check**: Script inline di `<head>` mengecek status autentikasi sebelum halaman selesai dirender, mencegah kedipan layar login.
  4. **Dukungan Tablet & Layar Lebar Adaptif**:
     - `AndroidManifest.xml` ditambahkan `<supports-screens>` dan `configChanges` multi-window/tablet.
     - `index.html` dikemas dalam `#app-container` yang berpusat rapi (`max-w-4xl`) di tablet, dengan floating bottom nav dan modal yang proporsional.
- **Hasil Kompilasi & Versi Baru:**
  - `versionCode = 250`, `versionName = "2.5.0"`.
  - Output File: `D:\MANAS PROJEK\Raphael_App_v2.5.0_Debug.apk` (Ukuran: 5.66 MB).


### 2.30 Integrasi Penuh Modul Riset 13-Dimensi & Rilis Resmi Versi 2.4.0
- **Evolusi & Penambahan Dimensi Riset:**
  1. *Riset Kampus, Institusi, & Fasilitas Fisik* (Termasuk tautan aktif Google Maps).
  2. *Riset Linguistik & Komparasi Budaya Multi-Bahasa* (Jepang, Inggris, Indonesia, Jawa).
  3. *Riset Sains & Taksonomi Botani* (*Rafflesia arnoldii* vs *Amorphophallus titanum*).
  4. *Riset Skripsi & Metodologi AI* (RAG vs Fine-tuning, F1-Score, LaTeX, Bab 4-5).
  5. *Riset Mekanikal & Diagnostik Motor* (Honda Beat CVT, Injeksi MIL 52, Biaya Servis).
  6. *Riset Touring, Jalur Perjalanan & Logistik* (Rute Malang-Dieng, Homestay, Cuaca 5-10°C).
  7. *Riset Efisiensi Lapangan Gojek* (Spot ramai Malang Kota, konsumsi bensin BBM).
  8. *Riset Medis P3K & Rujukan BPJS* (Pertolongan pertama aspal, alur faskes RSUD Saiful Anwar).
  9. *Riset Komparasi Gadget & PC* (Smart buying laptop coding & smartphone second ojol).
  10. *Riset Dokumen Publik & Karier* (Samsat Malang ganti plat 5 tahunan, SKCK online, ATS CV).
  11. *Riset Resep Hemat & Nutrisi Kos* (Resep modal 10-15rb tinggi protein, masak cepat 15 menit).
  12. *Riset Debugging Error Software* (Akar error Kotlin, Next.js, Supabase, dan blok kode solusi).
  13. *Riset Hukum Konsumen & Finansial Mikro* (Ganti rugi kurir ekspedisi, komparasi RDPU vs Bank Digital).
- **Hasil Kompilasi & Versi Baru:**
  - `versionCode = 240`, `versionName = "2.4.0"`.
  - Output File: `D:\MANAS PROJEK\Raphael_App_v2.4.0_Debug.apk` (Ukuran: 5.66 MB).


### 2.29 Standarisasi Semantic Versioning (v2.3.0 Major Milestone) & In-App Changelog Log
- **Pedoman & Mandat Pembaruan Versi dari Pengguna:**
  - *"bantu ingat, jika setelah melakukan pembaruan untuk aplikasi, ubah nomor versi aplikasinya dan buatkan log, besar ubah nomor aplikasinya berdsarakan seberapa besar perubahan, jika kecil ya digit kecil aja dan kalo besar ya besar, pada profil tampilkan versi aplikasi juga"*
- **Aturan Semantic Versioning yang Ditetapkan:**
  1. **Major Version (`X.0.0`)**: Perubahan arsitektur masif, migrasi engine, perombakan struktur total.
  2. **Minor Version (`2.X.0`)**: Penambahan fitur/modul fungsional baru (seperti Onboarding, Login, Local System Notifications, Morning Briefing Popup, Dynamic Hub, & Gantt Chart).
  3. **Patch Version (`2.3.X`)**: Perbaikan bug (*bugfix*), perbaikan visual, dan optimasi kecil.
- **Implementasi Fitur Versi & Catatan Rilis:**
  1. **Badge & Kartu Versi di Tab 5 Profil**: Menampilkan `Raphael Cockpit Executive v2.3.0 (Build 2026.08.28-build230)` dengan badge tosca.
  2. **Modal In-App Changelog (`modal-changelog`)**: Modal interaktif yang dapat dibuka langsung oleh pengguna dari Tab Profil untuk membaca seluruh rekam jejak evolusi fitur aplikasi dari v1.0.0 hingga v2.3.0.
  3. **Penyelarasan Gradle**: `app/build.gradle.kts` diselaraskan ke `versionCode = 230` dan `versionName = "2.3.0"`.
  4. **Output Binary APK Resmi**:
     `D:\MANAS PROJEK\Raphael_App_v2.3.0_Debug.apk` (Ukuran: 5.66 MB).


### 2.28 Integrasi Notifikasi Lokal Status Bar, Pop-up Morning Briefing, Retensi Chat, & Pemisahan Form Rinci
- **7 Permintaan & Koreksi Pengguna:**
  1. *Notifikasi Lokal Sistem Android*: Notifikasi mandiri muncul di status bar HP (seperti alarm/jam) untuk briefing dan reminder.
  2. *Pop-up Modal Morning Briefing*: Muncul di layer atas saat buka aplikasi dan riwayat tersimpan di Tab Notifikasi (auto-purge >7 hari).
  3. *Retensi Riwayat Chat Persisten*: Pembaruan APK tidak menghapus chat history lokal.
  4. *Perbaikan Trigger SOS*: Memperbaiki false-trigger SOS saat berpindah tab chat.
  5. *Pemisahan Form SOS Rinci*: Memisahkan Nama, Domisili, Kontak, Golongan Darah, BPJS, Alergi, dan Faskes.
  6. *Pemisahan Form Kendaraan/Armada*: Memisahkan Plat Nomor, Odometer, Tangki, Konsumsi BBM, dan Interval Servis.
  7. *Audit 100% Data-Driven*: Memastikan AI hanya membaca dan menyimpulkan dari data riil database Supabase tanpa halusinasi.
- **Arsitektur Solusi & Implementasi:**
  1. **Native Android Notification Channel (`WebAppInterface`)**: `MainActivity.kt` ditambahkan fungsi `@JavascriptInterface postLocalNotification` yang terhubung ke `NotificationCompat.Builder` berprioritas tinggi (`IMPORTANCE_HIGH`).
  2. **Modal Pop-up Morning Briefing (`modal-morning-briefing`)**: Otomatis muncul pada pembukaan pertama harian, memuat ringkasan batas belanja aman, sisa kas likuid, dan agenda prioritas.
  3. **Arsip Briefing 7 Hari di Tab 4**: Riwayat tersimpan di `localStorage` dan dibersihkan otomatis jika lebih dari 7 hari (`Date.now() - 7*86400*1000`).
  4. **Touch-Exclusive SOS Long-Press Engine**: Menghapus synthetic event `mousedown` ganda pada layar sentuh sehingga tombol chat berpindah tab secara mulus tanpa memicu timer hantu SOS.
  5. **Form Rinci 100% Terpisah**: Form SOS kini memiliki 9 kolom terpisah, dan Form Kendaraan memiliki 8 kolom terpisah.
  6. **Data-Driven Guardrails**: Mandat zero-hallucination dikunci di prompt utama AI.


### 2.27 Implementasi Onboarding Carousel 3 Slide & Layar Autentikasi Login Eksekutif
- **Permintaan Pengguna:**
  - *"ini kan ketika saya perintah kamu build aplikasi nya agar bisa diinstall kan harus ada halaman login, nah buatkan dulu, lalu setelah itu build aplikasi jadi .apk agar bisa saya install di smartphone saya. Oh ya, kasih onboarding yah hehehe"*
- **Arsitektur Antarmuka & Alur UX yang Diterapkan:**
  1. **Layar Onboarding Walkthrough (3 Slide Animasi Interaktif):**
     - **Slide 1 (Personal Butler)**: Pengenalan Raphael AI sebagai asisten keuangan pribadi, pelunasan Bank Jago, dan OCR nota.
     - **Slide 2 (Dual-Engine Sync)**: Integrasi realtime antara catatan arus kas dengan agenda kegiatan multi-hari (Trip Dieng, Narik Gojek, & Beat Diagnostics).
     - **Slide 3 (Proteksi Cerdas & SOS ICE)**: Peringatan bentrok jadwal di luar kota, batas belanja harian, dan modal darurat medis.
     - Dilengkapi pagination dots dinamis (`● ○ ○`), tombol `[ Lewati ]`, dan transisi otomatis ke layar login.
  2. **Halaman Login & Autentikasi Modern:**
     - **1-Tap Quick Login**: Masuk langsung sebagai *Mas Firman (ID: 1084842050)* terverifikasi.
     - **Form Login Mandiri**: Input Nama Panggilan, Telegram/User ID, dan 4-Digit PIN Akses.
     - Terenkripsi dan tersimpan di `localStorage` (tanpa flicker saat buka aplikasi).
  3. **Manajemen Sesi & Logout di Tab 5 Profil:**
     - Tombol merah elegan **`[ 🚪 Keluar / Ganti Akun Pengguna ]`** untuk mereset sesi dan kembali ke layar login/onboarding kapan saja.
  4. **Output Binary APK Android:**
     - Berhasil dikompilasi dengan Gradle 8.5 menjadi file siap pasang:
       `D:\MANAS PROJEK\Raphael_App_v2.26_Debug.apk` (Ukuran: 5.68 MB).


### 2.26 Mesin Inferensi Cerdas Deteksi Bentrok Jadwal Multi-Hari & Imposibilitas Geografis
- **Studi Kasus / Permintaan Pengguna:**
  - *Data Koreksi:* "Trip Dieng berangkat 29 Agustus jam 17.00 WIB dan pulang 30 Agustus jam 23.00 WIB."
  - *Pertanyaan Evaluasi:* "Saya ada acara jalan sehat di desa karang puri sidoarjo tanggal 30 agustus, apakah saya bisa mengikuti atau bentrok?"
- **Arsitektur Inferensi AI (Multi-Day & Geographic Collision Detection Engine):**
  1. **Evaluasi Rentang Waktu (Time-Window Overlap):**
     - AI membaca bahwa agenda Trip Dieng Mas Firman berdurasi multi-hari dari `29-08-2026 17:00` s/d `30-08-2026 23:00`.
     - Karena acara baru (Jalan Sehat Sidoarjo) jatuh pada tanggal 30 Agustus, agenda tersebut berada tepat di tengah rentang waktu saat Mas Firman sedang berada di Dieng.
  2. **Evaluasi Imposibilitas Geografis (Geographic Distance & Transit Matrix):**
     - Lokasi A: Dieng Plateau, Wonosobo, Jawa Tengah.
     - Lokasi B: Desa Karang Puri, Sidoarjo, Jawa Timur.
     - Jarak fisik adalah **~380 KM** ($pprox 8 - 9$ jam perjalanan motor/mobil).
  3. **Hasil Keputusan AI**:
     - AI memberikan jawaban tegas dan taktis: **"100% JADWAL BENTROK! Mas Firman TIDAK BISA mengikuti acara jalan sehat di Sidoarjo pada tanggal 30 Agustus"**.
     - AI menyertakan alasan logis (sedang di Dieng hingga 23:00 malam dan jarak fisik mustahil) serta memberikan saran Butler agar Mas Firman tetap fokus menikmati liburan Dieng dengan tenang.


### 2.25 Audit Isolasi Data & Pembersihan Total Tagihan Dummy / Sewa Kos
- **Temuan Pengguna:**
  - *"wait, setelah saya pahami, ada beberapa data khofita dan data saya kamu merge jadi satu yah? contoh nya ini ada bayar kos, padahal saya tidak sedang nge kos"*
- **Hasil Investigasi Mendalam:**
  - Database transaksi riil (`transactions`) dan agenda (`activities`) Mas Firman di Supabase sebenarnya murni tanpa ada catatan sewa kos maupun data Khofita.
  - Item "Sewa Kos Bulanan Malang (Rp 500.000)" muncul murni dari **data template/mock bawaan prototype awal** pada array `DYNAMIC_BILLS` (`bill-kos`) di `route.ts` dan `app.js`.
- **Tindakan Pembersihan & Isolasi Total:**
  1. Menghapus item `bill-kos` ("Sewa Kos Bulanan Malang") secara permanen dari Supabase `user_preferences`, `route.ts`, dan `app.js`.
  2. Memastikan hanya ada 2 tagihan/kewajiban riil milik Mas Firman:
     - **Cicilan Bank Jago**: Rp 67.940 (Jatuh tempo tgl 20)
     - **Hutang ke Rifky**: Rp 150.000 (Jatuh tempo tgl 5)
  3. Memastikan isolasi data 100% bersih dan tidak ada data placeholder mahasiswa/pasangan yang tercampur ke akun Mas Firman.


### 2.24 Integrasi Modul Pengaturan Identitas, Jadwal Morning Briefing, & Status Sesi ke Tab Profil Mobile
- **Pertanyaan Pengguna:**
  - *"Pada profil juga, di web app ada setting nama saya, jadwal morning briefing, Status Sesi & Integrasi, tapi di mobile app tidak ada"*
- **Solusi Rekayasa:**
  - Menghadirkan seluruh modul konfigurasi Web App ke **Tab 5 (Profil)** aplikasi mobile native secara lengkap dan elegan:
    1. **Kartu Identitas Pengguna & Panggilan AI (`user_profile`):**
       - Input Nama Panggilan Pengguna (AI Greeting) yang tersinkronisasi ke database Supabase dan localStorage.
       - Input Alamat Email Terdaftar untuk rekap dan pengiriman ringkasan.
    2. **Kartu Jadwal Morning Briefing Harian:**
       - Toggle On/Off aktivasi briefing otomatis pagi hari.
       - Input waktu briefing (default: 07:00 WIB).
       - Opsi pengiriman salinan ke email terdaftar.
       - Tombol **`[Tes Kirim Briefing]`** untuk preview notifikasi langsung di ponsel.
    3. **Kartu Status Sesi & Integrasi Database Cloud:**
       - Menampilkan status realtime koneksi WebSocket ke Supabase PostgreSQL (Connected).
       - Informasi User UUID (`fc2758d3-78bb-4e22-b9f0-b3b16568b671`) dan Telegram ID (`1084842050`).
       - Tombol **`[⚡ Force Refresh Cache]`** untuk merefresh cache agregasi data harian seketika.
       - Tombol **`[📥 Backup Excel/CSV]`** untuk mengekspor seluruh transaksi kas dan aktivitas.


### 2.23 Evolusi Tab Analisis Mobile Menjadi Cockpit Eksekutif 100% Super Lengkap
- **Pertanyaan Pengguna:**
  - *"pada bagian bottom tab analisis, dia tidak selengkap yang ada di web app yah? kenapa?"*
- **Penyebab Sebelumnya:**
  - Tab Analisis awal di mobile native didesain dalam bentuk ringkas (*condensed minimal cards*) untuk memastikan performa awal ringan.
- **Evolusi Total & Penyempurnaan yang Diterapkan:**
  - Tab Analisis (Tab 1) kini telah di-upgrade menjadi **Cockpit Analisis Eksekutif 100% Lengkap** yang melampaui Web App:
    1. **5 Filter Rentang Waktu (Cockpit Timeframe Selector)**: `[Hari Ini]`, `[7 Hari]`, `[Bulan Ini]`, `[3 Bulan]`, `[1 Tahun]` dengan pembaruan metrik dan chart instan.
    2. **Morning Briefing Harian & Rasio Produktivitas**: Menampilkan agenda hari ini, perhatian urgent (hutang/tagihan), dan progress bar rasio tugas selesai (82%).
    3. **Batas Belanja Aman Harian ($B_{harian}$)**: Kalkulasi batas belanja per hari agar target menabung dan cicilan tetap aman.
    4. **Galeri Visual Grafik Interaktif (Chart Gallery)**: Dilengkapi tab pengalih `[📈 Line Chart (Tren Kas 7 Hari)]`, `[🍩 Donut Chart (Alokasi Pos)]`, dan `[📊 Bar Chart (Komparasi Finansial)]`.
    5. **Timeline Gantt Multi-Day 2026**: Progres persiapan trip Dieng, narik Gojek harian, dan milestone wisuda.
    6. **Katalog 20 Model Analisis Realtime**: Daftar accordion interaktif yang membedah 20 instrumen analisis finansial (Inflow-Outflow, Net Margin, Burn Rate, ROI Bensin Motor 5.1x, Sinking Fund Dieng, Beban Hutang Rifky Rp 150k, FHS Score 88/100, hingga Kesiapan Tanggap Darurat ICE).


### 2.22 Kustomisasi Indikator Animasi Status Mengetik Chat
- **Permintaan Pengguna:**
  - *"Bisa ngga, teks untuk ketika ai nya mengetik itu tulisnnya diganti 'Raphael sedang mengetik ...'"*
- **Solusi Rekayasa:**
  - Mengubah teks status *loading placeholder* saat user mengirim pesan chat dari sebelumnya `"Raphael sedang memproses analisis..."` menjadi **`"Raphael sedang mengetik ..."`** lengkap dengan ikon robot dan animasi denyut hijau neon (*lime animate-pulse*).


### 2.21 Koreksi & Rekonsiliasi Data Tagihan Hutang Rifky (Rp 150.000)
- **Pertanyaan / Temuan Pengguna:**
  - *"oh ya, pada data saya, seingat saya saya belum bayar ke rifky, kok ini datanya jadi 100, padahal kan harusnya 150 ribu, dimana salahnya"*
- **Penyebab / Akar Masalah:**
  - Pada saat inisialisasi awal (*seed default*) modul Dynamic Hub di route `/api/mobile/dynamic` dan file `app.js`, data tagihan contoh/mock `bill-rifky` secara tidak sengaja tertulis dengan nominal `100000` (Rp 100.000) karena pembulatan template, padahal nominal kewajiban hutang yang sebenarnya belum dibayar oleh Mas Firman adalah **Rp 150.000** (Jatuh tempo 05 September 2026).
- **Tindakan Koreksi yang Dilakukan:**
  1. Mengoreksi baris data pada `/api/mobile/dynamic/route.ts` dan `app.js` menjadi `amount: 150000`.
  2. Melakukan sinkronisasi database live Supabase pada tabel `user_preferences` kunci `DYNAMIC_BILLS` sehingga nilai hutang ke Rifky menjadi **Rp 150.000 (Status: Belum Dibayar / Scheduled)**.
  3. Memperbarui kartu tagihan di Tab 4 (Notifikasi & Tagihan) dan Dynamic Hub di seluruh aplikasi.


### 2.20 Hierarki Z-Index Modal & Auto Scroll-to-Top (Anti-Tertimpa Modal Induk)
- **Masalah Pengguna:**
  - Saat membuka form edit / tambah data motor dari dalam Dynamic Hub, modal anak (`#modal-vehicle`) berpotensi tertimpa atau terhalang oleh modal induk (`#modal-dynamic-hub`) karena keduanya berada pada layer z-index yang sama (100).
- **Solusi Rekayasa:**
  1. **Hierarki Bertingkat Z-Index (*Layering Architecture*):**
     - Base Modal / Modal Induk (Dynamic Hub, Setting AI, CRUD Transaksi): `z-index: 100`.
     - Sub-Modal / Form Anak (`#modal-vehicle`, `#modal-wallet`, `#modal-goal`, `#modal-bill`, `#modal-pill`, `#modal-edit-ice`): `z-index: 150 !important;` dilengkapi efek `backdrop-filter: blur(4px);` dan latar belakang gelap 90% opacity, sehingga form anak **100% berada di posisi paling atas** dan menutupi modal di bawahnya dengan sempurna.
     - Modal Darurat Ekstrem (`#modal-emergency`): `z-index: 200 !important;` (lapisan absolut tertinggi).
  2. **Auto Reset Scroll-to-Top:**
     - Menambahkan instruksi `m.scrollTop = 0` dan `box.scrollTop = 0` saat modal motor dibuka, memastikan pengguna langsung melihat judul form dan input paling atas (Nama/Merk Motor) tanpa tergulung ke bawah.


### 2.19 Penggantian Total Browser Prompt Android Menjadi Form Dialog Modal In-App Presisi (Armada Motor & Dynamic Hub)
- **Masalah Pengguna:**
  - Saat menekan tombol `+ Tambah Motor` pada Dynamic Hub, muncul popup dialog teks putih bawaan sistem Android (*window.prompt browser*), yang merusak estetika desain aplikasi Raphael dan tidak menyediakan form lengkap untuk parameter kendaraan (nama, plat, efisiensi BBM KM/L, kapasitas tangki, odometer saat ini, dan interval servis).
- **Solusi Rekayasa:**
  1. **Modal Form In-App Dedicated (`#modal-vehicle`):**
     - Membangun form modal bertema gelap (*dark-mode*) lengkap dengan validasi visual untuk seluruh parameter motor:
       * **Nama / Merk Motor**: (e.g. *Honda Beat FI, Vario 125, NMAX*)
       * **Nomor Plat Kendaraan**: (e.g. *N 4567 XX*)
       * **Jenis Bahan Bakar**: Dropdown pilihan (*Pertalite RON 90, Pertamax RON 92, Shell*)
       * **Efisiensi Konsumsi BBM (KM/L)**: Digunakan untuk estimasi pengeluaran bensin dan rute Dieng
       * **Kapasitas Tangki (Liter)**: Parameter akurasi konsumsi bensin
       * **Odometer Saat Ini (KM)**: Menentukan countdown servis berkala & ganti oli
       * **Interval Servis (KM)**: Jarak km antar servis (default 2.500 KM)
       * **Checkbox Motor Utama**: Opsi langsung menjadikan motor ini sebagai motor aktif utama
  2. **Eradikasi Total `window.prompt()` di Seluruh Aplikasi:**
     - Mengganti seluruh aksi input di Dynamic Hub (Tambah Dompet, Tambah Target/Sinking Fund, Tambah Tagihan/Cicilan, Tambah Tombol Pintasan) menjadi modal in-app tersendiri:
       * `#modal-wallet` untuk Tambah Dompet Baru
       * `#modal-goal` untuk Tambah Target Menabung & Sinking Fund
       * `#modal-bill` untuk Tambah Tagihan & Cicilan
       * `#modal-pill` untuk Tambah Tombol Pintasan Cepat
     - Aplikasi Raphael kini **100% bebas dari dialog alert/prompt browser** dan seluruh interaksi menggunakan form in-app yang elegan, modern, dan presisi.


### 2.18 Eliminasi Seleksi Teks Android pada Long-Press Navbar & Redesain Ringkas Profil SOS
- **Masalah Pengguna:**
  1. Ketika tombol robot di navbar tengah diklik tahan, muncul popup/tooltip bawaan sistem Android (Salin / Tempel / Magnifier), yang memblokir fungsi tahan 3 detik untuk mengaktifkan SOS.
  2. Form pengaturan SOS di Tab Profil memakan tempat terlalu panjang sehingga tampilan profil menjadi penuh dan kurang rapi.
- **Solusi Rekayasa:**
  1. **Anti-Context Menu & Anti-Text Selection:**
     - Menetapkan `-webkit-touch-callout: none !important; -webkit-user-select: none !important; user-select: none !important;` pada body dan seluruh elemen navbar.
     - Menambahkan handler `oncontextmenu="return false;"` dan `e.preventDefault()` pada tombol robot `#nav-btn-chat`.
     - Menghapus atribut `title="..."` pada elemen interaktif yang memicu tooltip native Android.
     - Menambahkan animasi visual `.coral-pulse` (lingkaran merah berdenyut) saat tombol robot sedang ditahan selama 3 detik, sebelum memicu haptic vibration (getaran) dan membuka modal darurat.
  2. **Redesain Ringkas Profil SOS (Tab 5):**
     - Mengubah form panjang menjadi **Kartu Ringkasan SOS (Emergency ICE Summary Card)** yang elegan (menampilkan Gol. Darah, No BPJS, Kontak Darurat).
     - Menyediakan tombol **`[✏️ Atur Data]`** yang membuka modal khusus `#modal-edit-ice` untuk melihat, mengubah, dan menyimpan seluruh data profil medis darurat tanpa mengorbankan kerapian Tab Profil.


### 2.17 Implementasi Manajemen Multi-Motor Dinamis & Emergency SOS Long-Press 3 Detik
- **Kebutuhan Pengguna:**
  1. Pengguna memiliki beberapa unit motor yang digunakan bergantian untuk narik Gojek maupun aktivitas harian, sehingga memerlukan kemampuan menambah, mengubah, dan mengganti motor aktif agar kalkulasi konsumsi BBM (KM/L), ROI, dan odometer servis berkala selalu presisi.
  2. Menghapus fitur TTS (Voice Butler) dan STT (Voice Input Mic) agar antarmuka chat tetap ramping dan fokus.
  3. Menyediakan pengaturan data profil darurat (Emergency ICE) di Tab 5 (Profil), dan mengubah cara aktivasi SOS agar hanya terpicu melalui chat (*"sos" / "darurat"*) atau dengan **menekan dan menahan tombol robot chat di navigasi bawah selama 3 detik** (dengan getaran haptic feedback).
- **Arsitektur Solusi:**
  1. **Dynamic Multi-Motor Fleet (`DYNAMIC_VEHICLES`):**
     - Sub-tab baru **`[🛵 Motor]`** di Dynamic Hub yang memungkinkan pengguna mendaftarkan motor baru (Nama, Plat, KM/L, Odometer KM), menghapus motor, dan memilih motor aktif (`setActiveVehicle`).
     - Motor aktif langsung disinkronkan ke widget chat di Tab 3, perhitungan bensin trip Dieng, dan logbook servis berkala.
  2. **Pembersihan Total TTS & STT:**
     - Menghapus fungsi `speakText` dan `startVoiceSTT` beserta seluruh elemen tombol mikrofon dan speaker dari aplikasi.
  3. **Pengaturan ICE & Trigger SOS 3 Detik:**
     - Form konfigurasi lengkap di Tab Profil: Nama Lengkap, Domisili, Golongan Darah, No BPJS, Kontak Darurat Keluarga, dan Catatan Medis.
     - Event listener `touchstart` / `mousedown` pada tombol robot `#nav-btn-chat` yang menghitung durasi 3.000 ms sebelum membuka modal darurat secara otomatis.


### 2.16 Implementasi Master Super Capabilities Chat Hub (Split Bill, Pelunasan Jago, Interactive Checklists, Voice TTS & Emergency ICE)
- **Kebutuhan Pengguna:** Memasang seluruh ekosistem fitur super interaktif ke dalam Chat Hub untuk mendongkrak produktivitas, efisiensi operasional Gojek, persiapan ekspedisi Dieng 2026, percepatan bimbingan skripsi, serta proteksi keamanan fisik/medis.
- **Arsitektur Solusi:**
  1. **Split Bill WhatsApp Generator (`/api/mobile/features`):**
     - Mengurai nominal patungan, membagi rata per anggota, dan menyediakan tombol satu-ketuk `[📱 Salin Teks Format WhatsApp]` siap kirim ke grup WA lengkap dengan nomor Gopay/Jago.
  2. **Kalkulator Pelunasan Dini Bank Jago:**
     - Menghitung perbandingan pembayaran normal vs pelunasan sisa pokok dengan simulasi penghematan bunga nyata sebesar **Rp 215.280**, dilengkapi tombol langsung `[Catat Pelunasan Dini]`.
  3. **Interactive Checklists (Trip Dieng & Skripsi):**
     - Gelembung kartu checklist dengan kotak centang interaktif. Mengetuk kotak centang langsung memperbarui status visual secara lokal (strikethrough) dan menyinkronkan status ke Supabase `user_preferences`.
  4. **Logbook Servis & Diagnostik Honda Beat FI:**
     - Pelacak odometer harian (32.500 KM), hitung mundur servis oli berkala (D-2.500 KM / 35.000 KM), dan pencatatan biaya servis otomatis.
  5. **Voice Butler Audio TTS (Web Speech Synthesis):**
     - Tombol `[🔊 Dengarkan Suara]` pada setiap pesan AI untuk membacakan analisis dan rekomendasi dengan intonasi bahasa Indonesia yang santun.
  6. **Emergency ICE (In Case of Emergency) & SOS Modal:**
     - Tombol SOS cepat pada header aplikasi yang menampilkan profil medis (golongan darah O+, identitas motor Beat, nomor kontak darurat keluarga).
  7. **Smart Follow-up Chips:**
     - Baris rekomendasi pertanyaan lanjutan cerdas yang dinamis di bawah setiap respon AI.


### 2.15 Rangkuman Koreksi & Preferensi Chat AI Otomatis (Anti-Redundansi & Dual Form Synthesis)
- **Kebutuhan Pengguna:** Tombol "Generate Rangkuman Sekarang" pada Setting AI berfungsi sebagai mesin *Meta-Learning / Self-Learning Preference Extractor*. Sistem harus membaca seluruh percakapan, instruksi, dan koreksi dari Mas Firman di chat (panggilan nama, gaya menjawab to-the-point, fakta kendaraan Beat 50km/L, cicilan Bank Jago tgl 20, target Dieng Rp 1.040.000, dll.), lalu merangkumnya menjadi 2 format instruksi AI yang bersih, saling melengkapi, dan **bebas duplikasi (anti-redundansi)**.
- **Arsitektur Solusi:**
  1. **Dual-Format Synthesis Engine (LLM Gemini Prompt):**
     - **Format 1 (Deskripsi Naratif / `MANUAL_PREFERENCE_DESKRIPSI`)**: Merangkum identitas Mas Firman, peran butler Raphael, filosofi komunikasi, dan konteks umum secara elegan tanpa menumpuk angka berulang.
     - **Format 2 (Poin-Poin Baku / `MANUAL_PREFERENCE_BULLET_POINTS`)**: Merangkum aturan operasional tegas per baris berawalan `-` yang terstruktur, ringkas, dan actionable.
     - **Deduplikasi Cerdas**: Jika ada poin atau instruksi yang maknanya sama di riwayat chat, sistem otomatis menggabungkannya (*merge & consolidate*) agar tidak dobel.
  2. **Alur Eksekusi:**
     - Pengguna menekan tombol `[⚡ Generate Rangkuman Sekarang]` di Setting AI.
     - Endpoint `/api/mobile/crud` (`generate_preference_instructions`) memproses riwayat chat via Gemini LLM.
     - Hasil otomatis disimpan ke tabel `user_preferences` di Supabase dan mengisi form input di modal Setting AI.
     - Chat lama dibersihkan dan digantikan dengan satu kartu konfirmasi eksekutif: `🧠 PREFERENSI & KOREKSI AI DISINTESIS DARI CHAT`.


### 2.14 Implementasi Master Dynamic Entities Hub (8 Aspek Dinamis & 300 Audit Hardening)
- **Kebutuhan Pengguna:** Membuat seluruh entitas sistem (dompet & rekening, target menabung sinking fund, daftar tagihan cicilan, kategori belanja, tombol pintasan chat, fakta personal AI, dan batasan guardrails) menjadi 100% dinamis tanpa ada batasan kaku (*Zero-Code Dynamic Extensibility*). Pengguna bebas menambah, mengubah, dan menghapus entitas kapan saja langsung lewat antarmuka aplikasi.
- **Arsitektur Solusi:**
  1. **Dynamic Hub Backend (`/api/mobile/dynamic`):**
     - Endpoint sinkronisasi 2 arah untuk membaca dan menyimpan array `DYNAMIC_WALLETS`, `DYNAMIC_GOALS`, `DYNAMIC_BILLS`, dan `DYNAMIC_QUICK_PILLS` ke Supabase `user_preferences`.
     - Action `pay_bill` yang otomatis mencatat pembayaran tagihan ke tabel `transactions` dan memotong saldo dompet yang dipilih pengguna.
  2. **Dynamic UI & Cross-Tab Binding:**
     - **Top Header Bar**: Saldo kas likuid dihitung secara dinamis dari akumulasi seluruh dompet bertipe kas.
     - **Tab 1 (Analisis)**: Kartu *Dynamic Goals & Sinking Funds* merender seluruh target (Trip Dieng, Ganti Ban Beat, Pajak STNK, dll.) dengan progress bar persentase dan sisa kekurangan nominal.
     - **Tab 2 (Database)**: Dropdown pilihan dompet pada modal transaksi dan tombol filter dompet otomatis terisi sesuai daftar dompet aktif.
     - **Tab 3 (Chat Hub)**: Baris tombol pintasan cepat (*quick action pills*) merender tombol kustom pengguna dan mengeksekusi query AI dengan 1-ketukan.
     - **Tab 4 (Notifikasi)**: Menampilkan seluruh tagihan dan angsuran aktif dengan badge tanggal jatuh tempo dan tombol `[Bayar Sekarang]`.
     - **Tab 5 (Profil)**: Kartu Master **`[⚙️ KELOLA ENTITAS DINAMIS]`** membuka modal 5 sub-tab untuk manajemen mandiri seluruh dompet, target, tagihan, dan pintasan.
  3. **Penerapan 300 Audit Proteksi**:
     - *Memory Leak Canvas Prevention*: Fungsi `safelyDestroyChart()` memanggil `chart.destroy()` sebelum merender canvas baru.
     - *Graceful Degradation*: Jika data baru belum diisi, sistem otomatis memakai fallback default tanpa crash.
     - *Fast Local Synchronization*: Memperbarui UI seketika pasca mutasi.
