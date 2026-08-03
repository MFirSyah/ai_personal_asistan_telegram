import * as fs from 'fs';
import * as path from 'path';

// Combined 2025 - 2026 transactions with individual row splitting
const transactions = [
  // 01 Juni 2026
  { date: '2026-06-01 00:01', type: 'Pemasukan', amount: 44461, merchant: 'Saldo Awal', category: 'Tabungan/Transfer', payment_method: 'Non-Tunai', description: 'Saldo awal non-tunai', tags: 'saldo-awal' },
  { date: '2026-06-01 00:01', type: 'Pemasukan', amount: 20000, merchant: 'Saldo Awal', category: 'Tabungan/Transfer', payment_method: 'Cash', description: 'Saldo awal kas tunai', tags: 'saldo-awal' },
  
  // 06 Juni 2026
  { date: '2026-06-06 16:00', type: 'Pemasukan', amount: 4700000, merchant: 'PT. RAPI TRANSLOGISTIK INDONESIA', category: 'Gaji', payment_method: 'BCA (Non-Tunai)', description: 'Gaji terakhir serah terima tugas log GPS', tags: 'gaji, rti' },
  { date: '2026-06-06 16:00', type: 'Pengeluaran', amount: 10000, merchant: 'BCA', category: 'Tagihan/Biaya Admin', payment_method: 'BCA (Non-Tunai)', description: 'Biaya admin BCA masukan gaji', tags: 'admin-bank' },
  
  // 07 Juni 2026
  { date: '2026-06-07 08:00', type: 'Pengeluaran', amount: 317160, merchant: 'Cicilan', category: 'Tagihan/Hutang', payment_method: 'Non-Tunai', description: 'Pembayaran cicilan terakhir lunas', tags: 'cicilan, lunas' },
  { date: '2026-06-07 09:00', type: 'Transfer', amount: 200000, merchant: 'Transfer Kas', category: 'Transfer', payment_method: 'Non-Tunai ke Cash', description: 'Penarikan uang tunai dari non-tunai', tags: 'transfer-cash' },
  { date: '2026-06-07 12:00', type: 'Pemasukan', amount: 100000, merchant: 'Om Ryno', category: 'Jasa/Serabutan', payment_method: 'Cash', description: 'Upah jasa pasang router wifi di rumah Om Ryno', tags: 'freelance' },
  { date: '2026-06-07 12:00', type: 'Pengeluaran', amount: 400000, merchant: 'Teman', category: 'Lain-lain', payment_method: 'Non-Tunai', description: 'Mengganti uang beli kue di teman', tags: 'ganti-uang' },
  { date: '2026-06-07 15:00', type: 'Pengeluaran', amount: 33000, merchant: 'Terung Kulon', category: 'Makanan & Minuman', payment_method: 'Cash', description: 'Membeli 3 porsi es teler', tags: 'kuliner' },
  { date: '2026-06-07 18:00', type: 'Pengeluaran', amount: 2500, merchant: 'Bank', category: 'Tagihan/Biaya Admin', payment_method: 'Non-Tunai', description: 'Biaya admin bank', tags: 'admin-bank' },
  { date: '2026-06-07 19:00', type: 'Pengeluaran', amount: 49000, merchant: 'Indomaret', category: 'Kebutuhan Pribadi', payment_method: 'Cash', description: 'Beli parfum Xchange', tags: 'parfum' },
  { date: '2026-06-07 19:00', type: 'Pengeluaran', amount: 50000, merchant: 'Safira', category: 'Sosial/Sumbangan', payment_method: 'Cash', description: 'Bowo / kondangan ke rumah Safira', tags: 'bowo, hajatan' },
  { date: '2026-06-07 20:00', type: 'Pengeluaran', amount: 50000, merchant: 'Rifa', category: 'Sosial/Sumbangan', payment_method: 'Cash', description: 'Bowo / kondangan ke rumah Rifa', tags: 'bowo, hajatan' },
  { date: '2026-06-07 21:00', type: 'Pengeluaran', amount: 16040, merchant: 'Shopee', category: 'Belanja Online', payment_method: 'Non-Tunai', description: 'Belanja barang di Shopee', tags: 'shopee' },
  { date: '2026-06-07 21:00', type: 'Pemasukan', amount: 42000, merchant: 'Serabutan', category: 'Jasa/Serabutan', payment_method: 'Cash', description: 'Pemasukan tunai dari upah serabutan', tags: 'freelance' },
  
  // 08 Juni 2026
  { date: '2026-06-08 06:00', type: 'Transfer', amount: 20000, merchant: 'Dana Nindya', category: 'Transfer', payment_method: 'Non-Tunai ke Cash', description: 'Transfer non-tunai ke Dana Nindya (jadi cash)', tags: 'transfer-cash' },
  { date: '2026-06-08 07:00', type: 'Transfer', amount: 60000, merchant: 'Dana Nindya', category: 'Transfer', payment_method: 'Non-Tunai ke Cash', description: 'Transfer non-tunai ke Dana Nindya (jadi cash)', tags: 'transfer-cash' },
  { date: '2026-06-08 10:00', type: 'Pengeluaran', amount: 54500, merchant: 'Toko/Apotek', category: 'Kebutuhan Pribadi', payment_method: 'Cash', description: 'Membeli sabun muka & vitamin C', tags: 'skincare, kesehatan' },
  { date: '2026-06-08 12:00', type: 'Pengeluaran', amount: 50000, merchant: 'Servis HP', category: 'Elektronik/Servis', payment_method: 'Cash', description: 'Servis HP (part cash Rp 50rb)', tags: 'servis-hp' },
  { date: '2026-06-08 12:00', type: 'Pengeluaran', amount: 150000, merchant: 'Servis HP', category: 'Elektronik/Servis', payment_method: 'Non-Tunai', description: 'Servis HP (part non-tunai Rp 150rb)', tags: 'servis-hp' },
  { date: '2026-06-08 12:06', type: 'Pengeluaran', amount: 60000, merchant: 'SPBU Kletek Sidoarjo', category: 'Transportasi', payment_method: 'Cash', description: 'Beli bensin di Kletek, Sidoarjo', tags: 'bensin' },
  { date: '2026-06-08 13:00', type: 'Pengeluaran', amount: 247600, merchant: 'Shopee', category: 'Elektronik/Gadget', payment_method: 'Non-Tunai', description: 'Pembelian TWS Mithril ANC TX4', tags: 'tws, gadget' },
  { date: '2026-06-08 14:01', type: 'Pengeluaran', amount: 5000, merchant: 'Foto Copy / Print', category: 'Pendidikan/Kuliah', payment_method: 'Cash', description: 'Print 9 lembar laporan akhir magang', tags: 'print, magang' },
  { date: '2026-06-08 14:09', type: 'Pengeluaran', amount: 5000, merchant: 'Kopma Kampus', category: 'Makanan & Minuman', payment_method: 'Cash', description: 'Membeli teh kotak di Kopma', tags: 'minuman' },
  { date: '2026-06-08 15:35', type: 'Pengeluaran', amount: 26000, merchant: 'Tomoro Ketintang', category: 'Makanan & Minuman', payment_method: 'Non-Tunai', description: 'Beli Tomoro Ketintang saat presentasi Dicoding', tags: 'kopi' },
  { date: '2026-06-08 16:00', type: 'Pengeluaran', amount: 5500, merchant: 'Warung/Toko', category: 'Makanan & Minuman', payment_method: 'Cash', description: 'Membeli es (baru)', tags: 'minuman' },
  { date: '2026-06-08 16:15', type: 'Pengeluaran', amount: 55000, merchant: 'Toko Elektronik', category: 'Elektronik/Gadget', payment_method: 'Non-Tunai', description: 'Membeli kabel charger (baru)', tags: 'charger' },

  // 09 Juni 2026
  { date: '2026-06-09 14:01', type: 'Pengeluaran', amount: 19000, merchant: 'Indomaret', category: 'Makanan & Minuman', payment_method: 'Cash', description: 'Beli roti Indomaret & Ultramilk coklat', tags: 'snack' },
  { date: '2026-06-09 16:10', type: 'Pengeluaran', amount: 425000, merchant: 'Bengkel Motor', category: 'Otomotif/Servis', payment_method: 'Non-Tunai', description: 'Penggantian ban belakang motor PCX', tags: 'pcx, bengkel' },

  // 10 Juni 2026
  { date: '2026-06-10 14:20', type: 'Pengeluaran', amount: 19000, merchant: 'Indomaret', category: 'Makanan & Minuman', payment_method: 'Cash', description: 'Beli roti Indomaret double cheese & Ultra Milk coklat', tags: 'snack' },
  { date: '2026-06-10 15:08', type: 'Pengeluaran', amount: 5000, merchant: 'Bongkar Ban / SPBU', category: 'Otomotif/Servis', payment_method: 'Cash', description: 'Pengisian nitrogen ban belakang motor PCX', tags: 'nitrogen, pcx' },
  { date: '2026-06-10 21:01', type: 'Pengeluaran', amount: 120000, merchant: 'Kodam', category: 'Pakaian/Fashion', payment_method: 'Non-Tunai', description: 'Belanja celana panjang di Kodam', tags: 'fashion, kodam' },
  { date: '2026-06-10 21:09', type: 'Pengeluaran', amount: 100000, merchant: 'Kodam', category: 'Pakaian/Fashion', payment_method: 'Non-Tunai', description: 'Belanja celana pendek di Kodam', tags: 'fashion, kodam' },
  { date: '2026-06-10 21:10', type: 'Pengeluaran', amount: 18000, merchant: 'Kodam', category: 'Makanan & Minuman', payment_method: 'Non-Tunai', description: 'Membeli lumpia beef spesial di Kodam', tags: 'kuliner, kodam' },

  // 11 Juni 2026
  { date: '2026-06-11 14:37', type: 'Pengeluaran', amount: 8500, merchant: 'Toko/Minimarket', category: 'Makanan & Minuman', payment_method: 'Cash', description: 'Membeli Nescafe oat latte', tags: 'kopi' },
  { date: '2026-06-11 17:01', type: 'Pengeluaran', amount: 4500, merchant: 'Toko/Minimarket', category: 'Makanan & Minuman', payment_method: 'Cash', description: 'Membeli kopi ABC choco malt', tags: 'kopi' },

  // --- NEW ADDITIONS FROM USER CHAT ---

  // 12/06/2025 Jastip (Split into items or combined)
  { date: '2025-06-12 12:00', type: 'Pengeluaran', amount: 32000, merchant: 'Jastip Makanan', category: 'Jastip / Makanan', payment_method: 'Tidak dicantumkan', description: 'Jastip Geprek Cindo + Air Putih (13k), Hilo Avocado (5k), Capcin (6k), Jus Wortel (8k)', tags: 'jastip, kuliner' },

  // Catatan Hutang 2025 (Individual Rows per Hutang Record)
  { date: '2025-06-24 12:00', type: 'Hutang/Piutang', amount: 375000, merchant: 'Catatan Hutang', category: 'Hutang', payment_method: 'Tidak dicantumkan', description: 'Catatan Hutang Rincian: Rp 50.000 + Rp 225.000 + Rp 100.000', tags: 'hutang' },
  { date: '2025-06-27 12:00', type: 'Hutang/Piutang', amount: 750000, merchant: 'Catatan Hutang', category: 'Hutang', payment_method: 'Tidak dicantumkan', description: 'Catatan Hutang Rincian: Rp 50.000 + Rp 700.000', tags: 'hutang' },
  { date: '2025-06-28 12:00', type: 'Hutang/Piutang', amount: 915000, merchant: 'Catatan Hutang', category: 'Hutang', payment_method: 'Tidak dicantumkan', description: 'Catatan Hutang Rincian: Rp 50.000 + Rp 700.000 + Rp 165.000', tags: 'hutang' },
  { date: '2025-06-29 12:00', type: 'Hutang/Piutang', amount: 1115000, merchant: 'Catatan Hutang', category: 'Hutang', payment_method: 'Tidak dicantumkan', description: 'Catatan Hutang Rincian: Rp 50.000 + Rp 700.000 + Rp 165.000 + Rp 200.000', tags: 'hutang' },
  { date: '2025-06-30 12:00', type: 'Pemasukan', amount: 1362748, merchant: 'Cingciripit', category: 'Rekap / Hasil Akhir', payment_method: 'Tidak dicantumkan', description: 'Cingciripit hasil akhir saldo', tags: 'rekap, cingciripit' },
  { date: '2025-06-30 12:00', type: 'Hutang/Piutang', amount: 1217000, merchant: 'Catatan Hutang', category: 'Hutang', payment_method: 'Tidak dicantumkan', description: 'Catatan Hutang Rincian: Rp 50k + Rp 700k + Rp 165k + Rp 200k + Rp 102k', tags: 'hutang' },
  { date: '2025-07-02 12:00', type: 'Hutang/Piutang', amount: 1017000, merchant: 'Catatan Hutang', category: 'Hutang', payment_method: 'Tidak dicantumkan', description: 'Catatan Hutang Rincian: Rp 50k + Rp 700k + Rp 165k + Rp 102k', tags: 'hutang' },
  { date: '2025-07-04 12:00', type: 'Hutang/Piutang', amount: 617000, merchant: 'Catatan Hutang', category: 'Hutang', payment_method: 'Tidak dicantumkan', description: 'Catatan Hutang Rincian: Rp 50k + Rp 300k + Rp 165k + Rp 102k', tags: 'hutang' },
  { date: '2025-07-04 12:00', type: 'Hutang/Piutang', amount: 642000, merchant: 'Catatan Hutang', category: 'Hutang', payment_method: 'Tidak dicantumkan', description: 'Catatan Hutang Rincian: Rp 50k + Rp 300k + Rp 165k + Rp 102k + Rp 25k', tags: 'hutang' },
  { date: '2025-07-07 12:00', type: 'Hutang/Piutang', amount: 961000, merchant: 'Catatan Hutang', category: 'Hutang', payment_method: 'Tidak dicantumkan', description: 'Catatan Hutang Rincian: Rp 50k + Rp 300k + Rp 165k + Rp 102k + Rp 344k', tags: 'hutang' },
  { date: '2025-07-12 12:00', type: 'Hutang/Piutang', amount: 1243000, merchant: 'Catatan Hutang', category: 'Hutang', payment_method: 'Tidak dicantumkan', description: 'Catatan Hutang Rincian: Rp 50k + Rp 300k + Rp 165k + Rp 102k + Rp 344k + Rp 282k', tags: 'hutang' },
  { date: '2025-07-20 12:00', type: 'Hutang/Piutang', amount: 943000, merchant: 'Catatan Hutang', category: 'Hutang', payment_method: 'Tidak dicantumkan', description: 'Catatan Hutang Rincian: Rp 50k + Rp 165k + Rp 102k + Rp 344k + Rp 282k', tags: 'hutang' },
  { date: '2025-07-22 12:00', type: 'Hutang/Piutang', amount: 978000, merchant: 'Catatan Hutang', category: 'Hutang', payment_method: 'Tidak dicantumkan', description: 'Catatan Hutang Rincian: Rp 50k + Rp 102k + Rp 344k + Rp 282k + Rp 200k', tags: 'hutang' },

  // 19 Juni 2026
  { date: '2026-06-19 12:00', type: 'Pengeluaran', amount: 22000, merchant: 'KAI (Kereta Api)', category: 'Makanan & Minuman', payment_method: 'Tidak dicantumkan', description: 'Kopi hitam dan mineral 1 di KAI', tags: 'kai, kopi' },
  { date: '2026-06-19 14:00', type: 'Pengeluaran', amount: 44000, merchant: 'Kopi Kenangan Jombang', category: 'Makanan & Minuman', payment_method: 'Tidak dicantumkan', description: 'Kopi Kenangan Jombang', tags: 'kopi-kenangan' },

  // 21 Juni 2026
  { date: '2026-06-21 12:00', type: 'Pengeluaran', amount: 250000, merchant: 'Pantai Sine', category: 'Hiburan/Liburan', payment_method: 'Tidak dicantumkan', description: 'Liburan jalan-jalan ke Pantai Sine', tags: 'liburan, sine' },

  // 22 Juni 2026 (Splitting the 6 items of budget breakdown into separate rows!)
  { date: '2026-06-22 12:00', type: 'Pengeluaran', amount: 250000, merchant: 'Liburan Sine', category: 'Hiburan/Liburan', payment_method: 'Tidak dicantumkan', description: 'Rincian Pengeluaran Uang Sisa: Jalan-jalan ke Sine', tags: 'alokasi, sine' },
  { date: '2026-06-22 12:00', type: 'Pengeluaran', amount: 100000, merchant: 'Jalan-jalan Sendiri', category: 'Hiburan/Pribadi', payment_method: 'Tidak dicantumkan', description: 'Rincian Pengeluaran Uang Sisa: Jalan-jalan sendiri (Jumat)', tags: 'alokasi' },
  { date: '2026-06-22 12:00', type: 'Pengeluaran', amount: 330000, merchant: 'Ibu', category: 'Keluarga/Orang Tua', payment_method: 'Tidak dicantumkan', description: 'Rincian Pengeluaran Uang Sisa: Bayar ke ibu', tags: 'alokasi, ibu' },
  { date: '2026-06-22 12:00', type: 'Pengeluaran', amount: 1000000, merchant: 'Jajan Sebulan', category: 'Kebutuhan Harian', payment_method: 'Tidak dicantumkan', description: 'Rincian Pengeluaran Uang Sisa: Jajan sebulan', tags: 'alokasi, jajan' },
  { date: '2026-06-22 12:00', type: 'Pengeluaran', amount: 400000, merchant: 'Motor PCX', category: 'Otomotif/Servis', payment_method: 'Tidak dicantumkan', description: 'Rincian Pengeluaran Uang Sisa: Perawatan motor', tags: 'alokasi, motor' },
  { date: '2026-06-22 12:00', type: 'Pengeluaran', amount: 100000, merchant: 'SPBU', category: 'Transportasi', payment_method: 'Tidak dicantumkan', description: 'Rincian Pengeluaran Uang Sisa: Bensin seminggu (14-20)', tags: 'alokasi, bensin' },

  // 22 Juni 2026 Kipas PC
  { date: '2026-06-22 15:00', type: 'Pengeluaran', amount: 272700, merchant: 'Toko Komputer / Online', category: 'Elektronik/Komputer', payment_method: 'Tidak dicantumkan', description: 'Kipas PC 6 buah dan kontrolernya 1 merek JU TU', tags: 'pc, kipas' },
];

const activities = [
  // 06 Juni 2026
  { date: '06/06/2026', start_time: '07:00', end_time: '16:00', reminder_time: '06:30 (30 mnt sebelum)', title: 'Menyelesaikan hari terakhir kerja di PT. RAPI TRANSLOGISTIK INDONESIA', category: 'Pekerjaan', priority: 'High', status: 'Selesai', description: 'Hari terakhir bekerja di PT. RAPI' },
  { date: '06/06/2026', start_time: '12:00', end_time: '16:00', reminder_time: '11:30 (30 mnt sebelum)', title: 'Mengirimkan rekapan log GPS monitoring harian', category: 'Pekerjaan', priority: 'High', status: 'Selesai', description: 'Serah terima tugas kepada kandidat baru' },
  { date: '06/06/2026', start_time: '16:00', end_time: '16:00', reminder_time: '15:45 (15 mnt sebelum)', title: 'Menerima transferan gaji terakhir', category: 'Pekerjaan', priority: 'High', status: 'Selesai', description: 'Gaji masuk ke dompet non-tunai Rp 4.700.000' },
  { date: '06/06/2026', start_time: '18:00', end_time: '20:00', reminder_time: '17:00 (1 jam sebelum)', title: 'Pergi kondangan (bowo) ke hajatan pernikahan', category: 'Sosial', priority: 'Medium', status: 'Selesai', description: 'Datang ke acara Mas Roby & Fira serta teman sekelas bernama Rifa' },
  { date: '06/06/2026', start_time: '20:00', end_time: '23:59', reminder_time: '19:30 (30 mnt sebelum)', title: 'Ngopi bersama teman-teman', category: 'Sosial', priority: 'Low', status: 'Selesai', description: 'Bersantai di malam hari' },

  // 07 Juni 2026
  { date: '07/06/2026', start_time: '08:00', end_time: '08:30', reminder_time: '07:30 (30 mnt sebelum)', title: 'Melunasi cicilan terakhir', category: 'Keuangan', priority: 'High', status: 'Selesai', description: 'Pembayaran dilakukan secara non-tunai Rp 317.160' },
  { date: '07/06/2026', start_time: '09:00', end_time: '09:30', reminder_time: '08:45 (15 mnt sebelum)', title: 'Mengambil uang tunai (transfer to cash)', category: 'Keuangan', priority: 'Medium', status: 'Selesai', description: 'Tarik tunai Rp 200.000' },
  { date: '07/06/2026', start_time: '10:00', end_time: '13:00', reminder_time: '09:30 (30 mnt sebelum)', title: 'Pergi ke rumah Om Ryno', category: 'Pekerjaan/Jasa', priority: 'Medium', status: 'Selesai', description: 'Memasang router wifi dan menerima upah jasa pasang Rp 100.000' },
  { date: '07/06/2026', start_time: '15:00', end_time: '15:30', reminder_time: '14:45 (15 mnt sebelum)', title: 'Membeli es teler di daerah Terung Kulon', category: 'Kuliner', priority: 'Low', status: 'Selesai', description: 'Beli sebanyak 3 porsi' },
  { date: '07/06/2026', start_time: '19:00', end_time: '20:00', reminder_time: '18:30 (30 mnt sebelum)', title: 'Pergi kondangan (bowo) susulan', category: 'Sosial', priority: 'Medium', status: 'Selesai', description: 'Ke rumah Safira (jam 19:00) dan rumah Rifa (jam 20:00)' },
  { date: '07/06/2026', start_time: '21:00', end_time: '21:30', reminder_time: '20:45 (15 mnt sebelum)', title: 'Berbelanja online', category: 'Belanja', priority: 'Low', status: 'Selesai', description: 'Belanja kebutuhan di Shopee' },

  // 08 Juni 2026
  { date: '08/06/2026', start_time: '09:00', end_time: '15:00', reminder_time: '08:00 (1 jam sebelum)', title: 'Pergi ke Kampus', category: 'Akademik', priority: 'Urgent', status: 'Selesai', description: 'Meminta tanda tangan lembar pengesahan laporan akhir magang' },
  { date: '08/06/2026', start_time: '12:00', end_time: '13:00', reminder_time: '11:30 (30 mnt sebelum)', title: 'Memperbaiki handphone', category: 'Servis', priority: 'High', status: 'Selesai', description: 'Servis HP di konter' },
  { date: '08/06/2026', start_time: '15:30', end_time: '17:30', reminder_time: '15:00 (30 mnt sebelum)', title: 'Mengikuti presentasi akhir Studi Independen Dicoding', category: 'Akademik', priority: 'Urgent', status: 'Selesai', description: 'Presentasi program Dicoding x DBS Foundation secara daring' },

  // 09 Juni 2026
  { date: '09/06/2026', start_time: '09:00', end_time: '15:00', reminder_time: '08:00 (1 jam sebelum)', title: 'Pergi ke Kampus (Hari ke-2)', category: 'Akademik', priority: 'Urgent', status: 'Selesai', description: 'Melanjutkan proses tanda tangan lembar pengesahan laporan magang' },
  { date: '09/06/2026', start_time: '16:10', end_time: '17:00', reminder_time: '15:40 (30 mnt sebelum)', title: 'Pergi ke bengkel motor', category: 'Otomotif', priority: 'High', status: 'Selesai', description: 'Melakukan penggantian ban belakang motor PCX' },

  // 10 Juni 2026
  { date: '10/06/2026', start_time: '14:00', end_time: '15:00', reminder_time: '13:30 (30 mnt sebelum)', title: 'Mengikuti bimbingan skripsi', category: 'Akademik', priority: 'Urgent', status: 'Selesai', description: 'Bimbingan dilakukan secara daring bersama Dosen Pembimbing Bu Regita' },
  { date: '10/06/2026', start_time: '15:08', end_time: '15:30', reminder_time: '14:50 (18 mnt sebelum)', title: 'Pergi mengisi angin ban motor', category: 'Otomotif', priority: 'Low', status: 'Selesai', description: 'Pengisian nitrogen untuk ban belakang PCX' },
  { date: '10/06/2026', start_time: '21:00', end_time: '23:00', reminder_time: '20:30 (30 mnt sebelum)', title: 'Jalan-jalan santai malam hari', category: 'Hiburan', priority: 'Low', status: 'Selesai', description: 'Pergi ke Kodam untuk mencari makan dan membeli celana' },
];

function createCsv(headers: string[], rows: any[][]): string {
  const contentRows = rows.map((row) =>
    row.map((val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    }).join(',')
  );
  return '\uFEFF' + [headers.join(','), ...contentRows].join('\n');
}

const txHeaders = ['Tanggal & Jam', 'Tipe Transaksi', 'Nominal (Rp)', 'Merchant / Pihak', 'Kategori', 'Metode Pembayaran', 'Deskripsi / Catatan', 'Tag / Label'];
const txRows = transactions.map(t => [t.date, t.type, t.amount, t.merchant, t.category, t.payment_method, t.description, t.tags]);

const actHeaders = ['Tanggal', 'Jam Mulai', 'Jam Selesai', 'Waktu Pengingat (Alarm)', 'Judul Aktivitas / Agenda', 'Kategori', 'Prioritas', 'Status', 'Keterangan / Hasil'];
const actRows = activities.map(a => [a.date, a.start_time, a.end_time, a.reminder_time, a.title, a.category, a.priority, a.status, a.description]);

const txCsv = createCsv(txHeaders, txRows);
const actCsv = createCsv(actHeaders, actRows);

const publicDir = path.join(__dirname, '../public');
const artifactsDir = 'C:\\Users\\mfirm\\.gemini\\antigravity-ide\\brain\\45f84934-d81f-40c2-a46b-ae2636715e54';

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

fs.writeFileSync(path.join(publicDir, 'Export_Transaksi_Lengkap.csv'), txCsv, 'utf-8');
fs.writeFileSync(path.join(publicDir, 'Export_Aktivitas_Lengkap.csv'), actCsv, 'utf-8');

fs.writeFileSync(path.join(artifactsDir, 'Export_Transaksi_Lengkap.csv'), txCsv, 'utf-8');
fs.writeFileSync(path.join(artifactsDir, 'Export_Aktivitas_Lengkap.csv'), actCsv, 'utf-8');

console.log('Successfully updated Export_Aktivitas_Lengkap.csv with separated start_time, end_time, and reminder_time!');
