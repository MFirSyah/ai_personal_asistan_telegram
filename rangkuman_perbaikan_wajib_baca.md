# 🤖 LOGBOOK & MASTER KNOWLEDGE EKOSISTEM TELEGRAM BOT & BACKEND CLOUD
## AI Personal Assistant Raphael (Next.js Serverless / Supabase / Gemini AI Engine / Telegram Webhook)
> **STATUS**: WAJIB DIBACA & DIPATUHI SEBELUM MELAKUKAN EDIT KODE PADA REPOSITORI `telegram`  
> **LINK MOBILE DEV LOGBOOK**: [logbook_mobile_dev.md](file:///D:/MANAS%20PROJEK/telegram/logbook_mobile_dev.md)  
> **LOKASI UTAMA**: `D:\MANAS PROJEK\telegram\rangkuman_perbaikan_wajib_baca.md`

---

## 📑 DAFTAR ISI MASTER TELEGRAM & BACKEND
1. [Bagian 1: 150 Fitur Ekosistem Telegram Bot & Web App](#-bagian-1-150-fitur-ekosistem-telegram-bot--web-app)
2. [Bagian 2: Arsitektur Backend API & Skema Database Supabase](#-bagian-2-arsitektur-backend-api--skema-database-supabase)
3. [Bagian 3: Persona Royal Butler, Slang Malang, & NLP Engine](#-bagian-3-persona-royal-butler-slang-malang--nlp-engine)
4. [Bagian 4: Protokol Keamanan Webhook, Sinkronisasi Cloud, & Serverless](#-bagian-4-protokol-keamanan-webhook-sinkronisasi-cloud--serverless)
5. [Bagian 5: Pointer & Integrasi dengan Ekosistem Mobile Dev](#-bagian-5-pointer--integrasi-dengan-ekosistem-mobile-dev)

---

## 🏛️ BAGIAN 1: 150 FITUR EKOSISTEM TELEGRAM BOT & WEB APP
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

---

## 🗄️ BAGIAN 2: ARSITEKTUR BACKEND API & SKEMA DATABASE SUPABASE

### 1. Daftar Endpoint API Utama (Next.js App Router)
- `POST /api/telegram/webhook`: Handler utama webhook Telegram Bot dengan verifikasi secret token, debounce deduplikasi pesan ganda, dan integrasi Gemini AI.
- `POST /api/chat`: Endpoint AI chat multi-turn untuk aplikasi mobile & web yang mengembalikan teks jawaban, ekstraksi preferensi, dan array rekomendasi visual chart (`charts: ['line', 'doughnut', 'bar', 'gantt', 'eisenhower']`).
- `GET /api/data/records`: Pengambilan data transaksi keuangan dan kegiatan/agenda pengguna dari Supabase secara realtime.
- `POST /api/admin/seed-dummy`: Endpoint administratif pembersihan database dan injeksi data dummy terstruktur (25 keuangan + 25 agenda) untuk pengujian.
- `GET /api/cron/morning-briefing`: Endpoint cron otomatis harian untuk mengirim ringkasan agenda dan status finansial ke Telegram pengguna.

### 2. Skema Tabel Supabase Enterprise
- **`transactions`**: Pencatatan arus kas (`id`, `user_id`, `type`: income/expense, `amount`, `category`, `description`, `date`, `payment_method`, `created_at`).
- **`activities`**: Pencatatan agenda, roadmap multi-hari, dan tugas harian (`id`, `user_id`, `title`, `category`, `status`: scheduled/in_progress/completed, `priority`: low/medium/high, `date`, `duration_days`, `start_date`, `end_date`, `notes`).
- **`user_preferences`**: Memori jangka panjang AI (`user_id`, `description`, `bullet_points`, `updated_at`).
- **`vehicles`**: Data armada motor aktif (`id`, `user_id`, `name`: Beat FI, `plate_number`, `current_km`, `oil_change_interval`, `fuel_consumption`).
- **`commitments` / `debts`**: Pelacak hutang piutang, cicilan Bank Jago, sinking fund, dan tagihan berkala.

---

## 🧠 BAGIAN 3: PERSONA ROYAL BUTLER, SLANG MALANG, & NLP ENGINE

### 1. Karakteristik & Nada Bahasa Raphael
- **Nama Persona**: Raphael (Private Executive Secretary & Royal Butler).
- **Target Pengguna**: Mas Firman (Sidoarjo/Malang, Jawa Timur).
- **Gaya Komunikasi**: Santun, hangat, presisi, solutif, dan efisien. Menggunakan panggilan hormat *"Mas Firman"*.
- **Pemahaman Bahasa Lokal & Slang**:
  - Dialek Jawa Timuran / Malang: *mbois*, *sam*, *rek*, *nawak*, *suwun*, *wes mantep*.
  - Istilah Nominal Finansial: *ceban* (10.000), *goceng* (5.000), *gocap* (50.000), *seceng* (1.000), *sejutut* (1.000.000).
- **Format 3 Lapis (Layered Response)**:
  1. *Lapis 1*: Sapaan hangat dan ringkasan eksekutif instan (1-2 kalimat).
  2. *Lapis 2*: Rincian data terstruktur dalam bentuk bullet points atau visual chart recommendations.
  3. *Lapis 3*: Tindakan proaktif lanjutan (*follow-up action* terarah).

---

## 🔒 BAGIAN 4: PROTOKOL KEAMANAN WEBHOOK, SINKRONISASI CLOUD, & SERVERLESS

1. **Telegram Webhook Secret Token**: Setiap webhook request divalidasi menggunakan header `x-telegram-bot-api-secret-token` untuk mencegah request palsu dari luar Telegram.
2. **Idempotensi & Anti-Spam**: Menggunakan in-memory lock dan message ID tracking untuk menghindari eksekusi ganda jika Telegram mengirimkan retry webhook.
3. **Database Security & RLS**: Seluruh tabel di Supabase diproteksi Row Level Security (RLS) terikat pada `user_id` pengguna untuk isolasi data multi-tenant yang aman.
4. **Environment Secrets**: Seluruh kredensial sensitif (`TELEGRAM_BOT_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, dll) tersimpan aman di Vercel Environment Variables dan tidak pernah di-commit ke Git.

---

## 📱 BAGIAN 5: POINTER & INTEGRASI DENGAN EKOSISTEM MOBILE DEV

Pengembangan sisi aplikasi Android / Tablet (Cordova, antarmuka Tailwind CSS, Chart.js, native storage bridge, dan penanganan layar fisik Samsung Galaxy Tab A8) telah dipisahkan secara khusus ke dalam logbook tersendiri:
👉 **[Buka Logbook Mobile Dev](file:///D:/MANAS%20PROJEK/telegram/logbook_mobile_dev.md)**

Silakan merujuk ke berkas tersebut untuk membaca:
- Kamus Masalah Klasik & Golden Rules Anti-Regresi Mobile Dev.
- 150 Poin Audit Ekstrem Android / Edge Cases WebView.
- Histori Lengkap Rilis Mobile dari Versi 2.1.0 hingga Versi 3.20.15.
