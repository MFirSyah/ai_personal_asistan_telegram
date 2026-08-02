import { supabaseAdmin } from '../supabase/client';

export interface InsightItem {
  id: number;
  type: 'text' | 'chart' | 'stat';
  title: string;
  category: 'reflection' | 'current' | 'projection';
  data?: any;
  chart_config?: any;
  insight_text: string;
}

export async function calculate20Analytics(userId: string): Promise<InsightItem[]> {
  // Fetch transactions and activities for user
  const { data: txs } = await supabaseAdmin
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('occurred_at', { ascending: false });

  const { data: acts } = await supabaseAdmin
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('occurred_at', { ascending: false });

  const transactions = txs || [];
  const activities = acts || [];

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const netSavings = totalIncome - totalExpense;

  // Category breakdown
  const categoryTotals: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const cat = t.category_id || 'Lain-lain';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(t.amount || 0);
    });

  const catLabels = Object.keys(categoryTotals);
  const catData = Object.values(categoryTotals);

  // Top Merchants
  const merchantTotals: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'expense' && t.merchant)
    .forEach((t) => {
      const m = t.merchant!;
      merchantTotals[m] = (merchantTotals[m] || 0) + Number(t.amount || 0);
    });

  const topMerchants = Object.entries(merchantTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // 20 Analytics List Construction
  const insights: InsightItem[] = [
    // --- Group 1: Refleksi & Tren Historis ---
    {
      id: 1,
      type: 'stat',
      title: 'Total Pengeluaran Akumulasi',
      category: 'reflection',
      data: { amount: totalExpense },
      insight_text: `Total pengeluaran yang tercatat saat ini adalah Rp ${totalExpense.toLocaleString('id-ID')}.`,
    },
    {
      id: 2,
      type: 'stat',
      title: 'Total Pemasukan Akumulasi',
      category: 'reflection',
      data: { amount: totalIncome },
      insight_text: `Total pemasukan tercatat adalah Rp ${totalIncome.toLocaleString('id-ID')}.`,
    },
    {
      id: 3,
      type: 'stat',
      title: 'Net Tabungan & Surplus',
      category: 'reflection',
      data: { amount: netSavings },
      insight_text: netSavings >= 0
        ? `Surplus arus kas kamu positif sebesar Rp ${netSavings.toLocaleString('id-ID')}.`
        : `Defisit arus kas sebesar Rp ${Math.abs(netSavings).toLocaleString('id-ID')}.`,
    },
    {
      id: 4,
      type: 'chart',
      title: 'Distribusi Pengeluaran Per Kategori',
      category: 'reflection',
      chart_config: {
        type: 'pie',
        labels: catLabels.length ? catLabels : ['Belum Ada Data'],
        datasets: [{ label: 'Pengeluaran (Rp)', data: catData.length ? catData : [0] }],
      },
      insight_text: 'Visualisasi porsi alokasi pengeluaran keuangan kamu berdasarkan kategori.',
    },
    {
      id: 5,
      type: 'stat',
      title: 'Rata-rata Pengeluaran Per Transaksi',
      category: 'reflection',
      data: {
        avg: transactions.length ? Math.round(totalExpense / Math.max(1, transactions.length)) : 0,
      },
      insight_text: `Rata-rata nominal per transaksi adalah Rp ${Math.round(
        totalExpense / Math.max(1, transactions.length)
      ).toLocaleString('id-ID')}.`,
    },
    {
      id: 6,
      type: 'text',
      title: 'Merchant Terfavorit / Tersering Dituju',
      category: 'reflection',
      data: { topMerchants },
      insight_text: topMerchants.length
        ? `Merchant utama kamu: ${topMerchants.map(([m, val]) => `${m} (Rp ${val.toLocaleString('id-ID')})`).join(', ')}.`
        : 'Belum ada merchant yang sering dicatat.',
    },
    {
      id: 7,
      type: 'stat',
      title: 'Frekuensi Aktivitas Personal',
      category: 'reflection',
      data: { count: activities.length },
      insight_text: `Kamu telah mencatat total ${activities.length} aktivitas personal sejauh ini.`,
    },

    // --- Group 2: Kondisi Keuangan & Aktivitas Saat Ini ---
    {
      id: 8,
      type: 'stat',
      title: 'Rasio Pemasukan vs Pengeluaran',
      category: 'current',
      data: { ratio: totalIncome > 0 ? ((totalExpense / totalIncome) * 100).toFixed(1) : 0 },
      insight_text: totalIncome > 0
        ? `Kamu membelanjakan ${((totalExpense / totalIncome) * 100).toFixed(1)}% dari total pemasukan.`
        : 'Belum ada data pemasukan untuk menghitung rasio.',
    },
    {
      id: 9,
      type: 'chart',
      title: 'Tren Transaksi Terakhir',
      category: 'current',
      chart_config: {
        type: 'bar',
        labels: transactions.slice(0, 7).map((t) => new Date(t.occurred_at).toLocaleDateString('id-ID')),
        datasets: [
          {
            label: 'Nominal (Rp)',
            data: transactions.slice(0, 7).map((t) => Number(t.amount)),
          },
        ],
      },
      insight_text: 'Grafik riwayat 7 transaksi terakhir kamu.',
    },
    {
      id: 10,
      type: 'text',
      title: 'Kategori Pengeluaran Terbesar',
      category: 'current',
      data: { topCategory: catLabels[0] || 'N/A' },
      insight_text: catLabels.length
        ? `Kategori pengeluaran tertinggi kamu adalah "${catLabels[0]}".`
        : 'Belum ada kategori terdeteksi.',
    },
    {
      id: 11,
      type: 'stat',
      title: 'Jumlah Transaksi Manual vs OCR Struk',
      category: 'current',
      data: {
        manual: transactions.filter((t) => t.source === 'chat_manual').length,
        ocr: transactions.filter((t) => t.source === 'receipt_ocr').length,
      },
      insight_text: `Pencatatan manual: ${transactions.filter((t) => t.source === 'chat_manual').length}, OCR Struk: ${transactions.filter((t) => t.source === 'receipt_ocr').length}.`,
    },
    {
      id: 12,
      type: 'text',
      title: 'Aktivitas Personal Terbaru',
      category: 'current',
      data: { latestActivity: activities[0]?.title || 'Belum Ada' },
      insight_text: activities.length
        ? `Aktivitas terbaru kamu: "${activities[0].title}".`
        : 'Belum ada aktivitas personal yang dicatat.',
    },
    {
      id: 13,
      type: 'stat',
      title: 'Tingkat Kelancaran Pencatatan',
      category: 'current',
      data: { totalRecords: transactions.length + activities.length },
      insight_text: `Total ${transactions.length + activities.length} entri berhasil tersimpan di sistem.`,
    },
    {
      id: 14,
      type: 'stat',
      title: 'Pencapaian Rencana Aktif',
      category: 'current',
      data: { activePlansCount: 0 },
      insight_text: 'Pantau kemajuan rencana keuangan dan aktivitas yang telah kamu buat.',
    },

    // --- Group 3: Proyeksi Linear & Rekomendasi ---
    {
      id: 15,
      type: 'stat',
      title: 'Proyeksi Pengeluaran Akhir Bulan',
      category: 'projection',
      data: { projectedExpense: Math.round(totalExpense * 1.25) },
      insight_text: `Berdasarkan ritme saat ini, estimasi pengeluaran akhir bulan diproyeksikan sekitar Rp ${Math.round(totalExpense * 1.25).toLocaleString('id-ID')}.`,
    },
    {
      id: 16,
      type: 'stat',
      title: 'Estimasi Potensi Tabungan Bulanan',
      category: 'projection',
      data: { projectedSavings: Math.max(0, netSavings) },
      insight_text: `Potensi dana tersisa yang dapat disimpankan ke tabungan: Rp ${Math.max(0, netSavings).toLocaleString('id-ID')}.`,
    },
    {
      id: 17,
      type: 'text',
      title: 'Rekomendasi Hemat Kategori Operasional',
      category: 'projection',
      insight_text: 'Pertimbangkan untuk mengevaluasi kembali pos pengeluaran sekunder atau impulsif.',
    },
    {
      id: 18,
      type: 'text',
      title: 'Saran Keseimbangan Gaya Hidup & Aktivitas',
      category: 'projection',
      insight_text: 'Seimbangkan alokasi dana harian dengan aktivitas kesehatan & olahraga rutin.',
    },
    {
      id: 19,
      type: 'stat',
      title: 'Batas Maksimum Pengeluaran Harian Aman',
      category: 'projection',
      data: { safeDailyLimit: Math.round(totalIncome > 0 ? (totalIncome * 0.7) / 30 : 100000) },
      insight_text: `Batas pengeluaran harian aman yang direkomendasikan adalah Rp ${Math.round(
        totalIncome > 0 ? (totalIncome * 0.7) / 30 : 100000
      ).toLocaleString('id-ID')}/hari.`,
    },
    {
      id: 20,
      type: 'text',
      title: 'Skor Kesehatan Keuangan Personal',
      category: 'projection',
      data: { score: netSavings >= 0 ? '85/100 (Sehat)' : '55/100 (Perlu Penyesuaian)' },
      insight_text: netSavings >= 0
        ? 'Kondisi keuangan kamu dalam status sehat dengan surplus positif.'
        : 'Pengeluaran melebihi pemasukan, disarankan melakukan efisiensi.',
    },
  ];

  return insights;
}
