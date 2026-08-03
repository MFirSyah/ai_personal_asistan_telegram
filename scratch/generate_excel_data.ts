import * as fs from 'fs';
import * as path from 'path';

// Define transactions from text
const transactions = [
  { date: '2026-06-01 00:01', type: 'Pemasukan', amount: 44461, merchant: 'Saldo Awal', category: 'Tabungan/Transfer', payment_method: 'Non-Tunai', description: 'Saldo awal non-tunai', tags: 'saldo-awal' },
  { date: '2026-06-01 00:01', type: 'Pemasukan', amount: 20000, merchant: 'Saldo Awal', category: 'Tabungan/Transfer', payment_method: 'Cash', description: 'Saldo awal kas tunai', tags: 'saldo-awal' },
  
  { date: '2026-06-06 16:00', type: 'Pemasukan', amount: 4700000, merchant: 'PT. RAPI TRANSLOGISTIK INDONESIA', category: 'Gaji', payment_method: 'BCA (Non-Tunai)', description: 'Gaji terakhir serah terima tugas log GPS', tags: 'gaji, rti' },
  { date: '2026-06-06 16:00', type: 'Pengeluaran', amount: 10000, merchant: 'BCA', category: 'Tagihan/Biaya Admin', payment_method: 'BCA (Non-Tunai)', description: 'Biaya admin BCA masukan gaji', tags: 'admin-bank' },
  
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

  { date: '2026-06-09 14:01', type: 'Pengeluaran', amount: 19000, merchant: 'Indomaret', category: 'Makanan & Minuman', payment_method: 'Cash', description: 'Beli roti Indomaret & Ultramilk coklat', tags: 'snack' },
  { date: '2026-06-09 16:10', type: 'Pengeluaran', amount: 425000, merchant: 'Bengkel Motor', category: 'Otomotif/Servis', payment_method: 'Non-Tunai', description: 'Penggantian ban belakang motor PCX', tags: 'pcx, bengkel' },

  { date: '2026-06-10 14:20', type: 'Pengeluaran', amount: 19000, merchant: 'Indomaret', category: 'Makanan & Minuman', payment_method: 'Cash', description: 'Beli roti Indomaret double cheese & Ultra Milk coklat', tags: 'snack' },
  { date: '2026-06-10 15:08', type: 'Pengeluaran', amount: 5000, merchant: 'Bongkar Ban / SPBU', category: 'Otomotif/Servis', payment_method: 'Cash', description: 'Pengisian nitrogen ban belakang motor PCX', tags: 'nitrogen, pcx' },
  { date: '2026-06-10 21:01', type: 'Pengeluaran', amount: 120000, merchant: 'Kodam', category: 'Pakaian/Fashion', payment_method: 'Non-Tunai', description: 'Belanja celana panjang di Kodam', tags: 'fashion, kodam' },
  { date: '2026-06-10 21:09', type: 'Pengeluaran', amount: 100000, merchant: 'Kodam', category: 'Pakaian/Fashion', payment_method: 'Non-Tunai', description: 'Belanja celana pendek di Kodam', tags: 'fashion, kodam' },
  { date: '2026-06-10 21:10', type: 'Pengeluaran', amount: 18000, merchant: 'Kodam', category: 'Makanan & Minuman', payment_method: 'Non-Tunai', description: 'Membeli lumpia beef spesial di Kodam', tags: 'kuliner, kodam' },

  { date: '2026-06-11 14:37', type: 'Pengeluaran', amount: 8500, merchant: 'Toko/Minimarket', category: 'Makanan & Minuman', payment_method: 'Cash', description: 'Membeli Nescafe oat latte', tags: 'kopi' },
  { date: '2026-06-11 17:01', type: 'Pengeluaran', amount: 4500, merchant: 'Toko/Minimarket', category: 'Makanan & Minuman', payment_method: 'Cash', description: 'Membeli kopi ABC choco malt', tags: 'kopi' },
];

const activities = [
  { date: '2026-06-06 07:00 - 16:00', title: 'Hari Terakhir Kerja di PT. RAPI TRANSLOGISTIK INDONESIA', category: 'Pekerjaan', priority: 'high', status: 'completed', description: 'Menyelesaikan hari terakhir kerja termasuk serah terima tugas' },
  { date: '2026-06-06 12:00 - 16:00', title: 'Serah Terima Tugas Log GPS Monitoring', category: 'Pekerjaan', priority: 'high', status: 'completed', description: 'Mengirimkan rekapan log GPS monitoring harian kepada kandidat baru' },
  { date: '2026-06-06 18:00 - 20:00', title: 'Bowo (Kondangan) Pernikahan', category: 'Sosial', priority: 'medium', status: 'completed', description: 'Hajatan pernikahan Mas Roby & Fira serta teman sekelas Rifa' },
  { date: '2026-06-06 20:00 - 23:59', title: 'Ngopi Bersama Teman-Teman', category: 'Sosial', priority: 'low', status: 'completed', description: 'Agenda santai ngopi bareng teman' },

  { date: '2026-06-07 10:00 - 13:00', title: 'Pasang Router Wifi Rumah Om Ryno', category: 'Pekerjaan/Jasa', priority: 'medium', status: 'completed', description: 'Memasang router wifi di rumah Om Ryno (dapat upah Rp 100rb)' },

  { date: '2026-06-08 09:00 - 15:00', title: 'Ke Kampus TTD Pengesahan Magang', category: 'Akademik', priority: 'urgent', status: 'completed', description: 'Meminta tanda tangan lembar pengesahan laporan akhir magang' },
  { date: '2026-06-08 15:30 - 17:30', title: 'Presentasi Akhir Studi Independen Dicoding', category: 'Akademik', priority: 'urgent', status: 'completed', description: 'Presentasi akhir program Dicoding x DBS Foundation' },

  { date: '2026-06-09 09:00 - 15:00', title: 'Ke Kampus TTD Laporan Akhir (Lanjutan)', category: 'Akademik', priority: 'urgent', status: 'completed', description: 'Melanjutkan proses tanda tangan pengesahan laporan akhir' },

  { date: '2026-06-10 14:00 - 15:00', title: 'Bimbingan Skripsi Daring Dosen Pembimbing', category: 'Akademik', priority: 'urgent', status: 'completed', description: 'Bimbingan skripsi online bersama Bu Regita' },
  { date: '2026-06-10 21:00 - 23:00', title: 'Jalan-jalan ke Kodam', category: 'Hiburan', priority: 'low', status: 'completed', description: 'Cari makan dan belanja celana di Pasar Kodam' },
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

const actHeaders = ['Tanggal & Waktu', 'Judul Aktivitas / Agenda', 'Kategori', 'Prioritas', 'Status', 'Deskripsi / Detail Agenda'];
const actRows = activities.map(a => [a.date, a.title, a.category, a.priority, a.status, a.description]);

const txCsv = createCsv(txHeaders, txRows);
const actCsv = createCsv(actHeaders, actRows);

const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

fs.writeFileSync(path.join(publicDir, 'Export_Transaksi_Juni_2026.csv'), txCsv, 'utf-8');
fs.writeFileSync(path.join(publicDir, 'Export_Aktivitas_Juni_2026.csv'), actCsv, 'utf-8');

console.log('Successfully generated Excel/CSV files in public directory!');
