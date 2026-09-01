import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');
    const targetUserId = searchParams.get('userId') || 'fc2758d3-78bb-4e22-b9f0-b3b16568b671';

    // Simple security check using CRON_SECRET or default dev override
    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET && secret !== 'seed_data_core_2026') {
      return NextResponse.json({ error: 'Unauthorized secret' }, { status: 401 });
    }

    // 1. Purge old transactions & activities for target user
    await supabaseAdmin.from('transactions').delete().eq('user_id', targetUserId);
    await supabaseAdmin.from('activities').delete().eq('user_id', targetUserId);

    // 2. Prepare 25 Diverse Financial Transactions
    // Spanning August 26, 2026 to September 1, 2026
    const transactionsData = [
      // Incomes (Total: Rp 3.275.000)
      { amount: 1500000, type: 'income', merchant: 'Klien Web Dev', description: 'Pelunasan termin 1 pembuatan landing page', category_id: null, source: 'chat_manual', occurred_at: '2026-08-26T09:00:00.000Z' },
      { amount: 85000, type: 'income', merchant: 'Gojek Driver', description: 'Pendapatan narik Gojek pagi hari (Cash Kertas)', category_id: null, source: 'chat_manual', occurred_at: '2026-08-26T14:30:00.000Z' },
      { amount: 120000, type: 'income', merchant: 'Gojek Driver', description: 'Pendapatan orderan GoFood & GoRide siang (Gopay)', category_id: null, source: 'chat_manual', occurred_at: '2026-08-27T17:00:00.000Z' },
      { amount: 750000, type: 'income', merchant: 'Freelance Design', description: 'Desain logo & branding paket UMKM Sidoarjo', category_id: null, source: 'chat_manual', occurred_at: '2026-08-28T11:00:00.000Z' },
      { amount: 95000, type: 'income', merchant: 'Gojek Driver', description: 'Tips dan bonus argo gacor akhir pekan (Cash Koin & Kertas)', category_id: null, source: 'chat_manual', occurred_at: '2026-08-29T20:00:00.000Z' },
      { amount: 25000, type: 'income', merchant: 'Tokopedia', description: 'Cashback koin belanja part motor Beat FI', category_id: null, source: 'chat_manual', occurred_at: '2026-08-30T10:15:00.000Z' },
      { amount: 700000, type: 'income', merchant: 'Konsultasi IT', description: 'Sesi konsultasi setup database cloud klien', category_id: null, source: 'chat_manual', occurred_at: '2026-08-31T15:00:00.000Z' },

      // Needs Expenses (50% Rule)
      { amount: 35000, type: 'expense', merchant: 'SPBU Pertamina Sidoarjo', description: 'Isi Pertalite full tank motor Beat FI (Gopay)', category_id: null, source: 'chat_manual', occurred_at: '2026-08-26T07:30:00.000Z' },
      { amount: 28000, type: 'expense', merchant: 'Warung Nasi Padang Murah', description: 'Makan siang nasi rendang + es teh (Cash Kertas)', category_id: null, source: 'chat_manual', occurred_at: '2026-08-26T12:45:00.000Z' },
      { amount: 65000, type: 'expense', merchant: 'Pasar Larangan Sidoarjo', description: 'Belanja sayur mayur, telur, dan bumbu dapur mingguan', category_id: null, source: 'chat_manual', occurred_at: '2026-08-27T06:30:00.000Z' },
      { amount: 210000, type: 'expense', merchant: 'PLN Mobile', description: 'Beli token listrik rumah 200rb (BCA Mobile)', category_id: null, source: 'chat_manual', occurred_at: '2026-08-27T19:00:00.000Z' },
      { amount: 325000, type: 'expense', merchant: 'Indihome Telkom', description: 'Pembayaran tagihan internet wifi bulanan 50 Mbps', category_id: null, source: 'chat_manual', occurred_at: '2026-08-28T08:30:00.000Z' },
      { amount: 22000, type: 'expense', merchant: 'Depot Isi Ulang Air', description: 'Beli 2 galon air mineral & gas lpg 3kg', category_id: null, source: 'chat_manual', occurred_at: '2026-08-28T16:00:00.000Z' },
      { amount: 45000, type: 'expense', merchant: 'Apotek Kimia Farma', description: 'Beli vitamin C, minyak kayu putih, dan obat flu', category_id: null, source: 'chat_manual', occurred_at: '2026-08-29T10:00:00.000Z' },
      { amount: 15000, type: 'expense', merchant: 'Cuci Motor Salju Mas Bro', description: 'Cuci bersih motor Beat FI sehabis hujan', category_id: null, source: 'chat_manual', occurred_at: '2026-08-29T16:30:00.000Z' },
      { amount: 30000, type: 'expense', merchant: 'SPBU Pertamina Waru', description: 'Isi bensin Pertalite harian mobilitas kerja', category_id: null, source: 'chat_manual', occurred_at: '2026-08-30T08:00:00.000Z' },
      { amount: 32000, type: 'expense', merchant: 'Warung Makan Bu Kris', description: 'Makan siang ayam penyet sambal terasi', category_id: null, source: 'chat_manual', occurred_at: '2026-08-31T12:15:00.000Z' },

      // Wants Expenses (30% Rule)
      { amount: 24000, type: 'expense', merchant: 'Kopi Kenangan', description: 'Es Kopi Kenangan Mantan ukuran Large', category_id: null, source: 'chat_manual', occurred_at: '2026-08-26T16:00:00.000Z' },
      { amount: 55000, type: 'expense', merchant: 'Spotify AB', description: 'Langganan bulanan Spotify Premium Individual', category_id: null, source: 'chat_manual', occurred_at: '2026-08-27T10:00:00.000Z' },
      { amount: 110000, type: 'expense', merchant: 'Gramedia Online', description: 'Buku arsitektur clean code & Next.js mastery', category_id: null, source: 'chat_manual', occurred_at: '2026-08-28T14:00:00.000Z' },
      { amount: 48000, type: 'expense', merchant: 'Mie Gacoan Sidoarjo', description: 'Makan malam mie iblis level 3 + dimsum udang keju', category_id: null, source: 'chat_manual', occurred_at: '2026-08-29T19:30:00.000Z' },
      { amount: 80000, type: 'expense', merchant: 'Cinema XXI Ciplaz', description: 'Tiket nonton bioskop akhir pekan', category_id: null, source: 'chat_manual', occurred_at: '2026-08-30T18:00:00.000Z' },
      { amount: 50000, type: 'expense', merchant: 'MyTelkomsel', description: 'Paket kuota internet darurat 15GB', category_id: null, source: 'chat_manual', occurred_at: '2026-08-31T09:30:00.000Z' },

      // Savings & Investment / Sinking Fund (20% Rule)
      { amount: 300000, type: 'expense', merchant: 'Bank Jago Pocket', description: 'Alokasi tabungan dana darurat & sinking fund servis', category_id: null, source: 'chat_manual', occurred_at: '2026-08-28T10:00:00.000Z' },
      { amount: 200000, type: 'expense', merchant: 'Bibit Reksadana', description: 'Top up reksadana pasar uang obligasi stabil', category_id: null, source: 'chat_manual', occurred_at: '2026-09-01T08:30:00.000Z' }
    ];

    // 3. Prepare 25 Comprehensive Activities
    // Spanning Gantt Roadmaps, Eisenhower 4 Quadrants, and Various Statuses
    const activitiesData = [
      // Multi-Day Roadmaps (Perfect for Gantt Chart bars)
      {
        title: 'Touring & Family Gathering Dieng 2 Hari',
        description: 'Perjalanan touring liburan keluarga rute Sidoarjo - Wonosobo - Dieng Plateau',
        priority: 'medium',
        status: 'completed',
        occurred_at: '2026-08-29T06:00:00.000Z'
      },
      {
        title: 'Pelatihan & Workshop AI Antigravity 3 Hari',
        description: 'Workshop intensif pengembangan asisten pribadi cerdas berbasis Google DeepMind',
        priority: 'urgent',
        status: 'in_progress',
        occurred_at: '2026-08-31T08:30:00.000Z'
      },
      {
        title: 'Roadmap Sprint Migrasi Database Supabase 7 Hari',
        description: 'Eksekusi audit skema, indexing performa tinggi, dan pengamanan RLS database',
        priority: 'high',
        status: 'in_progress',
        occurred_at: '2026-08-27T09:00:00.000Z'
      },
      {
        title: 'Renovasi Kamar Kerja & Studio Coding 2 Hari',
        description: 'Pemasangan meja ergonomis, pencahayaan video call, dan manajemen kabel studio',
        priority: 'low',
        status: 'scheduled',
        occurred_at: '2026-09-03T08:00:00.000Z'
      },

      // Quadrant 1 (Urgent & High: Do First)
      {
        title: 'Meeting Presentasi Pitching Aplikasi ke Investor',
        description: 'Demo langsung performa live sync Supabase, offline cache, dan visual charts',
        priority: 'urgent',
        status: 'scheduled',
        occurred_at: '2026-09-01T09:00:00.000Z'
      },
      {
        title: 'Perpanjangan Masa Berlaku SIM C & STNK Motor',
        description: 'Urus perpanjangan SIM di Satpas Polresta Sidoarjo sebelum jatuh tempo',
        priority: 'urgent',
        status: 'scheduled',
        occurred_at: '2026-09-01T13:00:00.000Z'
      },
      {
        title: 'Pelunasan Tagihan Listrik & Internet Bulanan',
        description: 'Pastikan bukti pembayaran terarsip rapi di laporan pengeluaran',
        priority: 'urgent',
        status: 'completed',
        occurred_at: '2026-08-27T19:00:00.000Z'
      },
      {
        title: 'Deployment Hotfix v3.20.10 ke Production Vercel',
        description: 'Release build terbaru dengan integrasi chart visual data-driven',
        priority: 'urgent',
        status: 'completed',
        occurred_at: '2026-08-31T16:00:00.000Z'
      },

      // Quadrant 2 (Strategic & High/Medium: Plan & Schedule)
      {
        title: 'Servis Rutin Berkala & Ganti Oli Motor Beat FI',
        description: 'Ganti oli MPX2, filter udara, pembersihan CVT, dan pengecekan rem di AHASS',
        priority: 'high',
        status: 'scheduled',
        occurred_at: '2026-09-02T10:00:00.000Z'
      },
      {
        title: 'Review Portofolio Tabungan & Sinking Fund Kuartal 3',
        description: 'Evaluasi alokasi kaidah 50/30/20 dan ketahanan cash runway hingga akhir tahun',
        priority: 'high',
        status: 'scheduled',
        occurred_at: '2026-09-02T15:00:00.000Z'
      },
      {
        title: 'Penyusunan Modul Kursus Fullstack Next.js',
        description: 'Menulis silabus pembelajaran Next.js App Router, Tailwind, dan Supabase',
        priority: 'medium',
        status: 'in_progress',
        occurred_at: '2026-08-30T14:00:00.000Z'
      },
      {
        title: 'Olahraga Kardio & Jogging Sore 5 KM',
        description: 'Jogging di Gelora Delta Sidoarjo untuk menjaga stamina dan kesehatan',
        priority: 'medium',
        status: 'completed',
        occurred_at: '2026-08-30T16:30:00.000Z'
      },
      {
        title: 'Pemeriksaan Kesehatan Gigi Rutin 6 Bulanan',
        description: 'Scaling karang gigi dan konsultasi dokter gigi di Klinik Pratama',
        priority: 'medium',
        status: 'scheduled',
        occurred_at: '2026-09-04T11:00:00.000Z'
      },

      // Quadrant 3 (Routine & Low/Medium: Delegate / Automate)
      {
        title: 'Belanja Bahan Makanan Pokok & Sayur Mingguan',
        description: 'Stok beras, telur, ayam fillet, dan buah-buahan segar untuk 1 minggu',
        priority: 'medium',
        status: 'completed',
        occurred_at: '2026-08-27T06:30:00.000Z'
      },
      {
        title: 'Backup Arsip Dokumen & Database ke Google Drive',
        description: 'Sinkronisasi snapshot lokal SQLite dan nota digital ke storage terenkripsi',
        priority: 'low',
        status: 'completed',
        occurred_at: '2026-08-28T21:00:00.000Z'
      },
      {
        title: 'Pengecekan Tekanan Angin Ban Depan & Belakang',
        description: 'Set tekanan 29 PSI depan dan 33 PSI belakang untuk efisiensi BBM',
        priority: 'low',
        status: 'completed',
        occurred_at: '2026-08-29T08:00:00.000Z'
      },
      {
        title: 'Pembersihan Inbox Email & Arsip Spam',
        description: 'Sortir newsletter langganan dan verifikasi notifikasi penting',
        priority: 'low',
        status: 'completed',
        occurred_at: '2026-08-30T20:00:00.000Z'
      },
      {
        title: 'Cuci Motor Salju Rutin Mingguan',
        description: 'Bersihkan kolong mesin Beat FI dari kotoran debu aspal',
        priority: 'low',
        status: 'completed',
        occurred_at: '2026-08-31T16:30:00.000Z'
      },

      // Quadrant 4 (Eliminate / Low Priority Leisure)
      {
        title: 'Eksplorasi Game Baru di Akhir Pekan',
        description: 'Bermain santai 1-2 jam setelah target mingguan tuntas',
        priority: 'low',
        status: 'completed',
        occurred_at: '2026-08-30T21:00:00.000Z'
      },
      {
        title: 'Riset Aksesoris Phone Holder Anti Getar Motor',
        description: 'Cari holder navigasi yang kokoh untuk mobilitas harian',
        priority: 'low',
        status: 'scheduled',
        occurred_at: '2026-09-02T19:00:00.000Z'
      },

      // Additional Agenda Items with High Detail
      {
        title: 'Evaluasi KPI Mingguan Pendapatan & Pengeluaran',
        description: 'Bandingkan rasio saving rate dengan target 30% pendapatan bersih',
        priority: 'high',
        status: 'in_progress',
        occurred_at: '2026-09-01T16:00:00.000Z'
      },
      {
        title: 'Diskusi Teknis Integrasi Telegram Webhook Bot',
        description: 'Sinkronisasi notifikasi real-time via Telegram Bot API',
        priority: 'medium',
        status: 'scheduled',
        occurred_at: '2026-09-02T14:00:00.000Z'
      },
      {
        title: 'Membaca Buku 30 Halaman Sebelum Tidur',
        description: 'Lanjutkan membaca bab arsitektur sistem terdistribusi',
        priority: 'low',
        status: 'scheduled',
        occurred_at: '2026-09-01T21:30:00.000Z'
      },
      {
        title: 'Verifikasi Stok Obat Darurat P3K di Rumah',
        description: 'Cek tanggal kedaluwarsa perban, antiseptik, dan obat alergi',
        priority: 'medium',
        status: 'scheduled',
        occurred_at: '2026-09-03T16:00:00.000Z'
      },
      {
        title: 'Silaturahmi Keluarga Besar di Surabaya',
        description: 'Kunjungan keluarga akhir pekan dan makan bersama',
        priority: 'high',
        status: 'scheduled',
        occurred_at: '2026-09-05T10:00:00.000Z'
      }
    ];

    // Insert Transactions in batches
    const txToInsert = transactionsData.map(t => ({
      ...t,
      user_id: targetUserId
    }));

    const actToInsert = activitiesData.map(a => ({
      ...a,
      user_id: targetUserId
    }));

    const { data: insertedTx, error: errTx } = await supabaseAdmin.from('transactions').insert(txToInsert).select();
    if (errTx) throw errTx;

    const { data: insertedAct, error: errAct } = await supabaseAdmin.from('activities').insert(actToInsert).select();
    if (errAct) throw errAct;

    return NextResponse.json({
      ok: true,
      message: 'Berhasil menyuntikkan data dummy ke database Supabase!',
      summary: {
        userId: targetUserId,
        transactionsInserted: insertedTx?.length || 0,
        activitiesInserted: insertedAct?.length || 0,
        transactionsPreview: insertedTx?.slice(0, 3),
        activitiesPreview: insertedAct?.slice(0, 3)
      }
    });

  } catch (err: any) {
    console.error('API /api/admin/seed-dummy error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
