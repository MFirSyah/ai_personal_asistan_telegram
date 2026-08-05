import { supabaseAdmin } from '../supabase/client';

export interface InsightItem {
  id: number;
  type: 'text' | 'chart' | 'stat';
  title: string;
  category: 'reflection' | 'current' | 'projection';
  data?: any;
  chartData?: { name: string; value: number }[];
  insight: string;
}

export async function calculate20Analytics(userId: string): Promise<InsightItem[]> {
  // Fix #8: Select ONLY essential columns (avoiding raw_ai_response JSON payloads) and limit to last 500
  const { data: txs } = await supabaseAdmin
    .from('transactions')
    .select('id, amount, type, merchant, description, source, occurred_at, category_id')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('occurred_at', { ascending: false })
    .limit(500);

  const { data: acts } = await supabaseAdmin
    .from('activities')
    .select('id, title, description, occurred_at, status, priority')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('occurred_at', { ascending: false })
    .limit(200);

  const transactions = txs || [];
  const activities = acts || [];

  const expenseTxs = transactions.filter((t) => t.type === 'expense');
  const totalExpense = expenseTxs.reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const netSavings = totalIncome - totalExpense;
  const avgExpensePerTx = expenseTxs.length ? Math.round(totalExpense / expenseTxs.length) : 0;

  const { data: userCats } = await supabaseAdmin
    .from('categories')
    .select('id, name')
    .eq('user_id', userId);

  const catMap = new Map<string, string>();
  (userCats || []).forEach((c) => catMap.set(c.id, c.name));

  // Category breakdown
  const categoryTotals: Record<string, number> = {};
  expenseTxs.forEach((t) => {
    const catName = (t.category_id && catMap.get(t.category_id)) || t.merchant || 'Lain-lain';
    categoryTotals[catName] = (categoryTotals[catName] || 0) + Number(t.amount || 0);
  });

  const sortedCatEntries = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const catLabels = sortedCatEntries.map(([name]) => name);
  const catData = sortedCatEntries.map(([, val]) => val);

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

  // Fix #16: Real monthly projection math based on current day of month
  const now = new Date();
  const currentDayOfMonth = Math.max(1, now.getDate());
  const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const remainingDaysInMonth = Math.max(0, totalDaysInMonth - currentDayOfMonth);

  // Current month transactions only
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const currentMonthExpenses = transactions
    .filter((t) => t.type === 'expense' && t.occurred_at >= currentMonthStart)
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const dailyBurnRate = currentMonthExpenses / currentDayOfMonth;
  const projectedMonthEndExpense = Math.round(currentMonthExpenses + dailyBurnRate * remainingDaysInMonth);

  // Fix #17: Real financial health score calculation based on Savings Ratio
  let healthScore = 70;
  let healthStatus = 'Cukup Sehat';
  let healthInsight = 'Kondisi keuangan kamu cukup stabil.';

  if (totalIncome > 0) {
    const savingsRatio = (netSavings / totalIncome) * 100;
    if (savingsRatio >= 30) {
      healthScore = 95;
      healthStatus = 'Sangat Sehat (Surplus >30%)';
      healthInsight = 'Luar biasa! Kamu berhasil menabung lebih dari 30% dari total pemasukan.';
    } else if (savingsRatio >= 15) {
      healthScore = 80;
      healthStatus = 'Sehat (Surplus 15-30%)';
      healthInsight = 'Kondisi keuangan kamu dalam kategori baik dengan rasio tabungan yang sehat.';
    } else if (savingsRatio >= 0) {
      healthScore = 65;
      healthStatus = 'Waspada (Surplus <15%)';
      healthInsight = 'Kamu masih surplus, namun alokasi tabungan masih di bawah rekomendasi ideal 15%.';
    } else {
      healthScore = 40;
      healthStatus = 'Defisit (Pengeluaran > Pemasukan)';
      healthInsight = 'Pengeluaran kamu melebihi pemasukan bulan ini. Disarankan melakukan efisiensi pos opsional.';
    }
  } else if (totalExpense > 0) {
    healthScore = 50;
    healthStatus = 'Perlu Pemasukan';
    healthInsight = 'Belum ada data pemasukan yang dicatat untuk menghitung rasio kesehatan secara akurat.';
  }

  // Build Recharts-compatible chart data arrays
  const categoryChartData = catLabels.map((label, i) => ({ name: label, value: catData[i] }));
  const trendChartData = transactions.slice(0, 7).reverse().map((t) => ({
    name: new Date(t.occurred_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
    value: Number(t.amount),
  }));
  const merchantChartData = topMerchants.map(([m, val]) => ({ name: m, value: val }));

  const completedActs = activities.filter((a) => (a as any).status === 'completed').length;
  const pendingActs = activities.filter((a) => (a as any).status === 'scheduled' || (a as any).status === 'in_progress').length;
  const activityStatusChartData = completedActs + pendingActs > 0
    ? [{ name: 'Selesai', value: completedActs }, { name: 'Pending', value: pendingActs }]
    : [];

  const safeDailyLimitValue = Math.round(totalIncome > 0 ? (totalIncome * 0.7) / 30 : 100000);

  // 20 Analytics List Construction
  const insights: InsightItem[] = [
    // --- Group 1: Refleksi & Tren Historis ---
    {
      id: 1,
      type: 'stat',
      title: 'Total Pengeluaran Akumulasi',
      category: 'reflection',
      data: { amount: totalExpense },
      insight: `Total pengeluaran yang tercatat saat ini adalah Rp ${totalExpense.toLocaleString('id-ID')}.`,
    },
    {
      id: 2,
      type: 'stat',
      title: 'Total Pemasukan Akumulasi',
      category: 'reflection',
      data: { amount: totalIncome },
      insight: `Total pemasukan tercatat adalah Rp ${totalIncome.toLocaleString('id-ID')}.`,
    },
    {
      id: 3,
      type: 'stat',
      title: 'Net Tabungan & Surplus',
      category: 'reflection',
      data: { amount: netSavings },
      insight: netSavings >= 0
        ? `Surplus arus kas kamu positif sebesar Rp ${netSavings.toLocaleString('id-ID')}.`
        : `Defisit arus kas sebesar Rp ${Math.abs(netSavings).toLocaleString('id-ID')}.`,
    },
    {
      id: 4,
      type: 'chart',
      title: 'Distribusi Pengeluaran Per Kategori',
      category: 'reflection',
      chartData: categoryChartData.length > 0 ? categoryChartData : undefined,
      insight: 'Visualisasi porsi alokasi pengeluaran keuangan kamu berdasarkan kategori.',
    },
    {
      id: 5,
      type: 'stat',
      title: 'Rata-rata Pengeluaran Per Transaksi',
      category: 'reflection',
      data: {
        avg: avgExpensePerTx,
      },
      insight: `Rata-rata nominal per pengeluaran adalah Rp ${avgExpensePerTx.toLocaleString('id-ID')}.`,
    },
    {
      id: 6,
      type: 'chart',
      title: 'Merchant Terfavorit / Tersering Dituju',
      category: 'reflection',
      data: { topMerchants },
      chartData: merchantChartData.length > 0 ? merchantChartData : undefined,
      insight: topMerchants.length
        ? `Merchant utama kamu: ${topMerchants.map(([m, val]) => `${m} (Rp ${val.toLocaleString('id-ID')})`).join(', ')}.`
        : 'Belum ada merchant yang sering dicatat.',
    },
    {
      id: 7,
      type: 'chart',
      title: 'Frekuensi & Status Aktivitas Personal',
      category: 'reflection',
      data: { count: activities.length, completed: completedActs, pending: pendingActs },
      chartData: activityStatusChartData.length > 0 ? activityStatusChartData : undefined,
      insight: `Kamu telah mencatat total ${activities.length} aktivitas personal (${completedActs} selesai, ${pendingActs} pending).`,
    },

    // --- Group 2: Kondisi Keuangan & Aktivitas Saat Ini ---
    {
      id: 8,
      type: 'stat',
      title: 'Rasio Pemasukan vs Pengeluaran',
      category: 'current',
      data: { ratio: totalIncome > 0 ? ((totalExpense / totalIncome) * 100).toFixed(1) : 0 },
      insight: totalIncome > 0
        ? `Kamu membelanjakan ${((totalExpense / totalIncome) * 100).toFixed(1)}% dari total pemasukan.`
        : 'Belum ada data pemasukan untuk menghitung rasio.',
    },
    {
      id: 9,
      type: 'chart',
      title: 'Tren Transaksi Terakhir',
      category: 'current',
      chartData: trendChartData.length > 0 ? trendChartData : undefined,
      insight: 'Grafik riwayat 7 transaksi terakhir kamu.',
    },
    {
      id: 10,
      type: 'text',
      title: 'Kategori Pengeluaran Terbesar',
      category: 'current',
      data: { topCategory: catLabels[0] || 'N/A' },
      insight: catLabels.length
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
      insight: `Pencatatan manual: ${transactions.filter((t) => t.source === 'chat_manual').length}, OCR Struk: ${transactions.filter((t) => t.source === 'receipt_ocr').length}.`,
    },
    {
      id: 12,
      type: 'text',
      title: 'Aktivitas Personal Terbaru',
      category: 'current',
      data: { latestActivity: activities[0]?.title || 'Belum Ada' },
      insight: activities.length
        ? `Aktivitas terbaru kamu: "${activities[0].title}".`
        : 'Belum ada aktivitas personal yang dicatat.',
    },
    {
      id: 13,
      type: 'stat',
      title: 'Tingkat Kelancaran Pencatatan',
      category: 'current',
      data: { totalRecords: transactions.length + activities.length },
      insight: `Total ${transactions.length + activities.length} entri berhasil tersimpan di sistem.`,
    },
    {
      id: 14,
      type: 'stat',
      title: 'Pencapaian Rencana Aktif',
      category: 'current',
      data: { activePlansCount: 0 },
      insight: 'Pantau kemajuan rencana keuangan dan aktivitas yang telah kamu buat.',
    },

    // --- Group 3: Proyeksi Linear & Rekomendasi ---
    {
      id: 15,
      type: 'stat',
      title: 'Proyeksi Pengeluaran Akhir Bulan',
      category: 'projection',
      data: { projectedExpense: projectedMonthEndExpense },
      insight: `Berdasarkan rata-rata harian Rp ${Math.round(dailyBurnRate).toLocaleString('id-ID')}/hari (hari ke-${currentDayOfMonth}), estimasi total pengeluaran bulan ini mencapai Rp ${projectedMonthEndExpense.toLocaleString('id-ID')}.`,
    },
    {
      id: 16,
      type: 'stat',
      title: 'Estimasi Potensi Tabungan Bulanan',
      category: 'projection',
      data: { projectedSavings: Math.max(0, netSavings) },
      insight: `Potensi dana tersisa yang dapat disimpankan ke tabungan: Rp ${Math.max(0, netSavings).toLocaleString('id-ID')}.`,
    },
    {
      id: 17,
      type: 'text',
      title: 'Rekomendasi Hemat Kategori Operasional',
      category: 'projection',
      insight: 'Pertimbangkan untuk mengevaluasi kembali pos pengeluaran sekunder atau impulsif.',
    },
    {
      id: 18,
      type: 'text',
      title: 'Saran Keseimbangan Gaya Hidup & Aktivitas',
      category: 'projection',
      insight: 'Seimbangkan alokasi dana harian dengan aktivitas kesehatan & olahraga rutin.',
    },
    {
      id: 19,
      type: 'stat',
      title: 'Batas Maksimum Pengeluaran Harian Aman',
      category: 'projection',
      data: { safeDailyLimit: safeDailyLimitValue },
      insight: `Batas pengeluaran harian aman yang direkomendasikan adalah Rp ${safeDailyLimitValue.toLocaleString('id-ID')}/hari.`,
    },
    {
      id: 20,
      type: 'text',
      title: 'Skor Kesehatan Keuangan Personal',
      category: 'projection',
      data: { score: `${healthScore}/100 (${healthStatus})` },
      insight: healthInsight,
    },
  ];

  return insights;
}

