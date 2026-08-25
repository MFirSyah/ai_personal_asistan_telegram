# 🛡️ DOKUMEN AUDIT MASTER 305 TEMUAN ARSITEKTUR, LOGIKA, DAN STRATEGI SISTEM

> **Dokumen Audit Komprehensif & Analisis Kasus Batas (Edge Cases)**  
> **Target:** Sistem AI Personal Assistant Telegram (Mas Firman)  
> **Status:** Analisis Mendalam & Bahan Diskusi Strategis (Belum Diubah / No Code Modification)  
> **Total Temuan:** 305 Poin Terstruktur di 8 Domain Arsitektur  

---

## 📑 DAFTAR ISI DOMAIN AUDIT

1. [Domain 1: Kecerdasan AI Gemini, NLP, Slang, & Persona Butler (Poin 1 – 50)](#domain-1-kecerdasan-ai-gemini-nlp-slang--persona-butler)
2. [Domain 2: Database Supabase, Query Performance, Concurrency, & Relasi (Poin 51 – 90)](#domain-2-database-supabase-query-performance-concurrency--relasi)
3. [Domain 3: Perencanaan Hidup (Plans), Budgeting, & Logistik Trip (Poin 91 – 135)](#domain-3-perencanaan-hidup-plans-budgeting--logistik-trip)
4. [Domain 4: Analisis Finansial, Simulasi What-If, & Kredit Jago (Poin 136 – 180)](#domain-4-analisis-finansial-simulasi-what-if--kredit-jago)
5. [Domain 5: Strategi Operasional Gojek & Efisiensi Bahan Bakar (Poin 181 – 215)](#domain-5-strategi-operasional-gojek--efisiensi-bahan-bakar)
6. [Domain 6: Fitur Khusus: Split Bill, OCR Struk, & Voice Note (Poin 216 – 250)](#domain-6-fitur-khusus-split-bill-ocr-struk--voice-note)
7. [Domain 7: Ekosistem Telegram, Webhook, Background Cron, & Push (Poin 251 – 280)](#domain-7-ekosistem-telegram-webhook-background-cron--push)
8. [Domain 8: Mini App Dashboard, Keamanan Data, & Skalabilitas (Poin 281 – 305)](#domain-8-mini-app-dashboard-keamanan-data--skalabilitas)

---

## DOMAIN 1: KECERDASAN AI GEMINI, NLP, SLANG, & PERSONA BUTLER (Poin 1 – 50)

1. **Ambiguitas Pernyataan Rencana Bersyarat (*"Kalo Hujan Gak Jadi Narik"*)**  
   - *Lokasi:* `lib/gemini/prompts/chat.ts`  
   - *Gejala:* AI terkadang langsung membatalkan jadwal narik yang sudah tersimpan padahal hujan belum tentu terjadi.  
   - *Dampak:* Jadwal kerja terhapus prematur tanpa konfirmasi.

2. **Ketiadaan Validasi Rentang Waktu Lampau yang Terlalu Jauh (>5 Tahun Lalu)**  
   - *Lokasi:* `lib/gemini/prompts/chat.ts`  
   - *Gejala:* Salah ketik *"beli motor tahun 2019"* dicatat sebagai mutasi aktif bulan berjalan 2026.  
   - *Dampak:* Mendistorsi rata-rata pengeluaran bulanan.

3. **Pencampuran Mata Uang Aset Digital (USDT, BTC) ke Satuan Rupiah Biasa**  
   - *Lokasi:* `lib/gemini/prompts/chat.ts`  
   - *Gejala:* *"Beli 50 USDT"* bisa diekstrak Rp 50 perak karena ketiadaan kurs kripto.  
   - *Dampak:* Catatan aset kripto tidak proporsional.

4. **Halusinasi Menu Andalan pada Warung Tenda Kaki Lima Tradisional**  
   - *Lokasi:* `lib/gemini/prompts/chat.ts` (Aturan 23)  
   - *Gejala:* Warung tanpa rilis menu online dibuatkan menu fiktif oleh model AI.  
   - *Dampak:* Ekspektasi harga dan hidangan user tidak sesuai kenyataan di lapangan.

5. **Kehilangan Konteks Subjek saat User Menggunakan Kata Ganti Orang Multi-Turn (*"Dia, Mereka"*)**  
   - *Lokasi:* `lib/gemini/prompts/chat.ts`  
   - *Gejala:* Turn 1: *"Tadi ketemu Budi"*; Turn 2: *"Dia minjem 50rb"*. Nama Budi kadang hilang dari entitas piutang.  
   - *Dampak:* Piutang tercatat tanpa nama peminjam yang jelas.

6. **Kegagalan Deteksi Pembatalan Parsial (*"Bensin Jadi Beli, Kopinya Gak Jadi"*)**  
   - *Lokasi:* `lib/gemini/prompts/chat.ts`  
   - *Gejala:* AI mengekstrak bensin dan kopi sekaligus karena mendeteksi dua nama barang.  
   - *Dampak:* Pengeluaran kopi yang dibatalkan tetap tercatat.

7. **Penerjemahan Bahasa Gaul Singkatan Padat Medsos (*"Otw, COD, TF, Rekber, DP"*)**  
   - *Lokasi:* `lib/gemini/prompts/chat.ts`  
   - *Gejala:* *"DP kost 200k sisanya COD"* menjumlahkan total menjadi Rp 400.000 secara keliru.  
   - *Dampak:* Mutasi dicatat berlipat ganda.

8. **Respon Follow-Up AI yang Menanyakan Hal yang Sudah Tercatat di Database**  
   - *Lokasi:* `lib/gemini/prompts/chat.ts`  
   - *Gejala:* AI masih bertanya preferensi metode pembayaran padahal user sudah menyetel default Bank Jago.  
   - *Dampak:* Interaksi terasa bertele-tele dan tidak cerdas.

9. **Pencatatan Ganda pada Kalimat Klarifikasi Ulang (*"Maksudku yang 25rb tadi lho"*)**  
   - *Lokasi:* `lib/gemini/prompts/chat.ts`  
   - *Gejala:* AI mengira kalimat penjelas ini sebagai transaksi baru kedua.  
   - *Dampak:* Saldo dompet berkurang dua kali.

10. **Penanganan Typo Huruf Angka Serupa (*"5O.OOO" menggunakan huruf O bukan angka 0*)**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* Parser angka gagal membaca teks typo sehingga transaksi dilewati.  
    - *Dampak:* Catatan keuangan terlewat tanpa pemberitahuan.

11. **Ketiadaan Sensor Otomatis Terhadap Informasi Rahasia (PIN, Password, CVV)**  
    - *Lokasi:* `lib/telegram/chat-processor.ts`  
    - *Gejala:* PIN kartu yang tidak sengaja terketik tersimpan mentah di tabel `chat_history`.  
    - *Dampak:* Risiko kebocoran data sensitif jika log diinspeksi.

12. **Inkonsistensi Pemilihan Satuan Jarak (KM vs Meter vs Menit Tempuh)**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* Jarak ke tempat wisata terkadang menggunakan KM, terkadang jam tempuh tanpa standar.  
    - *Dampak:* User bingung membandingkan jarak antar destinasi.

13. **Kegagalan Ekstraksi Banyak Merchant Berbeda dalam Satu Sesi Belanja**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* *"Ke Indomaret beli snack 15rb terus ke Alfamart beli sabun 20rb"* digabung ke satu merchant.  
    - *Dampak:* Statistik top merchant menjadi bias.

14. **Halusinasi Waktu Tempuh Lalu Lintas pada Jam Sibuk (*Rush Hour Suhat*)**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* AI mengestimasi Suhat–Kepanjen 20 menit (aslinya 45–60 menit di jam pulang kantor).  
    - *Dampak:* Perjalanan terlambat dari jadwal yang direncanakan.

15. **Pengabaian Konteks Cuaca pada Saran Aktivitas Luar Ruangan (*Outdoor*)**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* Menyarankan sunset Bromo di bulan Januari (puncak musim hujan) tanpa mitigasi kabut.  
    - *Dampak:* Pengalaman wisata kurang maksimal.

16. **Ketidakmampuan Mengoreksi Nominal Mata Uang Ribuan yang Tertukar Jutaan**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* *"Beli nasi bungkus 15jt"* (typo maksudnya 15rb) langsung dicatat Rp 15.000.000.  
    - *Dampak:* Saldo kas langsung anjlok drastis akibat typo fatal.

17. **Ketiadaan Indikator Estimasi Waktu Tunggu Makanan di Sentra Kuliner Populer**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* Merekomendasikan Bakso President tanpa catatan antrean panjang 1 jam saat weekend.  
    - *Dampak:* Waktu perjalanan habis untuk menunggu makanan.

18. **Pencampuran Informasi Tempat Wisata yang Memiliki Nama Serupa di Kota Lain**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* "Alun-Alun Tugu" Malang tertukar rutenya dengan "Tugu Jogja".  
    - *Dampak:* Rekomendasi rute salah kota.

19. **Penafsiran Transaksi Talangan (*"Aku Talangin Dulu Uang Makan Rombongan"*)**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* Duit talangan dicatat sebagai beban biaya pribadi murni, bukan piutang.  
    - *Dampak:* Laporan bulanan pribadi tampak sangat boros.

20. **Kegagalan Deteksi Pembayaran Bertahap (*"Bayar DP 50%, Sisanya Bulan Depan"*)**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* Tidak membuat pengingat otomatis untuk jadwal pelunasan sisanya.  
    - *Dampak:* User berpotensi lupa melunasi tagihan tepat waktu.

21. **Ketiadaan Pembedaan Rekening Pribadi vs Dompet Kas Usaha Gojek**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* Modal bensin dan uang pribadi bercampur di satu laporan.  
    - *Dampak:* Margin keuntungan narik Gojek tidak terlihat jelas.

22. **Respon AI Terlalu Panjang pada Pertanyaan Jawaban Ya/Tidak Singkat**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* Bertanya satu kalimat singkat dibalas 4 paragraf panjang.  
    - *Dampak:* Pengalaman membaca di layar smartphone menjadi melelahkan.

23. **Ketiadaan Fitur Auto-Summarize saat Riwayat Percakapan Mendekati Batas Memori**  
    - *Lokasi:* `lib/supabase/queries/transactions.ts`  
    - *Gejala:* 50 pesan terakhir dimasukkan mentah ke konteks prompt Gemini.  
    - *Dampak:* Token prompt membengkak dan memperlambat response time.

24. **Pengabaian Jam Buka / Tutup Destinasi (*Day-Off / Hari Libur Museum*)**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* Merekomendasikan museum di hari Senin padahal museum tutup.  
    - *Dampak:* Wisatawan sampai di lokasi yang tutup.

25. **Pencampuran Bahasa Gaul Malang (*Boso Walikan: Oyi, Sam, Ker, Nawak*)**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* Kata "sam" dikira nama orang Sam, bukan sapaan "Mas".  
    - *Dampak:* Entitas nama orang salah diekstrak.

26. **Penanganan Angka Campuran Desimal Indonesia vs US (*1.500 vs 1,500*)**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* Tanda titik dan koma terkadang tertukar antara ribuan dan desimal.  
    - *Dampak:* Nominal Rp 1.500.000 terbaca Rp 1.500.

27. **Ketiadaan Deteksi Pengeluaran Berulang yang Tidak Disadari (*Subscription Leak*)**  
    - *Lokasi:* `lib/analytics/anomalies.ts`  
    - *Gejala:* Pengeluaran Spotify/Netflix yang tidak pernah dibuka tidak diberi peringatan cancel.  
    - *Dampak:* Pemborosan langganan pasif terus berjalan.

28. **Penyebutan Tempat Belanja Umum Tanpa Cabang Spesifik (*"Indomaret"* saja)**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* Merchant disimpan "Indomaret" tanpa nama jalan pembeda.  
    - *Dampak:* Analisis klaster lokasi belanja tidak mendalam.

29. **Kegagalan Pemahaman Konsep Diskon Bertingkat (*50% + 20%*)**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* Diskon 50%+20% dihitung sebagai diskon 70% (padahal aslinya 60%).  
    - *Dampak:* Perhitungan harga bersih barang salah.

30. **Ketidaksinkronan Suasana Emosi Persona Butler pada Jam Dini Hari**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* Chat jam 02.00 subuh disapa *"Selamat pagi yang cerah"* alih-alih mengingatkan istirahat.  
    - *Dampak:* Persona terasa artifisial dan kaku.

31. **Pengabaian Kategori Makanan Halal / Non-Halal pada Rekomendasi Kuliner**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* Tidak ada penandaan status kehalalan pada tempat kuliner baru.  
    - *Dampak:* Risiko kesalahan destinasi kuliner bagi pengguna muslim.

32. **Ketiadaan Validasi Kelayakan Usia Tempat Hiburan Malam**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* Tempat hiburan 21+ direkomendasikan tanpa label batasan usia.  
    - *Dampak:* Informasi kurang ramah keluarga.

33. **Penyebutan Informasi Tarif Tol yang Mengalami Kenaikan Terbaru**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* Tarif Tol Singosari–Pandaan menggunakan data tarif lama sebelum penyesuaian.  
    - *Dampak:* Saldo e-Toll kurang saat di gerbang tol.

34. **Ketiadaan Rekomendasi Titik Pengisian Saldo e-Toll / Top Up Terdekat**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* Mengingatkan tol tapi tidak menyarankan lokasi top up sebelum masuk tol.  
    - *Dampak:* Pengendara panik saat saldo e-Toll habis.

35. **Kegagalan Deteksi Pengeluaran Pajak Restoran Daerah PB1 (10%)**  
    - *Lokasi:* `lib/gemini/prompts/ocr-receipt.ts`  
    - *Gejala:* PB1 10% dikira item belanja tambahan berupa menu makanan.  
    - *Dampak:* Daftar rincian struk memuat item palsu bernama "PB1".

36. **Pencatatan Cashback Dompet Digital yang Mendistorsi Pengeluaran Asli**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* Beli barang 50rb dapat cashback 10rb dicatat pengeluaran 40rb (bukan 50rb exp + 10rb inc).  
    - *Dampak:* Rekonsiliasi struk fisik tidak cocok dengan mutasi rekening.

37. **Ketiadaan Opsi Bahasa Kasual / Formal pada Pengaturan Pengguna**  
    - *Lokasi:* `lib/supabase/queries/preferences.ts`  
    - *Gejala:* Gaya bahasa terkunci pada persona Butler, tidak bisa diubah ke gaya "Teman Santai".  
    - *Dampak:* Preferensi gaya komunikasi pengguna kurang fleksibel.

38. **Kegagalan Pemahaman Istilah Barter / Tukar Tambah Barang**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* *"Tukar tambah HP lama nambah 500rb"* dicatat sebagai beli HP baru seharga 500rb.  
    - *Dampak:* Nilai aset sebenarnya tidak tercatat akurat.

39. **Pencatatan Biaya Parkir Valet yang Tertukar dengan Parkir Biasa**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* Parkir valet Rp 30.000 dicatat sebagai parkir motor Rp 2.000.  
    - *Dampak:* Anggaran pos transportasi membengkak tanpa rincian jelas.

40. **Ketiadaan Rekomendasi Jalur Alternatif saat Jalur Utama Terkena Bencana Longsor**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* Jalur Payung Batu–Pujon longsor, AI tetap menyarankan rute tersebut.  
    - *Dampak:* Perjalanan terhambat bahaya jalan.

41. **Pengabaian Aturan Ganjil-Genap pada Kota Tertentu (Jakarta/Bali)**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* Menyarankan rute mobil pribadi tanpa cek plat nomor kendaraan pengguna.  
    - *Dampak:* Risiko terkena tilang elektronik.

42. **Ketiadaan Deteksi Pembelian Tiket Promo dengan Syarat Jam Tertentu (*Happy Hour*)**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* Menyebutkan harga promo padahal user berkunjung di luar jam promo.  
    - *Dampak:* Biaya riil lebih mahal dari estimasi AI.

43. **Pencampuran Biaya Masuk Kendaraan vs Tiket Per Orang**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* Tiket Bromo Rp 35.000/orang dicampur aduk dengan tiket motor Rp 5.000.  
    - *Dampak:* Total rombongan salah hitung.

44. **Kegagalan Deteksi Permintaan Rekomendasi Kuliner yang Cocok untuk Diet Tertentu**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* User meminta menu low-calorie/rendah gula, tetap disarankan menu bersantan manis.  
    - *Dampak:* Rencana pola hidup sehat terganggu.

45. **Ketiadaan Estimasi Biaya Laundry Pakaian saat Perjalanan Lebih dari 3 Hari**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* Rencana liburan panjang tidak memasukkan pos cuci baju kiloan.  
    - *Dampak:* Bawaan koper terlalu berat atau pos tak terduga muncul.

46. **Pengabaian Ketersediaan Fasilitas Stop Kontak / Wifi pada Kafe Tempat Bekerja (*WFC*)**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* Menyarankan kafe outdoor tanpa colokan listrik untuk kerja laptop.  
    - *Dampak:* Produktivitas terganggu karena baterai laptop habis.

47. **Pencatatan Tips / Uang Tambahan untuk Pelayan / Driver**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* Tips Rp 10.000 diabaikan dari total transaksi makanan.  
    - *Dampak:* Selisih kas fisik dengan pembukuan bot.

48. **Ketiadaan Pembedaan Biaya Rawat Jalan vs Rawat Inap pada Kesehatan**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* Berobat ke klinik dicatat pos belanja umum, bukan pos kesehatan darurat.  
    - *Dampak:* Rasio alokasi pos kesehatan tidak termonitor.

49. **Kegagalan Deteksi Transaksi Penjualan Barang Bekas (*Thrifting / Preloved*)**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* Jual baju bekas dicatat sebagai gaji/pemasukan rutin.  
    - *Dampak:* Proyeksi pendapatan bulanan terdistorsi pemasukan insidental.

50. **Ketiadaan Rekomendasi Waktu Kepulangan untuk Menghindari Kemacetan Akhir Pekan**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* Menyarankan pulang dari Batu Minggu malam jam 18.00 (puncak macet total arah Malang).  
    - *Dampak:* Terjebak macet 3 jam di jalan.

---

## DOMAIN 2: DATABASE SUPABASE, QUERY PERFORMANCE, CONCURRENCY, & RELASI (Poin 51 – 90)

51. **Ketiadaan Deadlock Detection pada Transaksi Konkuren Multi-Client**  
    - *Lokasi:* `lib/supabase/queries/transactions.ts`  
    - *Gejala:* Dua update paralel pada preferensi user dapat memicu lock timeout.  
    - *Dampak:* Request Telegram gagal diproses dengan status 500.

52. **Ketiadaan Constraint Format Email pada Tabel `users`**  
    - *Lokasi:* DDL Supabase `users`  
    - *Gejala:* Format email tidak valid bisa tersimpan via API pendaftaran.  
    - *Dampak:* Notifikasi email gagal terkirim selamanya.

53. **Tidak Ada Fitur Restore Data Soft-Delete (*Undelete Command*)**  
    - *Lokasi:* `lib/supabase/queries/transactions.ts`  
    - *Gejala:* Data yang tidak sengaja terhapus tidak bisa dipulihkan via chat Telegram.  
    - *Dampak:* User harus menghubungi admin database untuk recovery data.

54. **Pencarian ILIKE yang Gagal pada Input Spasi Ganda (*Double Whitespace*)**  
    - *Lokasi:* `lib/supabase/queries/transactions.ts`  
    - *Gejala:* `"TX-  2D309E"` tidak ditemukan di database.  
    - *Dampak:* Edit/hapus transaksi via Short ID gagal.

55. **Ketiadaan Kolom `exchange_rate` pada Tabel Transaksi Valuta Asing**  
    - *Lokasi:* Tabel `transactions`  
    - *Gejala:* Nilai tukar saat transaksi $10 USD tidak tersimpan di database.  
    - *Dampak:* Tidak bisa merekonstruksi nilai kurs historis saat audit keuangan.

56. **Inkonsistensi Nilai Default Boolean Kolom Supabase (`NULL` vs `FALSE`)**  
    - *Lokasi:* DDL Supabase  
    - *Gejala:* Query `.eq('is_completed', false)` mengabaikan record berstatus `NULL`.  
    - *Dampak:* Hitungan agenda pending tidak akurat.

57. **Tidak Ada Indeks GIN pada Kolom JSONB `items` Struk Belanja**  
    - *Lokasi:* Tabel `transactions` (`items`)  
    - *Gejala:* Pencarian riwayat item belanja memindai seluruh row tabel (*Sequential Scan*).  
    - *Dampak:* Query melambat drastis saat database membesar.

58. **Ketiadaan Constraint Panjang Nomor Handphone Pengguna**  
    - *Lokasi:* Tabel `users`  
    - *Gejala:* Nomor HP typo 4 digit tersimpan di database.  
    - *Dampak:* Integrasi SMS/WhatsApp gateway gagal.

59. **Pembersihan Cache Preferensi Pengguna yang Tidak Otomatis saat Terjadi Update**  
    - *Lokasi:* `lib/supabase/queries/preferences.ts`  
    - *Gejala:* Preferensi baru baru terbaca setelah jeda beberapa detik.  
    - *Dampak:* Respon bot masih mengacu pada data usang.

60. **Ketiadaan Tracking IP Address & User Agent pada Sesi Login Mini App**  
    - *Lokasi:* `lib/supabase/queries/sessions.ts`  
    - *Gejala:* Tidak ada jejak audit perangkat yang mengakses dashboard web.  
    - *Dampak:* Keamanan akun kurang terpantau.

61. **Tidak Ada Penguncian Baris (*Row-Level Locking / FOR UPDATE*) saat Mutasi Saldo**  
    - *Lokasi:* `lib/supabase/queries/transactions.ts`  
    - *Gejala:* Dua mutasi paralel membaca saldo awal yang sama sebelum menulis update.  
    - *Dampak:* Saldo akhir mengalami *Race Condition* selisih hitung.

62. **Format Kolom `priority` Aktivitas Masih Menggunakan String Bebas Tanpa Enum DB**  
    - *Lokasi:* Tabel `activities`  
    - *Gejala:* Typo status prioritas tersimpan bebas di database.  
    - *Dampak:* Filter prioritas mendesak melewatkan agenda penting.

63. **Ketiadaan Skema Partisi Tabel Riwayat Chat Berdasarkan Bulan/Tahun**  
    - *Lokasi:* Tabel `chat_history`  
    - *Gejala:* Tabel chat membengkak jutaan baris dan memperlambat backup database.  
    - *Dampak:* Waktu maintenance database semakin lama.

64. **Ketergantungan Kuat pada UUID v4 Tanpa Urutan Waktu (*Time-Ordered UUID v7*)**  
    - *Lokasi:* Seluruh tabel Supabase  
    - *Gejala:* Fragmentasi indeks B-Tree pada PostgreSQL.  
    - *Dampak:* Konsumsi memori cache RAM database lebih boros.

65. **Ketiadaan Foreign Key Constraint antara `user_settings` dan `users`**  
    - *Lokasi:* DDL Supabase  
    - *Gejala:* Row setting tertinggal di database saat akun pengguna dihapus.  
    - *Dampak:* Data sampah menumpuk di database (*Orphaned Rows*).

66. **Tidak Ada Validasi Rentang Nilai Persentase Bunga `(0 <= bunga <= 100)`**  
    - *Lokasi:* Tabel `installments`  
    - *Gejala:* Salah input 299% menyebabkan kalkulasi bunga membengkak liar.  
    - *Dampak:* Proyeksi keuangan menghasilkan angka triliunan tidak masuk akal.

67. **Ketiadaan Kolom `location_coordinates` Berformat PostGIS Geometry**  
    - *Lokasi:* Tabel `transactions`  
    - *Gejala:* Tidak bisa query transaksi berdasarkan radius jarak geografis.  
    - *Dampak:* Fitur analitik berbasis peta lokal tidak optimal.

68. **Penyimpanan Password Pasangan Tanpa Hashing Tambahan di Level Enkripsi DB**  
    - *Lokasi:* `lib/features/couples.ts`  
    - *Gejala:* Verifikasi pasangan hanya mengandalkan ID telegram polos.  
    - *Dampak:* Risiko linking akun pasangan yang salah sasaran.

69. **Ketiadaan Database Read-Replica Routing untuk Query Analitik Berat**  
    - *Lokasi:* `lib/supabase/client.ts`  
    - *Gejala:* Perhitungan 20 grafik analitik membebani instance database operasional.  
    - *Dampak:* Latensi bot Telegram meningkat saat dashboard web dibuka.

70. **Tidak Ada Indikator Status Konektivitas Database (*Connection Health Ping*)**  
    - *Lokasi:* `lib/supabase/client.ts`  
    - *Gejala:* Bot mencoba query tanpa tahu status server database sedang maintenance.  
    - *Dampak:* User mendapat error generic tanpa penjelasan yang bersahabat.

71. **Ketiadaan Trigger Database untuk Auto-Update Kolom `updated_at`**  
    - *Lokasi:* Seluruh tabel Supabase  
    - *Gejala:* Edit data manual via Supabase Dashboard tidak memperbarui waktu `updated_at`.  
    - *Dampak:* Log sinkronisasi waktu menjadi rancu.

72. **Pencatatan Nilai Negatif pada Kolom Pengeluaran yang Mengacaukan Agregasi `SUM()`**  
    - *Lokasi:* Tabel `transactions`  
    - *Gejala:* Nilai `-50000` pada transaksi tipe expense menyebabkan `SUM()` berkurang.  
    - *Dampak:* Total pengeluaran tampak lebih kecil dari aslinya.

73. **Ketiadaan Constraint Unik pada Kombinasi `(user_id, service_name)` di Subscriptions**  
    - *Lokasi:* Tabel `subscriptions`  
    - *Gejala:* Langganan Spotify bisa tersimpan dua kali.  
    - *Dampak:* Peringatan tagihan bulanan dikirim dobel.

74. **Tidak Ada Index Gabungan pada `(user_id, status)` di Tabel `debts`**  
    - *Lokasi:* Tabel `debts`  
    - *Gejala:* Query mencari hutang yang belum lunas (`status = 'unpaid'`) lambat.  
    - *Dampak:* Ringkasan hutang di chat Telegram memakan waktu lebih lama.

75. **Format Tanggal String Tanpa Validasi ISO 8601 di Kolom `due_date`**  
    - *Lokasi:* Tabel `debts`  
    - *Gejala:* Tanggal tersimpan dalam format acak `"besok"`, memicu crash saat di-parse `new Date()`.  
    - *Dampak:* Bot gagal mengirimkan reminder jatuh tempo.

76. **Ketiadaan Batasan Ukuran Maksimal String pada Kolom `notes`**  
    - *Lokasi:* Tabel `transactions`  
    - *Gejala:* Catatan transaksi sepanjang 100.000 karakter bisa masuk ke database.  
    - *Dampak:* Ekspor PDF/CSV mengalami buffer overflow.

77. **Tidak Ada Index pada Kolom `telegram_id` di Tabel `users`**  
    - *Lokasi:* Tabel `users`  
    - *Gejala:* Setiap pesan Telegram masuk harus melakukan full table scan mencari user.  
    - *Dampak:* Respon bot melambat seiring bertambahnya jumlah user.

78. **Ketiadaan Partitioning pada Log Audit Perubahan Data**  
    - *Lokasi:* Database Supabase  
    - *Gejala:* Tabel log historis membengkak tanpa arsip otomatis.  
    - *Dampak:* Storage Supabase cepat penuh.

79. **Format Enum Kategori yang Tidak Terisolasi per User Tenant**  
    - *Lokasi:* Tabel `categories`  
    - *Gejala:* Kategori default sistem tercampur dengan kategori custom pribadi user.  
    - *Dampak:* Tampilan dropdown kategori menjadi sangat berantakan.

80. **Ketiadaan Mekanisme Vacuum Analyze Otomatis Pasca Hapus Massal**  
    - *Lokasi:* Database Supabase  
    - *Gejala:* Menghapus 1.000 transaksi meninggalkan dead tuples di disk Postgres.  
    - *Dampak:* Performa query menurun pasca pembersihan data.

81. **Tidak Ada Constraint Cek Angka Positif pada `target_amount` Tabel `plans`**  
    - *Lokasi:* Tabel `plans`  
    - *Gejala:* Rencana dengan budget Rp 0 atau negatif bisa tersimpan.  
    - *Dampak:* Progress tabungan menghasilkan nilai `Infinity%`.

82. **Ketiadaan Validasi Tanggal Rencana Tidak Boleh Lebih Lampau dari Hari Ini**  
    - *Lokasi:* Tabel `plans`  
    - *Gejala:* Rencana dengan deadline tahun 2020 tetap berstatus `active`.  
    - *Dampak:* Reminder rencana kadaluarsa terus berbunyi.

83. **Penyimpanan ID Telegram sebagai Integer 32-Bit yang Rawan Overflow**  
    - *Lokasi:* Tabel `users`  
    - *Gejala:* ID Telegram 64-bit baru menghasilkan error database integer overflow.  
    - *Dampak:* Pengguna baru Telegram tidak bisa registrasi.

84. **Ketiadaan Kolom `currency_code` Standar ISO 4217 (IDR, USD, SGD, JPY)**  
    - *Lokasi:* Tabel `transactions`  
    - *Gejala:* Seluruh transaksi diasumsikan Rupiah tanpa kode mata uang internasional.  
    - *Dampak:* Integrasi multi-mata uang terhambat.

85. **Tidak Ada Indeks pada Kolom `created_at` di Tabel `batch_jobs`**  
    - *Lokasi:* Tabel `batch_jobs`  
    - *Gejala:* Cek progress job background lambat saat job historis menumpuk.  
    - *Dampak:* Polling status job membebani server.

86. **Ketiadaan Proteksi SQL Injection pada Custom Filter Search Ekspor Data**  
    - *Lokasi:* `lib/export/export-data.ts`  
    - *Gejala:* Filter teks dari query string langsung disematkan ke query builder tanpa sanitasi.  
    - *Dampak:* Potensi kerentanan keamanan database.

87. **Penyimpanan Nilai Saldo Tanpa Satuan Satuan Terkecil (Cent / Desimal Presisi)**  
    - *Lokasi:* Tabel `transactions`  
    - *Gejala:* Pembulatan transaksi valas menghasilkan selisih beberapa sen.  
    - *Dampak:* Rekonsiliasi devisa tidak seimbang sempurna.

88. **Ketiadaan Fitur Snapshot Backup Harian Database Otomatis ke Cloud Storage**  
    - *Lokasi:* Database Supabase  
    - *Gejala:* Mengandalkan backup bawaan tanpa salinan offsite terenkripsi.  
    - *Dampak:* Risiko kehilangan data jika terjadi insiden cloud.

89. **Tidak Ada Rate Limiting di Level Database Extension (*pg_net / pg_stat*)**  
    - *Lokasi:* Database Supabase  
    - *Gejala:* Serangan flood webhook langsung menghantam CPU database.  
    - *Dampak:* Database mengalami lonjakan CPU 100%.

90. **Ketiadaan Kolom `device_fingerprint` untuk Validasi Sesi Webview**  
    - *Lokasi:* Tabel `sessions`  
    - *Gejala:* Token sesi bisa dipindahkan antar browser tanpa terdeteksi.  
    - *Dampak:* Sesi rentan dibajak jika URL dashboard bocor.

---

## DOMAIN 3: PERENCANAAN HIDUP (PLANS), BUDGETING, & LOGISTIK TRIP (Poin 91 – 135)

91. **Ketiadaan Alokasi Biaya Parkir & Retribusi Tempat Wisata Sekitar Rute Dieng**  
    - *Lokasi:* Tabel `plans` (Rincian Dieng)  
    - *Gejala:* Parkir Sikidang (5k), Telaga Warna (15k), Candi Arjuna (20k) belum masuk pos rincian.  
    - *Dampak:* Biaya tak terduga muncul di lokasi wisata.

92. **Perhitungan Hari Nabung Mengabaikan Beban Cicilan Bank Jago Tanggal 20**  
    - *Lokasi:* `lib/analytics/calculators.ts`  
    - *Gejala:* Mengasumsikan seluruh hasil narik Gojek bisa ditabung untuk Dieng tanpa potong cicilan Rp 67.940.  
    - *Dampak:* Uang cicilan terpakai untuk tabungan liburan.

93. **Tidak Ada Rekomendasi Homestay Berpemanas Air (*Water Heater*) di Dieng**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* Suhu Dieng malam hari 5°C; homestay tanpa air panas menyulitkan mandi subuh.  
    - *Dampak:* Kenyamanan perjalanan terganggu suhu dingin ekstrem.

94. **Ketiadaan Estimasi Waktu Istirahat Fisik Pengemudi Motor Malang–Dieng (8–9 Jam)**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* Rute motor Malang–Dieng butuh minimal 2–3 kali istirahat agar tidak hilang fokus berkendara.  
    - *Dampak:* Risiko kelelahan dan kantuk di jalan.

95. **Tidak Ada Fitur Realokasi Anggaran Fleksibel Antar-Pos Belanja**  
    - *Lokasi:* Tabel `plans`  
    - *Gejala:* Sisa pos pakaian Rp 50.000 tidak otomatis dialihkan ke pos kuliner.  
    - *Dampak:* Anggaran sisa mengendap tanpa fleksibilitas.

96. **Pengabaian Risiko Fenomena Embun Es / Embun Upas (*Frost Dieng*)**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* Puncak embun es terjadi bulan Juli–Agustus; tidak ada panduan jaket polar tebal.  
    - *Dampak:* Wisatawan kedinginan ekstrem tanpa persiapan baju hangat.

97. **Ketiadaan Pos Belanja Oleh-Oleh Khas (Carica, Kentang Merah, Purwaceng)**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* Belanja oleh-oleh khas Dieng tercampur di pos makan harian.  
    - *Dampak:* Uang makan habis terpakai membeli oleh-oleh.

98. **Tidak Ada Rekomendasi Jam Keberangkatan Terbaik dari Malang Menghindari Macet**  
    - *Lokasi:* `lib/gemini/prompts/chat.ts`  
    - *Gejala:* Berangkat siang terjebak macet Kertosono; waktu ideal berangkat subuh 04.30 WIB.  
    - *Dampak:* Waktu tempuh molor 3 jam lebih lama.

99. **Ketiadaan Integrasi Status Pemesanan Tiket Online / Kuota Simaksi**  
    - *Lokasi:* Tabel `plans`  
    - *Gejala:* Tempat wisata alam mewajibkan booking H-7; tidak ada pengingat kuota tiket.  
    - *Dampak:* Sampai di lokasi ternyata kuota tiket masuk sudah habis.

100. **Perhitungan Target Narik Gojek Mengabaikan Biaya Makan Siang Driver**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Target bersih Rp 85.000/hari belum dipotong makan siang driver Rp 15.000.  
     - *Dampak:* Target tabungan riil meleset dari rencana awal.

101. **Ketiadaan Checklist Kelayakan Kendaraan Bermotor Sebelum Berangkat**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts` (Aturan 27)  
     - *Gejala:* Tanjakan Dieng curam; belum ada checklist: oli mesin, rem, tekanan ban, busi.  
     - *Dampak:* Kendaraan berisiko mogok di tanjakan ekstrem.

102. **Tidak Ada Alternatif Destinasi Cadangan saat Tempat Utama Ditutup Mendadak**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Kawah Sikidang tutup gas beracun, tidak ada opsi Plan B (Telaga Dringo / Curug Sikarim).  
     - *Dampak:* Jadwal perjalanan menjadi berantakan.

103. **Ketiadaan Fitur Hitung Mundur Hari (*D-Day Countdown*) di Briefing Pagi**  
     - *Lokasi:* `app/api/cron/briefing/route.ts`  
     - *Gejala:* Pesan pagi belum menampilkan: *"🏔️ H-4 Menuju Trip Dieng! Tabungan 80%"*.  
     - *Dampak:* Antusiasme dan pengingat nabung harian kurang terasa.

104. **Pengabaian Jam Buka Warung Makan Malam di Kawasan Wisata Pegunungan**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Warung Dieng mayoritas tutup jam 20.00 WIB; tidak ada anjuran makan malam lebih awal.  
     - *Dampak:* Wisatawan kelaparan di malam hari karena warung sudah tutup semua.

105. **Tidak Ada Pembedaan Budget Liburan Sendiri (*Solo*) vs Rombongan**  
     - *Lokasi:* Tabel `plans`  
     - *Gejala:* Sewa homestay rombongan jauh lebih hemat per orang dibanding hotel sendirian.  
     - *Dampak:* Estimasi budget perjalanan tidak realistis.

106. **Ketiadaan Estimasi Blank Spot Sinyal Seluler di Kawasan Pegunungan**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Tidak ada saran mengunduh peta offline Google Maps sebelum berangkat.  
     - *Dampak:* Kehilangan navigasi arah saat sinyal seluler hilang.

107. **Tidak Ada Nomor Kontak Darurat Lokal (Polsek, Puskesmas, SAR Dieng)**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Rencana perjalanan belum memuat nomor telepon darurat di tempat tujuan.  
     - *Dampak:* Sulit mencari bantuan saat terjadi insiden darurat.

108. **Ketiadaan Panduan Pecahan Uang Tunai Kecil untuk Pembayaran Parkir & Toilet**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Di Dieng toilet & parkir tidak menerima QRIS; butuh uang kertas pecahan 2k/5k.  
     - *Dampak:* Kesulitan bayar toilet/parkir karena hanya membawa uang pecahan 100k.

109. **Pengabaian Titik Singgah Sholat & Istirahat di Masjid Besar Rute Perjalanan**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Rute belum menyertakan titik singgah sholat nyaman (seperti Masjid Agung Wonosobo).  
     - *Dampak:* Waktu sholat tertunda karena bingung mencari masjid bersih di jalan.

110. **Ketiadaan Evaluasi Pasca-Liburan (*Post-Trip Realization vs Budget*)**  
     - *Lokasi:* `lib/analytics/calculators.ts`  
     - *Gejala:* Setelah tanggal 30 Agustus tidak ada tabel komparasi: Rencana vs Realisasi Belanja.  
     - *Dampak:* Tidak ada evaluasi finansial untuk perjalanan liburan berikutnya.

111. **Tidak Ada Opsi Ekspor Itinerary Trip ke Format Brosur PDF Eksklusif**  
     - *Lokasi:* `lib/features/pdf-report.ts`  
     - *Gejala:* Jadwal trip hanya berupa teks chat, belum bisa dicetak dalam bentuk draf jadwal visual.  
     - *Dampak:* Kurang praktis dibagikan ke teman rombongan perjalanan.

112. **Ketiadaan Rekomendasi Spot Sunrise Alternatif jika Sikunir Macet Total**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Sikunir sering macet di libur panjang; alternatif: *Batu Ratapan Angin / Tieng*.  
     - *Dampak:* Kehilangan momen sunrise karena terjebak macet di kaki bukit Sikunir.

113. **Tidak Ada Pengingat Jadwal Pengembalian Barang Sewaan (Tenda / Alat Camping)**  
     - *Lokasi:* Tabel `activities`  
     - *Gejala:* Tidak ada agenda pengingat batas waktu pengembalian alat sewa pasca-trip.  
     - *Dampak:* Denda sewa keterlambatan alat camping membengkak.

114. **Ketiadaan Auto-Tagging Pengeluaran Selama Trip ke Kode Anggaran Rencana**  
     - *Lokasi:* `lib/telegram/chat-processor.ts`  
     - *Gejala:* Belanja di Dieng tidak otomatis terhubung memotong sisa anggaran trip.  
     - *Dampak:* User harus menghitung sisa budget trip secara manual.

115. **Tidak Ada Estimasi Tambahan Retribusi Masuk Gerbang Kawasan per Kendaraan**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Gerbang masuk utama Dieng mengenakan retribusi motor 5k / mobil 10k di luar tiket objek.  
     - *Dampak:* Muncul pos pengeluaran kecil tak terduga.

116. **Pengabaian Perbedaan Suhu Ekstrem Siang vs Malam di Pegunungan**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Siang hari terik 24°C, malam anjlok 3°C; butuh pakaian ganti berlapis (*layering system*).  
     - *Dampak:* Salah memilih jenis pakaian saat beraktivitas siang dan malam.

117. **Ketiadaan Rekomendasi Titik SPBU Terakhir Sebelum Memasuki Tanjakan Wonosobo**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Tidak ada saran isi bensin penuh di Wonosobo kota sebelum naik ke Dieng.  
     - *Dampak:* Kehabisan bensin di tanjakan sepi SPBU.

118. **Tidak Ada Penilaian Kelayakan Fisik untuk Rute Pendakian Ringan Sikunir (30 Menit)**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Tangga Sikunir curam dan tipis oksigen; butuh pemanasan fisik dan jalan santai.  
     - *Dampak:* Mengalami kram kaki atau sesak napas saat mendaki subuh.

119. **Ketiadaan Rekomendasi Makanan Penghangat Khas (Mie Ongklok & Tempe Kemul)**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Kuliner khas penghangat tubuh Wonosobo belum masuk rekomendasi utama.  
     - *Dampak:* Melewatkan kuliner legendaris yang pas dengan cuaca dingin Dieng.

120. **Tidak Ada Rekomendasi Perlindungan Kamera & Gadget dari Embun Dingin Ekstrem**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Lensa kamera berembun tebal dan baterai HP cepat drop akibat suhu beku.  
     - *Dampak:* Tidak bisa mengambil foto kenang-kenangan karena baterai HP mati mendadak.

121. **Ketiadaan Estimasi Biaya Sewa Jeep Keliling Spot Wisata Terpencil**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Tarif sewa jeep wisata Dieng (Rp 350.000 - Rp 500.000) belum masuk opsi alternatif.  
     - *Dampak:* Tidak tahu opsi transportasi jika tidak ingin mengendarai motor di medan berbatu.

122. **Pengabaian Jam Buka Kawah Sikidang Terkait Aktivitas Gas Belerang Pagi**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Waktu berkunjung terbaik kawah adalah pagi pukul 07.00–09.00 saat asap belum terlalu pekat.  
     - *Dampak:* Menghirup bau belerang terlalu menyengat di siang hari.

123. **Tidak Ada Panduan Membawa Masker Medis / Kain untuk Filter Udara Belerang**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Masker wajib dibawa saat mengunjungi Kawah Sikidang / Kawah Candradimuka.  
     - *Dampak:* Batuk dan sesak napas akibat asap belerang kawah.

124. **Ketiadaan Info Waktu Operasional Candi Arjuna Night Light Festival (Jika Ada)**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Penerangan malam candi hanya beroperasi pada event festival tertentu.  
     - *Dampak:* Kecewa datang malam hari ternyata kawasan candi gelap gulita.

125. **Tidak Ada Estimasi Biaya Penitipan Helm & Jaket di Pos Pendakian**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Titip helm di warung pos Sikunir dikenakan biaya sukarela Rp 2.000 - Rp 5.000.  
     - *Dampak:* Membawa helm mendaki tangga bukit karena tidak tahu ada tempat penitipan.

126. **Ketiadaan Info Tiket Terusan Dieng Pass (Sikidang + Telaga Warna)**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Membeli tiket satuan lebih mahal dibanding membeli paket tiket terusan resmi.  
     - *Dampak:* Pengeluaran tiket masuk lebih boros dari yang seharusnya.

127. **Pengabaian Larangan Menyalakan Api Unggun Sembarangan di Savana Kering**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Musim kemarau savana mudah terbakar; ada larangan ketat api unggun.  
     - *Dampak:* Risiko denda pelanggaran aturan konservasi alam.

128. **Tidak Ada Panduan Etika Adat & Tradisi Ruwatan Rambut Gimbal Dieng**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Kearifan lokal anak rambut gimbal memiliki nilai sakral bagi masyarakat Dieng.  
     - *Dampak:* Kurang memahami norma kesopanan saat berinteraksi dengan warga lokal.

129. **Ketiadaan Rekomendasi Spot Foto Sunset Terbaik (Batu Angin / Telaga Warna dari Atas)**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Hanya menyarankan spot sunrise, melewatkan pemandangan sunset spektakuler.  
     - *Dampak:* Waktu sore hari terbuang tanpa aktivitas menarik.

130. **Tidak Ada Informasi Titik Tambal Ban & Bengkel Motor Terdekat di Jalur Pegunungan**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Tidak ada info lokasi tambal ban jika mengalami ban bocor di tanjakan Kejajar.  
     - *Dampak:* Mendorong motor jauh mencari bengkel.

131. **Ketiadaan Estimasi Waktu Tempuh Pulang dari Dieng ke Malang Melalui Jalur Tol Solo**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Pulang via Tol Solo–Kertosono jauh lebih cepat (6 jam) dibanding jalur arteri bawah.  
     - *Dampak:* Melewatkan opsi pulang lebih cepat saat badan lelah.

132. **Tidak Ada Rincian Biaya e-Toll Tol Solo–Malang untuk Kepulangan Cepat**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Tarif Tol Colomadu–Singosari (~Rp 320.000) belum masuk perhitungan pos alternatif.  
     - *Dampak:* Saldo e-Toll tidak mencukupi jika mendadak ingin pulang lewat tol.

133. **Ketiadaan Rekomendasi Tempat Istirahat Makan Malam di Rest Area Tol Sragen/Ngawi**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Rest Area KM 519 / KM 575 memiliki fasilitas musholla luas dan kuliner lengkap.  
     - *Dampak:* Berhenti di rest area kecil yang minim fasilitas saat perjalanan pulang.

134. **Tidak Ada Checklist Barang Bawaan Kembali (Memastikan Tidak Ada Baju Ketinggalan di Homestay)**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* H-1 pulang tidak ada pengingat periksa charger HP, jaket, dan dompet di kamar.  
     - *Dampak:* Barang pribadi berharga tertinggal di penginapan.

135. **Ketiadaan Fitur Simpan Foto Kenangan / Link Google Drive Dokumentasi Trip di Catatan Rencana**  
     - *Lokasi:* Tabel `plans`  
     - *Gejala:* Tidak ada kolom tautan link album foto liburan pada kartu arsip rencana trip.  
     - *Dampak:* Dokumentasi foto tercecer terpisah dari catatan anggaran asisten.

---

## DOMAIN 4: ANALISIS FINANSIAL, SIMULASI WHAT-IF, & KREDIT JAGO (Poin 136 – 180)

136. **Perhitungan Bunga Pinjaman Bank Jago Mengabaikan Bunga Anuitas Efektif vs Flat**  
     - *Lokasi:* `lib/analytics/calculators.ts`  
     - *Gejala:* Pinjaman Rp 600.000 bunga 2.99%/bulan dihitung flat padahal saldo pokok terus menurun.  
     - *Dampak:* Estimasi sisa pokok pinjaman ada selisih hitung beberapa ribu rupiah.

137. **Simulasi Proyeksi Akhir Bulan Mengasumsikan Pengeluaran Konstan di Tanggal 1–5**  
     - *Lokasi:* `lib/analytics/calculators.ts`  
     - *Gejala:* Pengeluaran besar awal bulan (bayar kontrakan) membuat proyeksi akhir bulan tampak triliunan.  
     - *Dampak:* Grafik proyeksi membengkak tidak realistis.

138. **Ketiadaan Pengingat Tagihan Autodebet Bank Jago H-3 Sebelum Tanggal 20**  
     - *Lokasi:* `app/api/cron/briefing/route.ts`  
     - *Gejala:* Tanggal 17–19 belum ada alert peringatan autodebet Rp 67.940.  
     - *Dampak:* Saldo Bank Jago kosong saat tanggal penarikan autodebet tiba.

139. **Detektor Anomali Terlalu Sensitif pada Pembelian Penting yang Terencana**  
     - *Lokasi:* `lib/analytics/anomalies.ts`  
     - *Gejala:* Belanja buku skripsi Rp 150.000 dianggap anomali boros hanya karena rata-rata jajan harian 20k.  
     - *Dampak:* Muncul peringatan pemborosan palsu (*False Alarm*).

140. **Rasio Tabungan (*Savings Ratio*) Menghasilkan Pembagian Nol jika Belum Ada Pemasukan**  
     - *Lokasi:* `lib/analytics/calculators.ts`  
     - *Gejala:* Di awal bulan saat pemasukan Rp 0, skor kesehatan langsung anjlok ke level bahaya.  
     - *Dampak:* Evaluasi skor finansial bias di awal bulan.

141. **Ketiadaan Simulasi Skenario Bencana Finansial (*Worst-Case Stress Test 14 Hari Motor Mogok*)**  
     - *Lokasi:* `lib/analytics/calculators.ts`  
     - *Gejala:* Belum ada kalkulasi berapa lama saldo dompet bertahan jika tidak bisa narik Gojek 14 hari.  
     - *Dampak:* Ketahanan dana darurat tidak teruji secara riil.

142. **Pengabaian Biaya Admin & Biaya Transfer Antar-Bank Non-BI FAST (Rp 2.500 - Rp 6.500)**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Transfer antar bank tidak mencatat estimasi biaya admin.  
     - *Dampak:* Saldo rekening riil berselisih biaya transfer.

143. **Kalkulasi Net Cash Flow Tidak Menampilkan Saldo Minimum Cadangan Aman (*Safety Buffer*)**  
     - *Lokasi:* `lib/analytics/calculators.ts`  
     - *Gejala:* Saldo bersih dinyatakan aman padahal sisa uang kas mendekati Rp 0.  
     - *Dampak:* User merasa aman padahal likuiditas harian kritis.

144. **Ketiadaan Pengelompokan Tagihan Tetap (*Fixed Cost*) vs Fleksibel (*Variable Cost*)**  
     - *Lokasi:* `lib/analytics/calculators.ts`  
     - *Gejala:* Uang jajan disamakan prioritasnya dengan tagihan wajib bulanan di grafik.  
     - *Dampak:* Sulit menentukan pos mana yang harus dipangkas saat berhemat.

145. **Tidak Ada Rekomendasi Dompet Terbaik Berdasarkan Promo / Biaya Top Up**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Tidak menyarankan pakai SeaBank/Jago untuk bebas biaya transfer.  
     - *Dampak:* Terkena biaya admin top up yang sebenarnya bisa dihindari.

146. **Perhitungan Sisa Hutang Piutang Tidak Mengurangi Nominal Pembayaran Cicilan Parsial**  
     - *Lokasi:* `lib/features/smart-alerts.ts`  
     - *Gejala:* Teman bayar hutang 20rb dari total 50rb, status hutang tetap 50rb `unpaid`.  
     - *Dampak:* Nilai piutang tercatat lebih besar dari kenyataan.

147. **Ketiadaan Analisis Efisiensi Biaya Operasional Gojek (Bensin vs Pendapatan Harian)**  
     - *Lokasi:* `lib/analytics/calculators.ts`  
     - *Gejala:* Belum ada metrik berapa % uang bensin yang dihabiskan untuk meraih 100k omset.  
     - *Dampak:* Tidak tahu apakah narik hari ini menguntungkan atau tekor bensin.

148. **Perhitungan Hari Efektif Nabung yang Mengabaikan Hari Libur Mingguan Driver**  
     - *Lokasi:* `lib/analytics/calculators.ts`  
     - *Gejala:* Mengasumsikan narik nonstop 30 hari tanpa libur istirahat.  
     - *Dampak:* Target tabungan terlalu berat dan tidak realistis bagi fisik driver.

149. **Ketiadaan Rekapitulasi Alokasi Zakat Penghasilan / Sedekah Rutin (2.5%)**  
     - *Lokasi:* `lib/analytics/calculators.ts`  
     - *Gejala:* Pemasukan bulanan tidak memunculkan opsi alokasi 2.5% zakat profesi.  
     - *Dampak:* Kewajiban zakat/infaq terlewat dari pembukuan.

150. **Tidak Ada Peringatan Saldo E-Wallet Mengendap Terlalu Lama Tanpa Bunga Tabungan**  
     - *Lokasi:* `lib/analytics/anomalies.ts`  
     - *Gejala:* Saldo ShopeePay/Gopay menumpuk >500k tidak disarankan dipindah ke SeaBank berbunga harian.  
     - *Dampak:* Kehilangan potensi pendapatan bunga harian.

151. **Kalkulasi Burn Rate Mengabaikan Lonjakan Musim Libur Panjang Nasional**  
     - *Lokasi:* `lib/analytics/calculators.ts`  
     - *Gejala:* Pengeluaran hari libur mendistorsi rata-rata pengeluaran bulan reguler.  
     - *Dampak:* Proyeksi kebutuhan kas bulanan menjadi tidak tepat.

152. **Ketiadaan Pelacakan Biaya Penyusutan Nilai Aset Kendaraan Motor Bermotor**  
     - *Lokasi:* Tabel `transactions`  
     - *Gejala:* Servis motor dicatat belanja konsumtif, bukan depresiasi/perawatan aset modal.  
     - *Dampak:* Nilai kekayaan bersih aset motor tidak termonitor.

153. **Tidak Ada Analisis Jam Kerja Paling Produktif untuk Menghasilkan Pendapatan Gojek**  
     - *Lokasi:* `lib/analytics/calculators.ts`  
     - *Gejala:* Belum ada komparasi: narik pagi (06-10) vs sore (16-20) mana yang lebih cuan.  
     - *Dampak:* Waktu kerja kurang optimal menghasilkan omset maksimal.

154. **Ketiadaan Rekomendasi Batas Maksimal Belanja Harian (*Daily Safe Spending Limit*)**  
     - *Lokasi:* `lib/telegram/chat-processor.ts`  
     - *Gejala:* Bot belum menampilkan: *"Sisa uang belanja aman hari ini: Rp 25.000"*.  
     - *Dampak:* Pengguna tidak tahu kapan harus rem jajan harian.

155. **Pengabaian Potensi Penalti Denda Keterlambatan Bayar Cicilan Pinjaman Bank**  
     - *Lokasi:* `lib/analytics/calculators.ts`  
     - *Gejala:* Simulasi telat bayar tidak menghitung estimasi denda harian bank.  
     - *Dampak:* Tidak sadar bahaya finansial jika telat bayar autodebet.

156. **Ketiadaan Simulasi Pelunasan Hutang Metode Snowball vs Avalanche**  
     - *Lokasi:* `lib/analytics/calculators.ts`  
     - *Gejala:* Jika memiliki lebih dari 1 hutang, bot belum bisa memprioritaskan mana yang harus lunas duluan.  
     - *Dampak:* Pembayaran hutang kurang terstruktur secara strategi finansial.

157. **Tidak Ada Notifikasi saat Rasio Pembayaran Hutang (*DSR*) Melebihi Batas Aman 30%**  
     - *Lokasi:* `lib/analytics/calculators.ts`  
     - *Gejala:* Total cicilan melebihi 30% penghasilan tidak memicu alarm peringatan bahaya.  
     - *Dampak:* Risiko gagal bayar (*Default Risk*) meningkat.

158. **Kalkulasi Nilai Bersih Kekayaan (*Net Worth*) Belum Memasukkan Nilai Pasar Motor Beat**  
     - *Lokasi:* `lib/analytics/calculators.ts`  
     - *Gejala:* Net worth hanya menghitung uang kas, belum memasukkan nilai aset motor (~Rp 12.000.000).  
     - *Dampak:* Kekayaan aset riil tampak jauh lebih kecil dari aslinya.

159. **Ketiadaan Sinking Fund Bulanan untuk Pembayaran Pajak STNK Tahunan Motor**  
     - *Lokasi:* `lib/analytics/calculators.ts`  
     - *Gejala:* Pajak motor tahunan Rp 250.000 tidak dicicil tabungannya Rp 20.000/bulan.  
     - *Dampak:* Kaget dana darurat saat jatuh tempo pajak STNK tahunan tiba.

160. **Pengabaian Biaya Ganti Ban Motor Setiap 12.000 KM pada Biaya Operasional**  
     - *Lokasi:* `lib/analytics/calculators.ts`  
     - *Gejala:* Dana cadangan ganti ban luar/dalam belum disisihkan per kilometer narik.  
     - *Dampak:* Ban botak tidak segera diganti karena tidak ada pos dana khusus ban.

161. **Ketiadaan Deteksi Pengeluaran Bocor Halus (*Latte Factor*) di Bawah 15rb**  
     - *Lokasi:* `lib/analytics/anomalies.ts`  
     - *Gejala:* Beli es teh 5rb 3x sehari (15rb/hari = 450rb/bulan) tidak terdeteksi sebagai kebocoran kas.  
     - *Dampak:* Uang kas cepat habis tanpa jejak transaksi besar.

162. **Tidak Ada Rekapitulasi Pembagian Keuntungan Bersih Gojek Pasca Potong Biaya Servis**  
     - *Lokasi:* `lib/analytics/calculators.ts`  
     - *Gejala:* Pendapatan kotor dikira keuntungan bersih yang bisa langsung dibelanjakan.  
     - *Dampak:* Dana perawatan motor terpakai untuk jajan konsumtif.

163. **Ketiadaan Simulasi Kenaikan Tarif BBM Pertalite terhadap Profitabilitas Gojek**  
     - *Lokasi:* `lib/analytics/calculators.ts`  
     - *Gejala:* Jika bensin naik 10%, bot belum bisa menghitung berapa target narik tambahan yang dibutuhkan.  
     - *Dampak:* Pendapatan bersih tergerus inflasi BBM tanpa disadari.

164. **Pengabaian Jam Sibuk Bonus Tambahan Insentif (*Gojek Performance Bonus*)**  
     - *Lokasi:* `lib/analytics/calculators.ts`  
     - *Gejala:* Perhitungan pendapatan belum memasukkan target poin bonus harian.  
     - *Dampak:* Melewatkan peluang meraih bonus poin harian aplikasi driver.

165. **Ketiadaan Fitur Kunci Pengeluaran Harian saat Target Saldo Trip Belum Terpenuhi**  
     - *Lokasi:* `lib/telegram/chat-processor.ts`  
     - *Gejala:* Bot tidak memperingatkan saat user jajan mahal padahal tabungan Dieng masih kurang.  
     - *Dampak:* Rencana trip berisiko gagal tercapai tepat waktu.

166. **Tidak Ada Simulasi Tenor Pelunasan Hutang Lebih Cepat dengan Uang THR / Rezeki Insidental**  
     - *Lokasi:* `lib/analytics/calculators.ts`  
     - *Gejala:* Mendapat uang kaget 500k tidak otomatis dihitung berapa bulan tenor cicilan yang terpangkas.  
     - *Dampak:* Uang kaget habis untuk konsumsi, bukan memotong beban bunga pinjaman.

167. **Ketiadaan Visualisasi Grafik Komparasi Pemasukan Narik Weekday vs Weekend**  
     - *Lokasi:* `lib/analytics/calculators.ts`  
     - *Gejala:* Belum ada grafik batang komparasi rata-rata omset Senin-Jumat vs Sabtu-Minggu.  
     - *Dampak:* Sulit menentukan hari libur narik yang paling minim kehilangan potensi omset.

168. **Pengabaian Biaya Cuci Motor & Kebersihan Kendaraan Narik Penumpang**  
     - *Lokasi:* `lib/analytics/calculators.ts`  
     - *Gejala:* Biaya cuci motor 15k/minggu tidak masuk pos operasional kendaraan.  
     - *Dampak:* Motor kotor menurunkan rating bintang dari penumpang Gojek.

169. **Ketiadaan Deteksi Ketergantungan Saldo Dompet Fisik Tunai yang Terlalu Sedikit**  
     - *Lokasi:* `lib/analytics/anomalies.ts`  
     - *Gejala:* Saldo uang kertas di dompet <10k tidak diberi alert tarik tunai di ATM terdekat.  
     - *Dampak:* Kesulitan memberi uang kembalian pada penumpang Gojek yang bayar tunai.

170. **Tidak Ada Indikator Efisiensi Konsumsi Bensin Saat Bawa Penumpang vs Narik Makanan (*GoFood*)**  
     - *Lokasi:* `lib/analytics/calculators.ts`  
     - *Gejala:* GoFood motor lebih sering berhenti dan macet di resto dibanding GoRide jarak jauh.  
     - *Dampak:* Tidak tahu jenis layanan mana yang paling efisien konsumsi bensinnya.

171. **Ketiadaan Rekomendasi Alokasi Dana Tabungan Berjangka / Deposito Fleksibel**  
     - *Lokasi:* `lib/analytics/calculators.ts`  
     - *Gejala:* Saldo nganggur di tabungan biasa tidak disarankan ditaruh di Kantong Terkunci Jago.  
     - *Dampak:* Bunga tabungan tidak maksimal.

172. **Pengabaian Potongan Biaya Top Up Saldo Driver Gojek via Mitra Minimarket (Rp 1.000 - Rp 2.000)**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Biaya admin top up dompet driver tidak dicatat di pembukuan operasional.  
     - *Dampak:* Selisih kecil terakumulasi menjadi pos biaya tak bertuan.

173. **Ketiadaan Fitur Simulasi Kenaikan Uang Saku Pasca-Lulus Kuliah**  
     - *Lokasi:* `lib/analytics/calculators.ts`  
     - *Gejala:* Simulasi pengeluaran hidup mandiri pasca-wisuda belum tersedia.  
     - *Dampak:* Kaget menghadapi transisi biaya hidup pasca status mahasiswa.

174. **Tidak Ada Peringatan saat Saldo Tabungan Mengalami Penurunan Beruntun Selama 3 Bulan**  
     - *Lokasi:* `lib/analytics/anomalies.ts`  
     - *Gejala:* Defisit berturut-turut tidak memicu alarm evaluasi gaya hidup besar-besaran.  
     - *Dampak:* Saldo tabungan terancam terkuras habis tanpa tindakan mitigasi cepat.

175. **Ketiadaan Analisis Korelasi Belanja dengan Waktu Cuaca Hujan / Panas Terik**  
     - *Lokasi:* `lib/analytics/anomalies.ts`  
     - *Gejala:* Pengeluaran jajan online (GoFood) melonjak saat hujan deras tidak termonitor polanya.  
     - *Dampak:* Pengeluaran jajan saat hujan tidak terantisipasi di anggaran bulanan.

176. **Pengabaian Biaya Kuota Internet Paket Data Narik Driver (50k - 100k/bulan)**  
     - *Lokasi:* `lib/analytics/calculators.ts`  
     - *Gejala:* Paket data internet untuk GPS dan aplikasi driver tidak masuk pos modal kerja.  
     - *Dampak:* Keuntungan bersih narik tampak lebih besar dari riilnya.

177. **Ketiadaan Simulasi Perbandingan Biaya Makan Masak Sendiri vs Beli di Warteg**  
     - *Lokasi:* `lib/analytics/calculators.ts`  
     - *Gejala:* Tidak ada perbandingan hemat belanja bahan mentah mingguan vs beli matang.  
     - *Dampak:* Melewatkan potensi penghematan biaya makan 40% per bulan.

178. **Tidak Ada Indikator Hari Bebas Belanja (*No-Spend Day Streak Tracker*)**  
     - *Lokasi:* `lib/features/habits-and-tasks.ts`  
     - *Gejala:* Hari di mana tidak ada pengeluaran sama sekali tidak diberi reward pencapaian khusus.  
     - *Dampak:* Kurang motivasi untuk berhemat puasa belanja di hari tertentu.

179. **Ketiadaan Simulasi Dana Cadangan Beli HP Baru saat HP Driver Mulai Rusak / Baterai Kembung**  
     - *Lokasi:* `lib/analytics/calculators.ts`  
     - *Gejala:* Smartphone adalah alat kerja utama driver; tidak ada sinking fund cicilan beli HP baru.  
     - *Dampak:* Panik saat HP kerja mati mendadak dan tidak bisa narik orderan.

180. **Pengabaian Biaya Parkir Menunggu Orderan di Depan Mall / Sentra Kuliner**  
     - *Lokasi:* `lib/analytics/calculators.ts`  
     - *Gejala:* Parkir 2.000 berkali-kali saat menunggu pesanan GoFood tidak tercatat.  
     - *Dampak:* Uang receh parkir hilang 10.000/hari tanpa pembukuan.

---

## DOMAIN 5: STRATEGI OPERASIONAL GOJEK & EFISIENSI BAHAN BAKAR (Poin 181 – 215)

181. **Perhitungan Efisiensi Bensin Gojek (KM per Liter) Belum Memiliki Grafik Tren Mingguan**  
     - *Lokasi:* `lib/analytics/calculators.ts`  
     - *Gejala:* Data KM dan liter bensin belum dirangkum menjadi grafik tren efisiensi.  
     - *Dampak:* Penurunan performa mesin motor tidak terdeteksi sejak dini.

182. **Ketiadaan Deteksi Tagihan Autodebet yang Berpotensi Gagal Bayar (*Insufficient Balance Alert*)**  
     - *Lokasi:* `app/api/cron/briefing/route.ts`  
     - *Gejala:* Tanggal 19 sore saldo Bank Jago <67.940 tidak diberi peringatan transfer saldo.  
     - *Dampak:* Autodebet gagal dan berisiko terkena catatan kredit bank.

183. **Pengabaian Jam Paling Ramai Orderan (*Hotspot Spot Dinoyo, Suhat, Sawojajar*)**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Tidak menyarankan titik mangkal terbaik sesuai jam permintaan tinggi.  
     - *Dampak:* Waktu menunggu orderan lebih lama dibanding driver lain.

184. **Ketiadaan Pengingat Jadwal Ganti Oli Mesin Setiap 2.000 KM Perjalanan**  
     - *Lokasi:* `lib/features/smart-alerts.ts`  
     - *Gejala:* Odometer narik bertambah tanpa ada alarm pengingat ganti oli mesin.  
     - *Dampak:* Mesin motor cepat panas dan aus karena telat ganti oli.

185. **Tidak Ada Pengingat Jadwal Ganti Oli Gardan / Transmisi Matic Setiap 6.000 KM**  
     - *Lokasi:* `lib/features/smart-alerts.ts`  
     - *Gejala:* Oli gardan terlupakan karena hanya fokus pada oli mesin utama.  
     - *Dampak:* Gear transmisi matic aus dan menimbulkan suara kasar.

186. **Ketiadaan Perhitungan Konsumsi Bensin saat Kondisi Jalan Macet vs Lancar**  
     - *Lokasi:* `lib/analytics/calculators.ts`  
     - *Gejala:* Macet jam pulang kantor mengonsumsi bensin 30% lebih boros per kilometer.  
     - *Dampak:* Estimasi sisa bensin di tangki motor meleset.

187. **Tidak Ada Rekomendasi Rute Tikus Menghindari Lampu Merah Lama di Kota Malang**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Lampu merah Ranugrati/Sulfat sangat lama; jalur alternatif belum disarankan.  
     - *Dampak:* Waktu pengantaran makanan lebih lambat dan bensin terbuang saat idling.

188. **Ketiadaan Panduan Perlengkapan Jas Hujan Sepatu saat Musim Hujan Tiba**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Tidak ada checklist jas hujan setelan dan sarung sepatu anti air.  
     - *Dampak:* Sepatu basah kuyup dan tidak nyaman berkendara seharian.

189. **Pengabaian Risiko Hipotermia saat Narik Orderan Malam Hari di Kota Dingin Malang**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Suhu malam Malang 18°C butuh jaket windbreaker tebal dan masker penutup leher.  
     - *Dampak:* Driver rentan masuk angin dan tidak bisa narik di hari berikutnya.

190. **Ketiadaan Fitur Catat Nomor Plat Motor & Masa Berlaku Pajak Plat 5 Tahunan**  
     - *Lokasi:* `lib/supabase/queries/preferences.ts`  
     - *Gejala:* Jadwal ganti plat nomor 5 tahunan tidak tersimpan di memori asisten.  
     - *Dampak:* Terlambat ganti plat nomor dan terkena denda Samsat.

191. **Tidak Ada Rekomendasi Titik Pengisian Angin Ban Gratis / Berbayar Terpercaya**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Ban kurang angin membuat motor berat dan boros bensin 15%.  
     - *Dampak:* Efisiensi bahan bakar harian menurun.

192. **Ketiadaan Rekapitulasi Rata-Rata Pendapatan per Jam Kerja (*Hourly Wage Rate*)**  
     - *Lokasi:* `lib/analytics/calculators.ts`  
     - *Gejala:* Narik 8 jam dapat 100k (Rp 12.500/jam) belum terhitung otomatis di ringkasan harian.  
     - *Dampak:* Sulit mengevaluasi apakah produktivitas kerja harian meningkat.

193. **Pengabaian Waktu Istirahat Wajib Peregangan Pinggang (*Ergonomic Break Alert*)**  
     - *Lokasi:* `app/api/cron/activity-check/route.ts`  
     - *Gejala:* Berkendara 4 jam nonstop memicu sakit pinggang dan penurunan fokus.  
     - *Dampak:* Kesehatan fisik pengemudi jangka panjang terganggu.

194. **Ketiadaan Tips Merawat Baterai Smartphone saat Sering Dicharge di Powerbank / Motor**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Suhu HP panas saat dicharge sambil navigasi GPS merusak kesehatan baterai.  
     - *Dampak:* Daya tahan baterai HP driver cepat bocor.

195. **Tidak Ada Rekomendasi Tempat Tambal Ban Tubeless Presisi yang Tidak Merusak Velg**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Tambal ban tusuk sembarangan merusak struktur ban tubeless motor.  
     - *Dampak:* Ban bocor halus terus-menerus di jalan.

196. **Ketiadaan Peringatan Jalur Rawan Razia Kelengkapan Surat Kendaraan**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Mengingatkan membawa STNK & SIM asli sebelum berangkat narik orderan.  
     - *Dampak:* Kena tilang karena lupa memindahkan STNK dari jaket lain.

197. **Pengabaian Kebutuhan Minum Air Putih Minimal 2 Liter saat Berada di Bawah Terik Matahari**  
     - *Lokasi:* `app/api/cron/activity-check/route.ts`  
     - *Gejala:* Panas siang hari memicu dehidrasi driver tanpa disadari.  
     - *Dampak:* Konsentrasi berkendara menurun dan sakit kepala di jalan.

198. **Ketiadaan Deteksi Pengeluaran Beli Minuman Manis Dingin Berlebih saat Narik**  
     - *Lokasi:* `lib/analytics/anomalies.ts`  
     - *Gejala:* Beli es boba/kopi manis 3x sehari saat narik menghabiskan Rp 45.000 keuntungan.  
     - *Dampak:* Keuntungan harian habis untuk minuman manis tidak sehat.

199. **Tidak Ada Rekomendasi Membawa Uang Kertas Kembalian 2k, 5k, 10k Rapi di Dompet Pinggang**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Tidak ada uang kembalian membuat penumpang menunggu lama dan membatalkan tips.  
     - *Dampak:* Kehilangan potensi tips uang kembalian dari penumpang.

200. **Ketiadaan Fitur Catat Biaya Parkir Khusus Resto GoFood yang Tidak Diganti Konsumen**  
     - *Lokasi:* `lib/analytics/calculators.ts`  
     - *Gejala:* Parkir resto 2k yang tidak dibayar customer memotong keuntungan bersih orderan.  
     - *Dampak:* Keuntungan per orderan makanan tidak utuh.

201. **Pengabaian Peringatan Bahaya Menggunakan Holder HP Longgar di Jalan Berlubang**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* HP bisa jatuh dan layar pecah saat menghantam jalanan rusak.  
     - *Dampak:* Biaya ganti LCD HP Rp 400.000 memangkas keuntungan narik seminggu.

202. **Ketiadaan Evaluasi Kelayakan Kampas Rem Depan & Belakang Pasca Narik di Rute Tanjakan**  
     - *Lokasi:* `lib/features/smart-alerts.ts`  
     - *Gejala:* Narik orderan ke Batu/Pujon membuat kampas rem motor cepat habis.  
     - *Dampak:* Rem blong berbahaya saat turunan curam.

203. **Tidak Ada Panduan Mengatasi Orderan Fiktif / Penipuan Customer**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Prosedur klaim penggantian saldo ganti rugi ke kantor operasional Gojek belum ada.  
     - *Dampak:* Kerugian modal uang talangan makanan fiktif.

204. **Ketiadaan Fitur Rekapitulasi Rute Kilometer Mingguan untuk Klaim Servis Rutin**  
     - *Lokasi:* `lib/analytics/calculators.ts`  
     - *Gejala:* Jarak tempuh total mingguan belum dirangkum otomatis dari riwayat chat.  
     - *Dampak:* Jadwal servis berkala sering terlambat.

205. **Pengabaian Waktu Sholat Ashar & Maghrib saat Sedang Membawa Penumpang Jarak Jauh**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Tidak ada pengingat berhenti sejenak untuk menunaikan sholat wajib.  
     - *Dampak:* Waktu sholat terlewat karena kejar target orderan.

206. **Ketiadaan Tips Menghemat Daya Baterai HP saat Narik (Dark Mode, Matikan Bluetooth)**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Layar terang terus-menerus membuat baterai smartphone drop dalam 3 jam narik.  
     - *Dampak:* Harus sering berhenti mencari colokan listrik di warung.

207. **Tidak Ada Rekomendasi Menu Makan Siang Sehat, Murah, & Cepat Saji untuk Driver**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Warung makan murah bergizi di sekitar pangkalan driver belum terpetakan.  
     - *Dampak:* Pengeluaran makan siang driver terlalu mahal (>25k per porsi).

208. **Ketiadaan Fitur Catat Pendapatan Non-Tunai (*Gopay Driver Balance*) vs Uang Tunai di Tangan**  
     - *Lokasi:* `lib/supabase/queries/transactions.ts`  
     - *Gejala:* Saldo di aplikasi driver dan uang fisik di kantong tidak terpisahkan dompetnya.  
     - *Dampak:* Bingung berapa uang kas yang sebenarnya bisa dibawa pulang ke rumah.

209. **Pengabaian Biaya Tambal Ban Tubeless yang Harus Dipotong dari Kas Operasional**  
     - *Lokasi:* `lib/analytics/calculators.ts`  
     - *Gejala:* Biaya tambal ban 15k dicatat sebagai pengeluaran jajan pribadi.  
     - *Dampak:* Statistik biaya operasional kendaraan tidak akurat.

210. **Ketiadaan Peringatan Bahaya Memaksakan Narik saat Tubuh Mengalami Gejala Demam / Flu**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Narik saat sakit menurunkan refleks berkendara dan memperparah penyakit.  
     - *Dampak:* Biaya berobat dokter lebih mahal dibanding omset harian yang didapat.

211. **Tidak Ada Panduan Penanganan Komplain Penumpang yang Rewel / Rating Bintang 1**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* AI belum memberikan kata-kata respon sopan untuk meredakan emosi penumpang.  
     - *Dampak:* Akun driver terancam suspensi akibat rating anjlok.

212. **Ketiadaan Rekomendasi Jam Narik Weekend Khusus Wisatawan di Kawasan Kota Batu**  
     - *Lokasi:* `lib/gemini/prompts/chat.ts`  
     - *Gejala:* Permintaan GoFood/GoRide di Batu melonjak Sabtu malam jam 18.00–22.00 WIB.  
     - *Dampak:* Melewatkan waktu panen orderan bertarif tinggi di kawasan wisata.

213. **Pengabaian Biaya Ganti Lampu Bohlam Utama / Rem Belakang Motor yang Mati**  
     - *Lokasi:* `lib/features/smart-alerts.ts`  
     - *Gejala:* Lampu belakang mati sangat berbahaya ditabrak kendaraan lain dari belakang di malam hari.  
     - *Dampak:* Risiko kecelakaan tabrak belakang saat berkendara malam.

214. **Ketiadaan Fitur Simpan Alamat Basecamp / Pangkalan Driver Terdekat untuk Rehat**  
     - *Lokasi:* Tabel `user_preferences`  
     - *Gejala:* Lokasi pangkalan driver yang nyaman untuk istirahat dan ngopi belum tersimpan.  
     - *Dampak:* Bingung mencari tempat istirahat yang ramah sesama pengemudi ojol.

215. **Tidak Ada Rekapitulasi Total Orderan Sukses Harian yang Mengapresiasi Kerja Keras Driver**  
     - *Lokasi:* `app/api/cron/daily-insight/route.ts`  
     - *Gejala:* Laporan malam tidak memberi kata-kata penyemangat atas perjuangan narik seharian.  
     - *Dampak:* Interaksi asisten terasa dingin dan kurang mengapresiasi jerih payah pengguna.

---

## DOMAIN 6: FITUR KHUSUS: SPLIT BILL, OCR STRUK, & VOICE NOTE (Poin 216 – 250)

216. **Ketiadaan Pembulatan Rupiah Ratusan Terdekat pada Hasil Patungan Split Bill**  
     - *Lokasi:* `lib/features/split-bill.ts`  
     - *Gejala:* Hasil patungan per orang menghasilkan pecahan Rp 33.333 (sulit ditransfer/dibayar tunai).  
     - *Dampak:* Pembayaran patungan repot mencari uang kembalian receh rupiah ganjil.

217. **Struk Belanja dengan Font Termal yang Pudar Gagal Dibaca OCR**  
     - *Lokasi:* `lib/gemini/prompts/ocr-receipt.ts`  
     - *Gejala:* Struk belanja lama yang tulisannya tipis ditolak tanpa opsi input nominal manual cepat.  
     - *Dampak:* User harus mengetik ulang seluruh daftar belanja dari awal.

218. **Voice Note dengan Durasi >2 Menit Terancam Timeout Serverless Vercel (15 Detik)**  
     - *Lokasi:* `lib/telegram/voice-processor.ts`  
     - *Gejala:* Transkripsi audio panjang memakan waktu eksekusi lebih dari batas waktu Vercel.  
     - *Dampak:* Pesan suara gagal diproses dan bot tidak membalas apa-apa.

219. **Split Bill Belum Mendukung Pembagian Diskon Voucher Restoran secara Proporsional**  
     - *Lokasi:* `lib/features/split-bill.ts`  
     - *Gejala:* Voucher diskon Rp 50.000 dipotong rata, bukan sesuai porsi harga pesanan masing-masing.  
     - *Dampak:* Teman yang memesan makanan murah mendapat potongan diskon tidak adil.

220. **Foto Struk yang Miring / Terbalik 90 Derajat Menghasilkan Teks Acak Nonsense**  
     - *Lokasi:* `lib/gemini/prompts/ocr-receipt.ts`  
     - *Gejala:* Tidak ada fungsi auto-rotation gambar sebelum dikirim ke model OCR Gemini Vision.  
     - *Dampak:* Ekstraksi item belanja struk menghasilkan nama barang simbol acak.

221. **Voice Note Berisi Campuran Bahasa Jawa dan Bahasa Indonesia Mengalami Ambiguitas Kata**  
     - *Lokasi:* `lib/telegram/voice-processor.ts`  
     - *Gejala:* Kata *"mangan bakso rong puluh ewu"* tertranskripsi *"makan bakso 2000"* (kurang angka 0).  
     - *Dampak:* Nominal pengeluaran makanan tercatat salah di database.

222. **Ketiadaan Opsi Hapus Satu Item Spesifik dari Daftar Hasil OCR Struk Belanja**  
     - *Lokasi:* `lib/telegram/receipt-processor.ts`  
     - *Gejala:* Jika 1 barang titipan teman salah masuk struk, seluruh struk harus diedit manual via chat.  
     - *Dampak:* Kurang praktis memisahkan belanja pribadi dengan barang titipan orang lain.

223. **Split Bill Belum Mendukung Pembayaran Non-Tunai QRIS dengan Pembuatan Dynamic QR Tagihan**  
     - *Lokasi:* `lib/features/split-bill.ts`  
     - *Gejala:* Rincian patungan hanya menampilkan angka, belum ada QRIS untuk pembayaran langsung.  
     - *Dampak:* Teman harus mengetik nomor rekening dan nominal manual di m-banking.

224. **Struk dengan Dua Kolom Pembelian (Kiri & Kanan) Terbaca Tumpang Tindih**  
     - *Lokasi:* `lib/gemini/prompts/ocr-receipt.ts`  
     - *Gejala:* Struk supermarket 2 kolom dibaca per baris horizontal sehingga nama dan harga tertukar.  
     - *Dampak:* Nama sabun dipasangkan dengan harga minyak goreng.

225. **Voice Note dengan Desah Angin Kencang saat Berkendara Motor Menghasilkan Transkripsi Kosong**  
     - *Lokasi:* `lib/telegram/voice-processor.ts`  
     - *Gejala:* Suara angin knalpot menenggelamkan suara vokal kata-kata pengguna.  
     - *Dampak:* Bot membalas pesan error audio tidak terdengar jelas.

226. **Ketiadaan Indikator Loading Suara saat Sedang Mentranskripsi Pesan Voice Note**  
     - *Lokasi:* `lib/telegram/voice-processor.ts`  
     - *Gejala:* Bot tidak mengirim aksi `record_audio` atau `typing` saat memproses transkripsi.  
     - *Dampak:* User mengira bot mati karena tidak ada respon selama beberapa detik.

227. **Split Bill Belum Membedakan Pesanan Makanan yang Dimakan Bersama (*Shared Food / Piring Tengah*)**  
     - *Lokasi:* `lib/features/split-bill.ts`  
     - *Gejala:* Kentang goreng yang dicemil bersama 4 orang belum bisa dialokasikan dibagi 4 otomatis.  
     - *Dampak:* Satu orang menanggung seluruh biaya cemilan bersama.

228. **Struk SPBU Bensin dengan Baris Tera Liter dan Harga per Liter Tertukar Total Biaya**  
     - *Lokasi:* `lib/gemini/prompts/ocr-receipt.ts`  
     - *Gejala:* Angka 2.5 Liter dicatat sebagai pengeluaran Rp 2.500 alih-alih total Rp 25.000.  
     - *Dampak:* Transaksi pengeluaran bensin tercatat terlalu kecil.

229. **Voice Note yang Menyebutkan Angka Tanpa Satuan Ribu (*"Beli bensin selikur"*)**  
     - *Lokasi:* `lib/telegram/voice-processor.ts`  
     - *Gejala:* "Selikur" (bahasa Jawa 21) tidak dipetakan ke Rp 21.000.  
     - *Dampak:* Transaksi gagal terekstrak dari pesan suara.

230. **Ketiadaan Fitur Salin Teks Format WhatsApp dari Hasil Perhitungan Split Bill**  
     - *Lokasi:* `lib/features/split-bill.ts`  
     - *Gejala:* Format teks belum dioptimalkan untuk langsung diforward ke grup chat WhatsApp teman.  
     - *Dampak:* User harus mengedit manual teks patungan sebelum disebar ke grup WA.

231. **Struk Pembayaran Parkir Elektronik (QR Parkir) Tanpa Nama Merchant Jelas**  
     - *Lokasi:* `lib/gemini/prompts/ocr-receipt.ts`  
     - *Gejala:* Merchant tersimpan sebagai "Secure Parking" tanpa nama lokasi mall/gedung.  
     - *Dampak:* Sulit mengingat di mana transaksi parkir tersebut terjadi.

232. **Voice Note yang Terpotong di Detik Terakhir (*Premature Audio Truncation*)**  
     - *Lokasi:* `lib/telegram/voice-processor.ts`  
     - *Gejala:* Kalimat terakhir terputus saat jari user lepas dari tombol mic Telegram.  
     - *Dampak:* Transkripsi kehilangan nominal di akhir kalimat.

233. **Split Bill yang Melibatkan Peserta yang Tidak Memesan Apapun (*Hanya Ikut Nongkrong*)**  
     - *Lokasi:* `lib/features/split-bill.ts`  
     - *Gejala:* Peserta yang tidak pesan makanan tetap terbebani biaya service charge jika dibagi rata.  
     - *Dampak:* Peserta yang tidak makan merasa dirugikan hitungan patungan.

234. **Struk Rumah Makan Padang dengan Sistem Centang Manual di Kertas Bon**  
     - *Lokasi:* `lib/gemini/prompts/ocr-receipt.ts`  
     - *Gejala:* Bon tulis tangan sulit dibaca oleh OCR standar model computer vision.  
     - *Dampak:* Pengeluaran makan di warung makan tradisional gagal terdeteksi dari foto bon.

235. **Voice Note dengan Volume Suara Terlalu Kecil / Berbisik (*Whisper Mode*)**  
     - *Lokasi:* `lib/telegram/voice-processor.ts`  
     - *Gejala:* Rekaman suara bisikan saat di perpustakaan/masjid tidak tertangkap transkripsinya.  
     - *Dampak:* Perintah suara gagal dieksekusi.

236. **Ketiadaan Tombol Konfirmasi Cepat *"Simpan Transaksi"* Pasca OCR Struk Berhasil**  
     - *Lokasi:* `lib/telegram/receipt-processor.ts`  
     - *Gejala:* Data struk langsung disimpan ke database tanpa preview konfirmasi user.  
     - *Dampak:* Jika ada salah baca OCR, data yang salah sudah terlanjur masuk ke database.

237. **Split Bill Belum Mendukung Pembagian Pembulatan Nominal Kembalian untuk Donasi Kas Masjid/Tip**  
     - *Lokasi:* `lib/features/split-bill.ts`  
     - *Gejala:* Sisa pembulatan 2.000 tidak bisa dialokasikan sebagai pos tip bersama pelayan.  
     - *Dampak:* Selisih uang kas patungan membingungkan bendahara rombongan.

238. **Struk Belanja Minimarket yang Dilipat Dua saat Difoto (*Creased Receipt Image*)**  
     - *Lokasi:* `lib/gemini/prompts/ocr-receipt.ts`  
     - *Gejala:* Lipatan struk menutupi baris total pembayaran dan tanggal transaksi.  
     - *Dampak:* OCR gagal mengekstrak tanggal transaksi yang benar.

239. **Voice Note yang Menyebutkan Banyak Aktivitas Sekaligus dalam 1 Rekaman**  
     - *Lokasi:* `lib/telegram/voice-processor.ts`  
     - *Gejala:* Menyebut 3 pengeluaran dan 2 agenda jadwal dalam 1 voice note terkadang hanya mengekstrak 1.  
     - *Dampak:* Sebagian catatan terlewat dari rekaman suara.

240. **Ketiadaan Validasi Tanggal Struk yang Sudah Berumur Lebih dari 1 Bulan**  
     - *Lokasi:* `lib/telegram/receipt-processor.ts`  
     - *Gejala:* Mengunggah struk belanja bulan lalu dicatat sebagai pengeluaran hari ini.  
     - *Dampak:* Laporan bulanan berjalan terdistorsi struk lama.

241. **Split Bill Belum Memiliki Fitur Kirim Pengingat Tagihan (*Reminder Tagih Hutang*) Otomatis**  
     - *Lokasi:* `lib/features/split-bill.ts`  
     - *Gejala:* Tidak ada tombol *"Tagih Teman"* yang menghasilkan format teks sopan untuk chat personal.  
     - *Dampak:* Canggung saat ingin menagih uang patungan ke teman.

242. **Struk Transaksi Pembayaran Parkir Menggunakan Karcis Manual Tanpa Nominal Cetak**  
     - *Lokasi:* `lib/gemini/prompts/ocr-receipt.ts`  
     - *Gejala:* Karcis parkir hanya ada tulisan nama daerah tanpa angka rupiah tercetak.  
     - *Dampak:* OCR menolak foto karcis karena nominal Rp 0.

243. **Voice Note dengan Nada Bicara Terlalu Cepat (*Fast Speech Transcription*)**  
     - *Lokasi:* `lib/telegram/voice-processor.ts`  
     - *Gejala:* Kata-kata yang terucap terlalu cepat menyatu menjadi satu kata asing yang salah.  
     - *Dampak:* Arti kalimat perintah asisten berubah total.

244. **Ketiadaan Fitur Simpan Foto Asli Struk ke Supabase Storage Bucket Terenkripsi**  
     - *Lokasi:* `lib/telegram/receipt-processor.ts`  
     - *Gejala:* URL gambar Telegram kadaluarsa setelah beberapa minggu; bukti struk fisik hilang.  
     - *Dampak:* Tidak bisa melihat kembali foto asli struk saat audit pembukuan tahunan.

245. **Split Bill Belum Mendukung Pembagian Berdasarkan Persentase Manual (*40% : 60%*)**  
     - *Lokasi:* `lib/features/split-bill.ts`  
     - *Gejala:* Tidak bisa membagi tagihan dengan skema kesepakatan rasio tertentu.  
     - *Dampak:* Perhitungan manual di luar aplikasi masih diperlukan.

246. **Struk ATM Penarikan Uang Tunai yang Dicatat sebagai Pengeluaran Belanja Biasa**  
     - *Lokasi:* `lib/gemini/prompts/ocr-receipt.ts`  
     - *Gejala:* Foto struk tarik tunai 100k dicatat sebagai belanja barang seharga 100k.  
     - *Dampak:* Saldo kas fisik tercatat berkurang dua kali lipat.

247. **Voice Note Menggunakan Bahasa Gaul Slang yang Belum Terdaftar di Kamus AI**  
     - *Lokasi:* `lib/telegram/voice-processor.ts`  
     - *Gejala:* Istilah slang lokal baru tidak dipahami maksud perintahnya oleh engine AI.  
     - *Dampak:* Bot merespon dengan jawaban umum yang tidak relevan.

248. **Ketiadaan Opsi Menggabungkan Beberapa Struk Belanja Menjadi Satu Transaksi Induk**  
     - *Lokasi:* `lib/telegram/receipt-processor.ts`  
     - *Gejala:* 3 struk bahan masakan terpisah di pasar tercatat sebagai 3 mutasi kecil terpisah.  
     - *Dampak:* Riwayat transaksi menjadi terlalu padat dan panjang.

249. **Split Bill yang Menyebabkan Sisa Pembulatan Minus pada Bendahara Rombongan**  
     - *Lokasi:* `lib/features/split-bill.ts`  
     - *Gejala:* Kesalahan pembulatan ke bawah menyebabkan bendahara menalangi kekurangan Rp 1.000.  
     - *Dampak:* Uang kas bendahara tekor akibat selisih pembulatan.

250. **Voice Note yang Mengandung Koreksi Langsung di Tengah Kalimat (*"Beli bensin 20rb eh maksudnya 25rb"*)**  
     - *Lokasi:* `lib/telegram/voice-processor.ts`  
     - *Gejala:* Terkadang AI mencatat nominal pertama (20rb) bukan nominal hasil koreksi (25rb).  
     - *Dampak:* Catatan keuangan tidak sesuai dengan koreksi ucapan pengguna.

---

## DOMAIN 7: EKOSISTEM TELEGRAM, WEBHOOK, BACKGROUND CRON, & PUSH (Poin 251 – 280)

251. **Pesan Morning Briefing Cron Terkirim di Jam yang Salah jika Server Menggunakan Jam UTC**  
     - *Lokasi:* `app/api/cron/briefing/route.ts`  
     - *Gejala:* Briefing jam 07.00 WIB bisa terkirim jam 14.00 siang jika cron Vercel salah setel jam UTC.  
     - *Dampak:* Pesan pagi datang terlambat saat hari sudah siang.

252. **Habit Streak Tracker Reset Setelah 24 Jam Pasif (Bukan Berdasarkan Hari Kalender)**  
     - *Lokasi:* `lib/features/habits-and-tasks.ts`  
     - *Gejala:* Check-in jam 08.00 kemarin dan jam 20.00 malam ini dianggap putus streak karena jeda >24 jam.  
     - *Dampak:* Streak ratusan hari hilang padahal user rutin check-in setiap hari.

253. **QuickChart URL Melebihi Batas Panjang 2048 Karakter pada Data Kategori yang Sangat Padat**  
     - *Lokasi:* `lib/telegram/send-chart.ts`  
     - *Gejala:* Grafik batang dengan 15 label kategori gagal dikirimkan Telegram karena URL terlalu panjang.  
     - *Dampak:* Gambar grafik tidak muncul di chat Telegram.

254. **Ketiadaan Indikator Loading Interaktif pada Tombol Inline Keyboard**  
     - *Lokasi:* `app/api/telegram/webhook/route.ts`  
     - *Gejala:* Menekan tombol tidak memberi getaran feedback sehingga user menekan berkali-kali.  
     - *Dampak:* Request ganda terkirim ke server.

255. **File PDF Report Bulanan Mengalami Masalah Font Rendering pada Karakter Simbol Mata Uang**  
     - *Lokasi:* `lib/features/pdf-report.ts`  
     - *Gejala:* Simbol mata uang atau emoji berubah menjadi kotak tanda tanya di PDF.  
     - *Dampak:* Dokumen laporan keuangan tampak rusak visualnya.

256. **Ketiadaan Mekanisme Safe Fallback saat WebApp Dibuka di Telegram Desktop Windows**  
     - *Lokasi:* `lib/telegram/verify-webapp-init-data.ts`  
     - *Gejala:* Mini app dashboard kadang mengalami masalah resolusi layar saat dibuka di Telegram Desktop.  
     - *Dampak:* Tampilan grafik terpotong di layar laptop.

257. **Pesan Acak Jam (`/acak_jam`) Mengubah Seluruh Transaksi Tanpa Batasan Periode Tanggal**  
     - *Lokasi:* `lib/telegram/commands/system-commands.ts`  
     - *Gejala:* Transaksi bulan lalu ikut teracak jamnya padahal hanya ingin merapikan transaksi hari ini.  
     - *Dampak:* Data historis masa lalu berubah jam mutasinya.

258. **Tidak Ada Tombol Navigasi Cepat Kembali ke Menu Utama (*Back to Home Menu*)**  
     - *Lokasi:* `lib/telegram/send-message.ts`  
     - *Gejala:* Setelah laporan panjang selesai, user harus mengetik manual `/start` untuk kembali ke menu.  
     - *Dampak:* Navigasi bot terasa kurang intuitif.

259. **Cron Daily Insight Tetap Berjalan Mengirim Chat saat Pengguna Tidak Punya Aktivitas Baru**  
     - *Lokasi:* `app/api/cron/daily-insight/route.ts`  
     - *Gejala:* Bot mengirim pesan *"Tidak ada insight baru"* yang terkesan spamming.  
     - *Dampak:* Notifikasi bot mengganggu ketenangan pengguna.

260. **Ketiadaan Validasi Ukuran File Suara Voice Note (>20 MB) Sebelum Download**  
     - *Lokasi:* `lib/telegram/voice-processor.ts`  
     - *Gejala:* File audio raksasa membebani RAM serverless function Vercel.  
     - *Dampak:* Serverless crash akibat Out of Memory (OOM).

261. **Command Autocomplete Telegram (`setMyCommands`) Tidak Otomatis Terbarui di Klien Telegram**  
     - *Lokasi:* `lib/telegram/send-message.ts`  
     - *Gejala:* Perintah menu baru tidak langsung muncul di daftar autocomplete tombol `/` Telegram.  
     - *Dampak:* Pengguna tidak tahu ada perintah baru yang tersedia.

262. **Tampilan Tabel Markdown pada Layar Smartphone Terpotong secara Horizontal**  
     - *Lokasi:* `lib/telegram/send-message.ts`  
     - *Gejala:* Tabel teks dengan 5 kolom menjadi berantakan barisnya pada layar HP berukuran kecil.  
     - *Dampak:* Tabel perbandingan angka sulit dibaca di smartphone.

263. **Ketiadaan Notifikasi Pengingat Istirahat Narik Gojek Pasca Bekerja 4 Jam Nonstop**  
     - *Lokasi:* `app/api/cron/activity-check/route.ts`  
     - *Gejala:* Tidak ada pengingat ramah untuk istirahat minum es degan dan meregangkan badan.  
     - *Dampak:* Pengemudi rentan mengalami kelelahan fisik di jalan.

264. **Pesan Konfirmasi Ekspor CSV Tidak Menyertakan Total Nilai Rupiah yang Terekspor**  
     - *Lokasi:* `lib/telegram/commands/financial-commands.ts`  
     - *Gejala:* File CSV dikirim tanpa ada ringkasan jumlah baris dan total nominal uang di chat.  
     - *Dampak:* User harus membuka file manual untuk memastikan kebenaran isinya.

265. **Ketiadaan Mode Senyap / Jangan Ganggu (*Do Not Disturb Mode*) di Jam Tidur (23.00–05.00 WIB)**  
     - *Lokasi:* `app/api/cron/briefing/route.ts`  
     - *Gejala:* Notifikasi otomatis bisa berbunyi di tengah malam dan mengganggu tidur pengguna.  
     - *Dampak:* Pengguna terganggu suara notifikasi saat istirahat malam.

266. **Kegagalan Menampilkan Thumbnail Gambar pada Link Google Maps di Telegram**  
     - *Lokasi:* `lib/telegram/chat-processor.ts`  
     - *Gejala:* Kartu lokasi wisata tidak memuat pratinjau foto peta kecil.  
     - *Dampak:* Tampilan kartu tempat wisata kurang menarik secara visual.

267. **Tidak Ada Opsi Ekspor ke Format Google Sheets Langsung via Link Chat Telegram**  
     - *Lokasi:* `lib/telegram/commands/financial-commands.ts`  
     - *Gejala:* User harus unduh file CSV manual, belum bisa minta link spreadsheet langsung.  
     - *Dampak:* Akses data di Google Drive membutuhkan langkah manual tambahan.

268. **Ketiadaan Fitur Pencarian Transaksi Berdasarkan Rentang Nominal (*Filter Range Amount*)**  
     - *Lokasi:* `lib/telegram/commands/financial-commands.ts`  
     - *Gejala:* Belum bisa command: `cari transaksi antara 50rb sampai 100rb`.  
     - *Dampak:* Pencarian transaksi spesifik membutuhkan scroll panjang.

269. **Pemberitahuan Status Baterai Rendah saat Membuka Mini App Dashboard**  
     - *Lokasi:* Dashboard WebApp  
     - *Gejala:* Dashboard berat memuat grafik saat HP dalam kondisi baterai lemah (<15%).  
     - *Dampak:* Baterai smartphone cepat habis di lapangan.

270. **Ketiadaan Perintah Shortcut Bantuan Cepat (*One-Tap Quick Action Chips*) pada Seluruh Respon Bot**  
     - *Lokasi:* `lib/telegram/inline-keyboard.ts`  
     - *Gejala:* Tombol shortcut hanya muncul di pesan tertentu, tidak konsisten di semua respon.  
     - *Dampak:* Navigasi satu ketuk kurang seragam di seluruh alur chat.

271. **Kegagalan Pengiriman Dokumen PDF jika Ukuran File Melebihi 50 MB**  
     - *Lokasi:* `lib/telegram/send-message.ts`  
     - *Gejala:* Telegram Bot API membatasi upload dokumen bot maksimal 50 MB.  
     - *Dampak:* Laporan tahunan padat gambar gagal terkirim ke chat.

272. **Ketiadaan Mekanisme Webhook Health Check Endpoint untuk Uptime Monitor External**  
     - *Lokasi:* `app/api/telegram/webhook/route.ts`  
     - *Gejala:* Tidak ada route `GET /api/health` ringan untuk dimonitor oleh UptimeRobot / BetterStack.  
     - *Dampak:* Keterlambatan mengetahui insiden server down.

273. **Pesan Suara yang Gagal Diproses Tidak Menghasilkan Opsi Ketik Ulang Instan**  
     - *Lokasi:* `lib/telegram/voice-processor.ts`  
     - *Gejala:* Pesan error tidak menyertakan tombol: `[ ✍️ Ketik Teks Manual Saja ]`.  
     - *Dampak:* Alur interaksi terhenti saat transkripsi suara gagal.

274. **Ketiadaan Fitur Pin Message Pesan Briefing Pagi Penting di Grup Chat**  
     - *Lokasi:* `lib/telegram/send-message.ts`  
     - *Gejala:* Pesan briefing penting tenggelam tertutup percakapan obrolan harian.  
     - *Dampak:* Agenda mendesak hari ini terlewat dari perhatian.

275. **Tidak Ada Opsi Mengganti Nada Notifikasi Khusus untuk Pengingat Hutang & Cicilan**  
     - *Lokasi:* `lib/telegram/send-message.ts`  
     - *Gejala:* Semua pesan bot berbunyi dengan nada notifikasi standar Telegram yang sama.  
     - *Dampak:* Pengingat tagihan penting tidak terdengar istimewa dibanding chat biasa.

276. **Ketiadaan Validasi Token Webhook Telegram yang Mengamankan Route dari Request Palsu**  
     - *Lokasi:* `app/api/telegram/webhook/route.ts`  
     - *Gejala:* Route webhook tidak memeriksa header `X-Telegram-Bot-Api-Secret-Token`.  
     - *Dampak:* Pihak luar bisa menembak request JSON palsu ke webhook.

277. **Pengiriman Banyak Pesan Berurutan yang Terkena Limit Telegram (*429 Too Many Requests*)**  
     - *Lokasi:* `lib/telegram/send-message.ts`  
     - *Gejala:* Mengirim 20 bubble pesan kartu wisata sekaligus tanpa jeda delay memicu rate limit.  
     - *Dampak:* Pesan kartu wisata terputus di tengah jalan.

278. **Ketiadaan Fitur Pratinjau Pesan Siaran (*Broadcast Message Preview*) untuk Admin**  
     - *Lokasi:* `app/api/admin/broadcast/route.ts`  
     - *Gejala:* Pesan broadcast ke seluruh user langsung terkirim tanpa opsi test ke akun admin dulu.  
     - *Dampak:* Kesalahan ketik broadcast langsung tersebar ke semua pengguna.

279. **Tidak Ada Opsi Mode Hemat Kuota (*Data Saver Mode*) pada Pengiriman Gambar Grafik**  
     - *Lokasi:* `lib/telegram/send-chart.ts`  
     - *Gejala:* Grafik selalu dikirim dalam resolusi tinggi yang boros kuota internet di lapangan.  
     - *Dampak:* Kuota internet driver cepat tersedot saat sering meminta laporan grafik.

280. **Ketiadaan Log Riwayat Pengiriman Notifikasi Cron yang Berhasil / Gagal**  
     - *Lokasi:* `app/api/cron/briefing/route.ts`  
     - *Gejala:* Tidak ada tabel database yang mencatat apakah briefing pagi sukses diterima user.  
     - *Dampak:* Sulit menelusuri keluhan jika ada user yang merasa tidak menerima briefing pagi.

---

## DOMAIN 8: MINI APP DASHBOARD, KEAMANAN DATA, & SKALABILITAS (Poin 281 – 305)

281. **Ketiadaan Proteksi Cross-Site Scripting (XSS) pada Render Nama Transaksi di Webview**  
     - *Lokasi:* Komponen Dashboard Webview  
     - *Gejala:* Nama transaksi berisi tag `<script>` bisa tereksekusi di browser jika tidak di-escape.  
     - *Dampak:* Keamanan sesi dashboard pengguna di browser terancam.

282. **Tidak Ada Enkripsi Database End-to-End pada Catatan Pribadi Sensitif Pengguna**  
     - *Lokasi:* Tabel `user_preferences`  
     - *Gejala:* Catatan rahasia tersimpan dalam bentuk teks biasa di storage cloud.  
     - *Dampak:* Privasi pengguna bergantung penuh pada proteksi akses database.

283. **Ketiadaan PWA (*Progressive Web App*) Support pada Mini App Dashboard**  
     - *Lokasi:* Dashboard WebApp Next.js  
     - *Gejala:* Dashboard tidak bisa di-install sebagai aplikasi mandiri di homescreen HP.  
     - *Dampak:* Harus selalu membuka Telegram terlebih dahulu untuk melihat dashboard.

284. **Tidak Ada Fitur Offline Mode Caching pada Dashboard Mini App saat Sinyal Hilang**  
     - *Lokasi:* Dashboard WebApp  
     - *Gejala:* Membuka dashboard saat sinyal internet drop menampilkan layar putih kosong (*Blank Screen*).  
     - *Dampak:* Tidak bisa melihat catatan pengeluaran terakhir saat di area minim sinyal.

285. **Ketiadaan Kompresi Gzip / Brotli pada Asset Bundling JavaScript Webview**  
     - *Lokasi:* `next.config.mjs`  
     - *Gejala:* Bundle JavaScript dashboard berukuran besar (>2 MB) lambat di-load di jaringan 3G.  
     - *Dampak:* Waktu loading dashboard terasa berat dan lambat.

286. **Tidak Ada Fitur Switch Dark Mode / Light Mode Sesuai Tema Sistem Telegram**  
     - *Lokasi:* Dashboard WebApp  
     - *Gejala:* Tampilan webview terkunci pada tema gelap dan menyilaukan jika HP dalam mode terang.  
     - *Dampak:* Estetika antarmuka kurang nyaman bagi preferensi mata pengguna tertentu.

287. **Ketiadaan Masking Nomor Rekening pada Ringkasan Keuangan Publik**  
     - *Lokasi:* Dashboard WebApp  
     - *Gejala:* Nomor rekening bank terpampang penuh tanpa sensor 4 digit terakhir (`**** 1234`).  
     - *Dampak:* Risiko kebocoran nomor rekening saat layar HP dilihat orang di tempat umum.

288. **Tidak Ada Fitur Kunci Biometrik (Fingerprint / Face ID) saat Membuka Mini App**  
     - *Lokasi:* Dashboard WebApp  
     - *Gejala:* Siapapun yang memegang HP bisa langsung membuka dashboard keuangan tanpa PIN.  
     - *Dampak:* Privasi saldo keuangan rentan diintip teman yang meminjam HP.

289. **Ketiadaan Fitur Ekspor Data ke Format JSON Standar untuk Backup Portabel**  
     - *Lokasi:* `lib/export/export-data.ts`  
     - *Gejala:* Ekspor baru mendukung CSV dan SQL, belum ada format JSON standar aplikasi modern.  
     - *Dampak:* Migrasi data ke aplikasi pencatat keuangan lain membutuhkan konversi manual.

290. **Tidak Ada Integrasi Web Vitals Tracking untuk Memantau Kecepatan Loading Dashboard**  
     - *Lokasi:* Dashboard WebApp  
     - *Gejala:* Penurunan performa rendering grafik pada HP spek rendah tidak termonitor.  
     - *Dampak:* Pengalaman pengguna pada smartphone kelas entry-level kurang terpantau.

291. **Ketiadaan Lazy Loading pada Gambar dan Ikon Kartu Wisata di Dashboard**  
     - *Lokasi:* Dashboard WebApp  
     - *Gejala:* Semua gambar tempat wisata di-load bersamaan di awal buka halaman.  
     - *Dampak:* Konsumsi kuota data internet boros di awal membuka dashboard.

292. **Tidak Ada Fitur Filter Kalender Rentang Tanggal Kustom (*Custom Date Range Picker*)**  
     - *Lokasi:* Dashboard WebApp  
     - *Gejala:* Pilihan filter waktu hanya ada: Hari Ini, Bulan Ini, dan Semua Waktu.  
     - *Dampak:* Tidak bisa melihat laporan keuangan khusus tanggal 15–20 saja.

293. **Ketiadaan Fitur Print / Cetak Langsung Halaman Dashboard ke Mesin Printer Thermal**  
     - *Lokasi:* Dashboard WebApp  
     - *Gejala:* Tidak ada tombol cetak struk pembukuan langsung ke printer thermal bluetooth.  
     - *Dampak:* Bukti fisik pembukuan tidak bisa langsung dicetak di lapangan.

294. **Tidak Ada Indikator Penggunaan Memori Heap JavaScript di Halaman Dashboard**  
     - *Lokasi:* Dashboard WebApp  
     - *Gejala:* Membuka grafik analitik berulang kali dapat memicu memory leak pada browser HP.  
     - *Dampak:* Browser webview Telegram force close mendadak.

295. **Ketiadaan Validasi Ukuran Layar Tablet / iPad (*Responsive Tablet Breakpoint*)**  
     - *Lokasi:* Dashboard WebApp  
     - *Gejala:* Tampilan dashboard tampak terlalu lebar dan renggang saat dibuka di iPad/Tablet.  
     - *Dampak:* Tampilan visual di perangkat tablet kurang proporsional.

296. **Tidak Ada Fitur Multi-Bahasa (Indonesia, Jawa, Inggris) pada Menu Dashboard Web**  
     - *Lokasi:* Dashboard WebApp  
     - *Gejala:* Seluruh teks menu terkunci dalam Bahasa Indonesia formal.  
     - *Dampak:* Kurang fleksibel bagi pengguna yang terbiasa antarmuka Bahasa Inggris.

297. **Ketiadaan Fitur Auto-Logout Sesi Webview saat HP Tidak Digunakan Selama 15 Menit**  
     - *Lokasi:* `lib/supabase/queries/sessions.ts`  
     - *Gejala:* Sesi dashboard tetap aktif selamanya jika tab browser tidak ditutup manual.  
     - *Dampak:* Akun keuangan terbuka jika HP tertinggal dalam keadaan tidak terkunci.

298. **Tidak Ada Konfirmasi Dua Langkah saat Melakukan Reset Akun dari Halaman Pengaturan Web**  
     - *Lokasi:* Dashboard WebApp  
     - *Gejala:* Tombol reset data hanya butuh satu klik tanpa memasukkan kata sandi konfirmasi.  
     - *Dampak:* Risiko tertekan tidak sengaja yang menghapus seluruh data catatan.

299. **Ketiadaan Fitur Pencarian Cepat (*Global Search Bar / Ctrl+K*) di Halaman Dashboard**  
     - *Lokasi:* Dashboard WebApp  
     - *Gejala:* Harus scroll manual mencari satu transaksi lama di tabel data yang panjang.  
     - *Dampak:* Waktu mencari catatan transaksi lama memakan waktu.

300. **Tidak Ada Indikator Status Sinkronisasi Realtime dengan Google Sheets di Dashboard**  
     - *Lokasi:* Dashboard WebApp  
     - *Gejala:* Pengguna tidak tahu apakah transaksi barusan sudah berhasil masuk ke spreadsheet Google.  
     - *Dampak:* Keraguan apakah data cadangan di Google Drive sudah terupdate atau belum.

301. **Ketiadaan Fitur Berbagi Grafik Analitik Langsung ke Status Media Sosial / Telegram Story**  
     - *Lokasi:* Dashboard WebApp  
     - *Gejala:* Belum ada tombol unduh gambar kartu grafik siap share (format rasio 9:16 Instagram/Telegram Story).  
     - *Dampak:* Kurang praktis membagikan progres pencapaian finansial ke platform sosial.

302. **Tidak Ada Fitur Estimasi Pajak Penghasilan Tahunan (*PPh 21 / SPT Tahunan*) pada Dashboard**  
     - *Lokasi:* Dashboard WebApp  
     - *Gejala:* Total penghasilan tahunan belum dirangkum dalam format draf pelaporan SPT pajak.  
     - *Dampak:* Repot menghitung omset bruto saat musim lapor pajak tahunan tiba.

303. **Ketiadaan Penandaan Transaksi yang Membutuhkan Nota Bukti Fisik (*Need Receipt Badge*)**  
     - *Lokasi:* Dashboard WebApp  
     - *Gejala:* Transaksi tanpa lampiran foto struk tidak diberi label peringatan upload bukti.  
     - *Dampak:* Bukti fisik struk belanja tercecer dan hilang saat dibutuhkan untuk klaim garansi.

304. **Tidak Ada Fitur Pengelompokan Aset Berdasarkan Likuiditas (Kas Cepat vs Tabungan Terkunci)**  
     - *Lokasi:* Dashboard WebApp  
     - *Gejala:* Uang di dompet fisik disamakan statusnya dengan deposito berjangka yang tidak bisa ditarik mendadak.  
     - *Dampak:* Salah mengira memiliki banyak dana siap pakai saat menghadapi kebutuhan mendesak.

305. **Ketiadaan Kilas Balik Rangkuman Tahunan Bergaya Interaktif (*Financial Year in Review / Wrapped*)**  
     - *Lokasi:* Dashboard WebApp  
     - *Gejala:* Belum ada slide animasi tahunan: *"Total jarak tempuh narik Gojek tahun ini, merchant kuliner paling sering dikunjungi, dan bulan dengan tabungan tertinggi"*.  
     - *Dampak:* Pengalaman kilas balik perjalanan finansial tahunan kurang berkesan bagi pengguna.

---

### 💬 Kesimpulan Audit & Rekomendasi Diskusi

Dokumen master ini memuat **305 temuan menyeluruh** yang mencakup setiap detail arsitektur, batas logika algoritma, dan nuansa operasional lapangan Mas Firman. 

Seluruh temuan ini siap menjadi peta jalan (*roadmap*) penyempurnaan sistem bertahap maupun langsung dieksekusi secara terstruktur sesuai arahan Mas Firman.
