import { supabaseAdmin } from '../lib/supabase/client';

const transactions = [
  // 01 Juni 2026
  { occurred_at: '2026-06-01T00:01:00Z', type: 'income', amount: 44461, merchant: 'Saldo Awal', description: 'Saldo awal non-tunai', payment_method: 'Non-Tunai', tags: ['saldo-awal'] },
  { occurred_at: '2026-06-01T00:01:00Z', type: 'income', amount: 20000, merchant: 'Saldo Awal', description: 'Saldo awal kas tunai', payment_method: 'Cash', tags: ['saldo-awal'] },
  
  // 06 Juni 2026
  { occurred_at: '2026-06-06T16:00:00Z', type: 'income', amount: 4700000, merchant: 'PT. RAPI TRANSLOGISTIK INDONESIA', description: 'Gaji terakhir serah terima tugas log GPS', payment_method: 'BCA (Non-Tunai)', tags: ['gaji', 'rti'] },
  { occurred_at: '2026-06-06T16:00:00Z', type: 'expense', amount: 10000, merchant: 'BCA', description: 'Biaya admin BCA masukan gaji', payment_method: 'BCA (Non-Tunai)', tags: ['admin-bank'] },
  
  // 07 Juni 2026
  { occurred_at: '2026-06-07T08:00:00Z', type: 'expense', amount: 317160, merchant: 'Cicilan', description: 'Pembayaran cicilan terakhir lunas', payment_method: 'Non-Tunai', tags: ['cicilan', 'lunas'] },
  { occurred_at: '2026-06-07T09:00:00Z', type: 'income', amount: 200000, merchant: 'Transfer Kas', description: 'Penarikan uang tunai dari non-tunai', payment_method: 'Cash', tags: ['transfer-cash'] },
  { occurred_at: '2026-06-07T12:00:00Z', type: 'income', amount: 100000, merchant: 'Om Ryno', description: 'Upah jasa pasang router wifi di rumah Om Ryno', payment_method: 'Cash', tags: ['freelance'] },
  { occurred_at: '2026-06-07T12:00:00Z', type: 'expense', amount: 400000, merchant: 'Teman', description: 'Mengganti uang beli kue di teman', payment_method: 'Non-Tunai', tags: ['ganti-uang'] },
  { occurred_at: '2026-06-07T15:00:00Z', type: 'expense', amount: 33000, merchant: 'Terung Kulon', description: 'Membeli 3 porsi es teler', payment_method: 'Cash', tags: ['kuliner'] },
  { occurred_at: '2026-06-07T18:00:00Z', type: 'expense', amount: 2500, merchant: 'Bank', description: 'Biaya admin bank', payment_method: 'Non-Tunai', tags: ['admin-bank'] },
  { occurred_at: '2026-06-07T19:00:00Z', type: 'expense', amount: 49000, merchant: 'Indomaret', description: 'Beli parfum Xchange', payment_method: 'Cash', tags: ['parfum'] },
  { occurred_at: '2026-06-07T19:00:00Z', type: 'expense', amount: 50000, merchant: 'Safira', description: 'Bowo / kondangan ke rumah Safira', payment_method: 'Cash', tags: ['bowo', 'hajatan'] },
  { occurred_at: '2026-06-07T20:00:00Z', type: 'expense', amount: 50000, merchant: 'Rifa', description: 'Bowo / kondangan ke rumah Rifa', payment_method: 'Cash', tags: ['bowo', 'hajatan'] },
  { occurred_at: '2026-06-07T21:00:00Z', type: 'expense', amount: 16040, merchant: 'Shopee', description: 'Belanja barang di Shopee', payment_method: 'Non-Tunai', tags: ['shopee'] },
  { occurred_at: '2026-06-07T21:00:00Z', type: 'income', amount: 42000, merchant: 'Serabutan', description: 'Pemasukan tunai dari upah serabutan', payment_method: 'Cash', tags: ['freelance'] },
  
  // 08 Juni 2026
  { occurred_at: '2026-06-08T06:00:00Z', type: 'income', amount: 20000, merchant: 'Dana Nindya', description: 'Transfer non-tunai ke Dana Nindya (jadi cash)', payment_method: 'Cash', tags: ['transfer-cash'] },
  { occurred_at: '2026-06-08T07:00:00Z', type: 'income', amount: 60000, merchant: 'Dana Nindya', description: 'Transfer non-tunai ke Dana Nindya (jadi cash)', payment_method: 'Cash', tags: ['transfer-cash'] },
  { occurred_at: '2026-06-08T10:00:00Z', type: 'expense', amount: 54500, merchant: 'Toko/Apotek', description: 'Membeli sabun muka & vitamin C', payment_method: 'Cash', tags: ['skincare', 'kesehatan'] },
  { occurred_at: '2026-06-08T12:00:00Z', type: 'expense', amount: 50000, merchant: 'Servis HP', description: 'Servis HP (part cash Rp 50rb)', payment_method: 'Cash', tags: ['servis-hp'] },
  { occurred_at: '2026-06-08T12:00:00Z', type: 'expense', amount: 150000, merchant: 'Servis HP', description: 'Servis HP (part non-tunai Rp 150rb)', payment_method: 'Non-Tunai', tags: ['servis-hp'] },
  { occurred_at: '2026-06-08T12:06:00Z', type: 'expense', amount: 60000, merchant: 'SPBU Kletek Sidoarjo', description: 'Beli bensin di Kletek, Sidoarjo', payment_method: 'Cash', tags: ['bensin'] },
  { occurred_at: '2026-06-08T13:00:00Z', type: 'expense', amount: 247600, merchant: 'Shopee', description: 'Pembelian TWS Mithril ANC TX4', payment_method: 'Non-Tunai', tags: ['tws', 'gadget'] },
  { occurred_at: '2026-06-08T14:01:00Z', type: 'expense', amount: 5000, merchant: 'Foto Copy / Print', description: 'Print 9 lembar laporan akhir magang', payment_method: 'Cash', tags: ['print', 'magang'] },
  { occurred_at: '2026-06-08T14:09:00Z', type: 'expense', amount: 5000, merchant: 'Kopma Kampus', description: 'Membeli teh kotak di Kopma', payment_method: 'Cash', tags: ['minuman'] },
  { occurred_at: '2026-06-08T15:35:00Z', type: 'expense', amount: 26000, merchant: 'Tomoro Ketintang', description: 'Beli Tomoro Ketintang saat presentasi Dicoding', payment_method: 'Non-Tunai', tags: ['kopi'] },
  { occurred_at: '2026-06-08T16:00:00Z', type: 'expense', amount: 5500, merchant: 'Warung/Toko', description: 'Membeli es (baru)', payment_method: 'Cash', tags: ['minuman'] },
  { occurred_at: '2026-06-08T16:15:00Z', type: 'expense', amount: 55000, merchant: 'Toko Elektronik', description: 'Membeli kabel charger (baru)', payment_method: 'Non-Tunai', tags: ['charger'] },

  // 09 Juni 2026
  { occurred_at: '2026-06-09T14:01:00Z', type: 'expense', amount: 19000, merchant: 'Indomaret', description: 'Beli roti Indomaret & Ultramilk coklat', payment_method: 'Cash', tags: ['snack'] },
  { occurred_at: '2026-06-09T16:10:00Z', type: 'expense', amount: 425000, merchant: 'Bengkel Motor', description: 'Penggantian ban belakang motor PCX', payment_method: 'Non-Tunai', tags: ['pcx', 'bengkel'] },

  // 10 Juni 2026
  { occurred_at: '2026-06-10T14:20:00Z', type: 'expense', amount: 19000, merchant: 'Indomaret', description: 'Beli roti Indomaret double cheese & Ultra Milk coklat', payment_method: 'Cash', tags: ['snack'] },
  { occurred_at: '2026-06-10T15:08:00Z', type: 'expense', amount: 5000, merchant: 'Bongkar Ban / SPBU', description: 'Pengisian nitrogen ban belakang motor PCX', payment_method: 'Cash', tags: ['nitrogen', 'pcx'] },
  { occurred_at: '2026-06-10T21:01:00Z', type: 'expense', amount: 120000, merchant: 'Kodam', description: 'Belanja celana panjang di Kodam', payment_method: 'Non-Tunai', tags: ['fashion', 'kodam'] },
  { occurred_at: '2026-06-10T21:09:00Z', type: 'expense', amount: 100000, merchant: 'Kodam', description: 'Belanja celana pendek di Kodam', payment_method: 'Non-Tunai', tags: ['fashion', 'kodam'] },
  { occurred_at: '2026-06-10T21:10:00Z', type: 'expense', amount: 18000, merchant: 'Kodam', description: 'Membeli lumpia beef spesial di Kodam', payment_method: 'Non-Tunai', tags: ['kuliner', 'kodam'] },

  // 11 Juni 2026
  { occurred_at: '2026-06-11T14:37:00Z', type: 'expense', amount: 8500, merchant: 'Toko/Minimarket', description: 'Membeli Nescafe oat latte', payment_method: 'Cash', tags: ['kopi'] },
  { occurred_at: '2026-06-11T17:01:00Z', type: 'expense', amount: 4500, merchant: 'Toko/Minimarket', description: 'Membeli kopi ABC choco malt', payment_method: 'Cash', tags: ['kopi'] },

  // 2025 Jastip
  { occurred_at: '2025-06-12T12:00:00Z', type: 'expense', amount: 32000, merchant: 'Jastip Makanan', description: 'Jastip Geprek Cindo + Air Putih (13k), Hilo Avocado (5k), Capcin (6k), Jus Wortel (8k)', payment_method: 'Tidak dicantumkan', tags: ['jastip'] },

  // 2026-06-19
  { occurred_at: '2026-06-19T12:00:00Z', type: 'expense', amount: 22000, merchant: 'KAI', description: 'Kopi hitam dan mineral 1 di KAI', payment_method: 'Cash', tags: ['kai'] },
  { occurred_at: '2026-06-19T14:00:00Z', type: 'expense', amount: 44000, merchant: 'Kopi Kenangan Jombang', description: 'Kopi Kenangan Jombang', payment_method: 'Cash', tags: ['kopi-kenangan'] },

  // 2026-06-21
  { occurred_at: '2026-06-21T12:00:00Z', type: 'expense', amount: 250000, merchant: 'Pantai Sine', description: 'Liburan Sine', payment_method: 'Cash', tags: ['sine', 'liburan'] },

  // 2026-06-22 Breakdown items
  { occurred_at: '2026-06-22T12:00:00Z', type: 'expense', amount: 250000, merchant: 'Liburan Sine', description: 'Rincian Pengeluaran Uang Sisa: Jalan-jalan ke Sine', payment_method: 'Cash', tags: ['alokasi', 'sine'] },
  { occurred_at: '2026-06-22T12:00:00Z', type: 'expense', amount: 100000, merchant: 'Jalan-jalan Sendiri', description: 'Rincian Pengeluaran Uang Sisa: Jalan-jalan sendiri (Jumat)', payment_method: 'Cash', tags: ['alokasi'] },
  { occurred_at: '2026-06-22T12:00:00Z', type: 'expense', amount: 330000, merchant: 'Ibu', description: 'Rincian Pengeluaran Uang Sisa: Bayar ke ibu', payment_method: 'Cash', tags: ['alokasi', 'ibu'] },
  { occurred_at: '2026-06-22T12:00:00Z', type: 'expense', amount: 1000000, merchant: 'Jajan Sebulan', description: 'Rincian Pengeluaran Uang Sisa: Jajan sebulan', payment_method: 'Cash', tags: ['alokasi', 'jajan'] },
  { occurred_at: '2026-06-22T12:00:00Z', type: 'expense', amount: 400000, merchant: 'Motor PCX', description: 'Rincian Pengeluaran Uang Sisa: Motor', payment_method: 'Cash', tags: ['alokasi', 'motor'] },
  { occurred_at: '2026-06-22T12:00:00Z', type: 'expense', amount: 100000, merchant: 'SPBU', description: 'Rincian Pengeluaran Uang Sisa: Bensin seminggu (14-20)', payment_method: 'Cash', tags: ['alokasi', 'bensin'] },
  { occurred_at: '2026-06-22T15:00:00Z', type: 'expense', amount: 272700, merchant: 'Toko Komputer', description: 'Kipas PC 6 buah dan kontrolernya 1 merk JU TU', payment_method: 'Cash', tags: ['pc', 'kipas'] },
];

async function insertAll() {
  const { data: users } = await supabaseAdmin.from('users').select('id').limit(1);
  if (!users || !users.length) {
    console.log('No user found in DB, CSV file generated successfully for manual import.');
    return;
  }
  const userId = users[0].id;
  const txsToInsert = transactions.map((t) => ({ ...t, user_id: userId, source: 'chat_manual' }));
  const { error } = await supabaseAdmin.from('transactions').insert(txsToInsert);
  if (error) console.error('Error inserting transactions:', error.message);
  else console.log('Successfully inserted', txsToInsert.length, 'itemized transactions to Supabase!');
}

insertAll();
