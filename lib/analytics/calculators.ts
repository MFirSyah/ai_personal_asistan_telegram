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

  // Robust Weighted Historical Smoothing for Early Month Days (Day 1-5)
  let dailyBurnRate = currentMonthExpenses / currentDayOfMonth;
  if (currentDayOfMonth <= 5 && totalExpense > 0) {
    const historical30dAvg = Math.max(20000, totalExpense / Math.max(30, transactions.length));
    dailyBurnRate = dailyBurnRate * 0.3 + historical30dAvg * 0.7;
  }
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

  const safeDailyLimitValue = Math.round(
    totalIncome > 0
      ? (totalIncome * 0.7) / 30
      : dailyBurnRate > 0
      ? Math.max(50000, dailyBurnRate * 0.8)
      : 100000
  );

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



export interface DailyAllowanceResult {
  dailyBurnRate: number; // R_harian
  safeDailyLimit: number; // B_harian
  remainingDaysInMonth: number;
  totalDaysInMonth: number;
  currentDayOfMonth: number;
  freeBalance: number;
  status: 'safe' | 'warning' | 'danger';
  insight: string;
}

export interface ActivityAnalyticsResult {
  totalActivities: number;
  completedActivities: number;
  pendingActivities: number;
  completionRate: number;
  avgActivitiesPerDay: number;
  priorityBreakdown: { urgent: number; medium: number; low: number };
  statusBreakdown: { completed: number; scheduled: number; in_progress: number; cancelled: number };
  insight: string;
}

export interface SimulationResult {
  scenarioName: string;
  timeframe: string;
  projectedEndingBalance: number;
  runwayDays: number;
  microLeaks: { item: string; totalAmount: number; count: number }[];
  burnRatePerDay: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  recommendations: string[];
}

export interface AffordabilityResult {
  itemName: string;
  itemPrice: number;
  currentTotalBalance: number;
  emergencyFundRequired: number;
  activeRecurringBills: number;
  freeBalance: number;
  decision: 'SAFE_TO_BUY' | 'RISKY_NEAR_EMERGENCY_FUND' | 'POSTPONE_AND_SAVE';
  recommendedMonthlySaving?: number;
  targetMonthsNeeded?: number;
  explanation: string;
}

export interface ScheduleConflictResult {
  targetDate: string;
  hasDirectConflict: boolean;
  conflictingEvents: { title: string; timeStr: string; priority: string }[];
  travelBufferNeededHours: number;
  restHoursAvailable: number;
  recommendation: string;
}

export interface TripOptimizationResult {
  destination: string;
  originalBudget: number;
  optimizedBudget: number;
  potentialSavings: number;
  itemizedBreakdown: { item: string; original: number; recommended: number; note: string }[];
  butlerAdvice: string;
}

export async function calculateRealtimeDailyAllowance(userId: string): Promise<DailyAllowanceResult> {
  const now = new Date();
  const currentDayOfMonth = Math.max(1, now.getDate());
  const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const remainingDaysInMonth = Math.max(1, totalDaysInMonth - currentDayOfMonth + 1);
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data: txs } = await supabaseAdmin
    .from('transactions')
    .select('amount, type, occurred_at')
    .eq('user_id', userId)
    .is('deleted_at', null);

  const allTxs = txs || [];
  const currentMonthExpenses = allTxs
    .filter((t) => t.type === 'expense' && t.occurred_at >= currentMonthStart)
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalIncome = allTxs.filter((t) => t.type === 'income').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalExpense = allTxs.filter((t) => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const netBalance = totalIncome - totalExpense;

  const dailyBurnRate = Math.round(currentMonthExpenses / currentDayOfMonth);
  const reservedBills = 67941;
  const freeBalance = Math.max(0, netBalance - reservedBills);
  const safeDailyLimit = Math.round(freeBalance / remainingDaysInMonth);

  let status: 'safe' | 'warning' | 'danger' = 'safe';
  let insight = `Batas belanja aman kamu hari ini adalah Rp ${safeDailyLimit.toLocaleString('id-ID')}/hari.`;

  if (dailyBurnRate > safeDailyLimit && safeDailyLimit > 0) {
    status = 'warning';
    insight = `Perhatian: Rata-rata pengeluaran harianmu (Rp ${dailyBurnRate.toLocaleString('id-ID')}) melebihi batas aman (Rp ${safeDailyLimit.toLocaleString('id-ID')}).`;
  }
  if (freeBalance <= 0) {
    status = 'danger';
    insight = `Bahaya: Saldo bebas kamu saat ini habis atau defisit. Disarankan menunda pengeluaran opsional.`;
  }

  return { dailyBurnRate, safeDailyLimit, remainingDaysInMonth, totalDaysInMonth, currentDayOfMonth, freeBalance, status, insight };
}

export async function calculateActivityMetrics(userId: string): Promise<ActivityAnalyticsResult> {
  const { data: acts } = await supabaseAdmin
    .from('activities')
    .select('id, title, status, priority, occurred_at')
    .eq('user_id', userId)
    .is('deleted_at', null);

  const activities = acts || [];
  const totalActivities = activities.length;
  const completedActivities = activities.filter((a) => a.status === 'completed').length;
  const pendingActivities = activities.filter((a) => a.status === 'scheduled' || a.status === 'in_progress').length;
  const completionRate = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

  const priorityBreakdown = {
    urgent: activities.filter((a) => a.priority === 'urgent' || a.priority === 'high').length,
    medium: activities.filter((a) => a.priority === 'medium').length,
    low: activities.filter((a) => a.priority === 'low').length,
  };

  const statusBreakdown = {
    completed: completedActivities,
    scheduled: activities.filter((a) => a.status === 'scheduled').length,
    in_progress: activities.filter((a) => a.status === 'in_progress').length,
    cancelled: activities.filter((a) => a.status === 'cancelled').length,
  };

  const distinctDates = new Set(activities.map((a) => a.occurred_at?.split('T')[0]));
  const activeDays = Math.max(1, distinctDates.size);
  const avgActivitiesPerDay = Math.round((totalActivities / activeDays) * 10) / 10;

  const insight = `Tingkat penyelesaian agenda kamu adalah ${completionRate}% (${completedActivities}/${totalActivities} selesai). Rata-rata ${avgActivitiesPerDay} agenda/hari.`;

  return { totalActivities, completedActivities, pendingActivities, completionRate, avgActivitiesPerDay, priorityBreakdown, statusBreakdown, insight };
}

export async function runFinancialSimulation(
  userId: string,
  timeframe: string,
  customParams?: { incomeChangePct?: number; expenseChangePct?: number; addMonthlyBill?: number }
): Promise<SimulationResult> {
  const { data: txs } = await supabaseAdmin
    .from('transactions')
    .select('amount, type, merchant, description, occurred_at')
    .eq('user_id', userId)
    .is('deleted_at', null);

  const transactions = txs || [];
  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const currentNetBalance = totalIncome - totalExpense;

  const leakMap: Record<string, { total: number; count: number }> = {};
  transactions
    .filter((t) => t.type === 'expense' && Number(t.amount) <= 35000)
    .forEach((t) => {
      const key = t.merchant || t.description || 'Jajan Harian';
      if (!leakMap[key]) leakMap[key] = { total: 0, count: 0 };
      leakMap[key].total += Number(t.amount);
      leakMap[key].count += 1;
    });

  const microLeaks = Object.entries(leakMap)
    .filter(([, v]) => v.count >= 2)
    .map(([k, v]) => ({ item: k, totalAmount: v.total, count: v.count }))
    .sort((a, b) => b.totalAmount - a.totalAmount);

  const now = new Date();
  const currentDayOfMonth = Math.max(1, now.getDate());
  const dailyBurnRate = Math.max(10000, Math.round(totalExpense / Math.max(30, currentDayOfMonth)));

  let projectedEndingBalance = currentNetBalance;
  let runwayDays = dailyBurnRate > 0 ? Math.floor(currentNetBalance / dailyBurnRate) : 999;
  let scenarioName = 'Simulasi Standar';
  let riskLevel: 'low' | 'moderate' | 'high' | 'critical' = 'low';
  const recommendations: string[] = [];

  if (timeframe === 'zero_income_stress_test') {
    scenarioName = 'Simulasi Uji Stres Tanpa Pemasukan (Zero Income)';
    runwayDays = Math.max(0, Math.floor(currentNetBalance / dailyBurnRate));
    projectedEndingBalance = 0;
    riskLevel = runwayDays < 30 ? 'critical' : runwayDays < 90 ? 'high' : 'moderate';
    recommendations.push(`Tanpa pemasukan baru, saldo Anda sebesar Rp ${currentNetBalance.toLocaleString('id-ID')} hanya dapat bertahan selama ${runwayDays} hari.`);
  } else if (timeframe === 'next_6m') {
    scenarioName = 'Proyeksi Keuangan 6 Bulan Ke Depan';
    const incMod = 1 + (customParams?.incomeChangePct || 0) / 100;
    const expMod = 1 + (customParams?.expenseChangePct || 0) / 100;
    const addBill = customParams?.addMonthlyBill || 0;
    const monthlyInc = (totalIncome / Math.max(1, currentDayOfMonth / 30)) * incMod;
    const monthlyExp = (totalExpense / Math.max(1, currentDayOfMonth / 30)) * expMod + addBill;
    const netMonthly = monthlyInc - monthlyExp;
    projectedEndingBalance = Math.round(currentNetBalance + netMonthly * 6);
    recommendations.push(`Estimasi saldo Anda 6 bulan ke depan adalah Rp ${projectedEndingBalance.toLocaleString('id-ID')}.`);
  } else {
    scenarioName = `Simulasi Periode (${timeframe})`;
    recommendations.push(`Kondisi keuangan saat ini stabil dengan runway ${runwayDays} hari.`);
  }

  if (microLeaks.length > 0) {
    const topLeak = microLeaks[0];
    recommendations.push(`Potensi Kebocoran Halus: Pembelian "${topLeak.item}" terjadi ${topLeak.count}x dengan akumulasi Rp ${topLeak.totalAmount.toLocaleString('id-ID')}.`);
  }

  return { scenarioName, timeframe, projectedEndingBalance, runwayDays, microLeaks, burnRatePerDay: dailyBurnRate, riskLevel, recommendations };
}

export async function calculateItemAffordability(userId: string, itemName: string, itemPrice: number): Promise<AffordabilityResult> {
  const { data: txs } = await supabaseAdmin.from('transactions').select('amount, type').eq('user_id', userId).is('deleted_at', null);
  const allTxs = txs || [];
  const totalIncome = allTxs.filter((t) => t.type === 'income').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalExpense = allTxs.filter((t) => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const currentTotalBalance = totalIncome - totalExpense;

  const monthlyExpenseEst = Math.max(500000, Math.round(totalExpense / 2));
  const emergencyFundRequired = monthlyExpenseEst * 3;
  const activeRecurringBills = 67941;
  const freeBalance = Math.max(0, currentTotalBalance - emergencyFundRequired - activeRecurringBills);

  let decision: 'SAFE_TO_BUY' | 'RISKY_NEAR_EMERGENCY_FUND' | 'POSTPONE_AND_SAVE' = 'POSTPONE_AND_SAVE';
  let recommendedMonthlySaving = 0;
  let targetMonthsNeeded = 0;
  let explanation = '';

  if (itemPrice <= freeBalance) {
    decision = 'SAFE_TO_BUY';
    explanation = `Keuangan Anda sangat siap untuk membeli ${itemName} seharga Rp ${itemPrice.toLocaleString('id-ID')}. Saldo bebas Anda (Rp ${freeBalance.toLocaleString('id-ID')}) mencukupi tanpa mengganggu Dana Darurat 3 Bulan (Rp ${emergencyFundRequired.toLocaleString('id-ID')}).`;
  } else if (itemPrice <= currentTotalBalance) {
    decision = 'RISKY_NEAR_EMERGENCY_FUND';
    explanation = `Total saldo Anda mencukupi, namun pembelian ${itemName} seharga Rp ${itemPrice.toLocaleString('id-ID')} akan terpaksa memotong Dana Darurat Anda. Disarankan menunda atau membeli secara bertahap.`;
    recommendedMonthlySaving = Math.round((itemPrice - freeBalance) / 4);
    targetMonthsNeeded = 4;
  } else {
    decision = 'POSTPONE_AND_SAVE';
    const shortage = itemPrice - freeBalance;
    recommendedMonthlySaving = Math.max(500000, Math.round(shortage / 6));
    targetMonthsNeeded = Math.ceil(shortage / recommendedMonthlySaving);
    explanation = `Untuk saat ini, disarankan menunda pembelian ${itemName}. Kekurangan dana aman adalah Rp ${shortage.toLocaleString('id-ID')}. Anda disarankan menabung Rp ${recommendedMonthlySaving.toLocaleString('id-ID')}/bulan selama ${targetMonthsNeeded} bulan ke depan.`;
  }

  return { itemName, itemPrice, currentTotalBalance, emergencyFundRequired, activeRecurringBills, freeBalance, decision, recommendedMonthlySaving, targetMonthsNeeded, explanation };
}

export async function checkSmartScheduleConflict(userId: string, targetDateStr: string, destinationName?: string): Promise<ScheduleConflictResult> {
  const targetDateClean = targetDateStr.split('T')[0];
  const { data: acts } = await supabaseAdmin.from('activities').select('title, occurred_at, priority').eq('user_id', userId).is('deleted_at', null);
  const activities = (acts || []).filter((a) => a.occurred_at?.startsWith(targetDateClean));
  const hasDirectConflict = activities.length > 0;
  const conflictingEvents = activities.map((a) => ({
    title: a.title,
    timeStr: new Date(a.occurred_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    priority: a.priority || 'medium',
  }));

  let travelBufferNeededHours = 2;
  const destLower = (destinationName || '').toLowerCase();
  if (destLower.includes('bromo')) travelBufferNeededHours = 4;
  if (destLower.includes('jogja') || destLower.includes('yogyakarta')) travelBufferNeededHours = 8;
  if (destLower.includes('bali')) travelBufferNeededHours = 12;

  const totalOccupiedHours = activities.length * 2 + travelBufferNeededHours;
  const restHoursAvailable = Math.max(0, 24 - totalOccupiedHours);
  let recommendation = `Jadwal pada tanggal ${targetDateClean} luang dan aman untuk direncanakan.`;

  if (hasDirectConflict) {
    recommendation = `Perhatian: Terdapat ${activities.length} agenda di tanggal ${targetDateClean} (termasuk "${activities[0].title}"). Perkiraan waktu perjalanan/buffer adalah ~${travelBufferNeededHours} jam. Jadwal Anda cukup padat namun dapat diatur dengan berangkat lebih awal.`;
  }

  return { targetDate: targetDateClean, hasDirectConflict, conflictingEvents, travelBufferNeededHours, restHoursAvailable, recommendation };
}

export async function optimizeTripBudget(userId: string, destination: string, plannedBudgetItems: { item: string; amount: number }[]): Promise<TripOptimizationResult> {
  const originalBudget = plannedBudgetItems.reduce((sum, b) => sum + b.amount, 0);
  const { freeBalance } = await calculateRealtimeDailyAllowance(userId);
  const itemizedBreakdown: { item: string; original: number; recommended: number; note: string }[] = [];
  let optimizedBudget = 0;

  plannedBudgetItems.forEach((b) => {
    const itemLower = b.item.toLowerCase();
    let recAmount = b.amount;
    let note = 'Budget aman dan sesuai.';

    if (itemLower.includes('hotel') || itemLower.includes('penginapan')) {
      if (b.amount > 600000) {
        recAmount = 450000;
        note = 'Disarankan mencari hotel bintang 3 pilihan dengan review tinggi di pusat kota (Hemat Rp ' + (b.amount - 450000).toLocaleString('id-ID') + ').';
      }
    } else if (itemLower.includes('malioboro') || itemLower.includes('oleh') || itemLower.includes('jajan')) {
      if (b.amount > 300000) {
        recAmount = 200000;
        note = 'Disarankan mengalokasikan Rp 200.000 untuk jajan & ngopi agar budget tetap terjaga.';
      }
    }

    optimizedBudget += recAmount;
    itemizedBreakdown.push({ item: b.item, original: b.amount, recommended: recAmount, note });
  });

  const potentialSavings = Math.max(0, originalBudget - optimizedBudget);
  const butlerAdvice = `Selamat siang Mas Firman, izin menyampaikan rekomendasi penghematan trip ke ${destination}. Dengan penyesuaian alokasi dari Rp ${originalBudget.toLocaleString('id-ID')} menjadi Rp ${optimizedBudget.toLocaleString('id-ID')}, Anda menghemat Rp ${potentialSavings.toLocaleString('id-ID')} sehingga keuangan tetap sehat dan perjalanan tetap nyaman. Bagaimana menurut Anda, apakah penyesuaian ini cocok?`;

  return { destination, originalBudget, optimizedBudget, potentialSavings, itemizedBreakdown, butlerAdvice };
}


export interface LoanRiskResult {
  principal: number;
  dailyInterestRatePct: number;
  tenorMonths: number;
  monthlyRepaymentEst: number;
  totalInterestPayable: number;
  totalRepaymentTotal: number;
  effectiveAnnualRatePct: number;
  currentFreeBalance: number;
  decision: 'STRONGLY_REJECT' | 'HIGH_RISK_WARNING' | 'ACCEPTABLE_WITH_CAUTION';
  butlerAdvice: string;
}

export async function calculateLoanRisk(
  userId: string,
  principal: number,
  dailyInterestRatePct: number = 0.2,
  tenorMonths: number = 12
): Promise<LoanRiskResult> {
  const { freeBalance } = await calculateRealtimeDailyAllowance(userId);

  const monthlyInterestRate = (dailyInterestRatePct / 100) * 30; // 0.2% * 30 = 6% / month
  const totalDays = tenorMonths * 30;
  const totalInterestPayable = Math.round(principal * (dailyInterestRatePct / 100) * totalDays);
  const totalRepaymentTotal = principal + totalInterestPayable;
  const monthlyRepaymentEst = Math.round(totalRepaymentTotal / tenorMonths);
  const effectiveAnnualRatePct = dailyInterestRatePct * 365;

  let decision: 'STRONGLY_REJECT' | 'HIGH_RISK_WARNING' | 'ACCEPTABLE_WITH_CAUTION' = 'STRONGLY_REJECT';
  let advice = '';

  if (effectiveAnnualRatePct >= 30) {
    decision = 'STRONGLY_REJECT';
    if (freeBalance >= principal) {
      advice = `Izin memberi masukan tegas Mas Firman: PINJAMAN INI SANGAT TIDAK DISARANKAN! Bunga 0.2%/hari setara dengan ${effectiveAnnualRatePct.toFixed(1)}% per tahun (Anda harus membayar bunga Rp ${totalInterestPayable.toLocaleString('id-ID')} hanya untuk pinjaman Rp ${principal.toLocaleString('id-ID')}). Apalagi saldo bebas Anda saat ini (Rp ${freeBalance.toLocaleString('id-ID')}) sangat cukup untuk menutupi kebutuhan ini secara tunai tanpa perlu berhutang.`;
    } else {
      advice = `Sangat tidak disarankan Mas Firman. Bunga 0.2%/hari (${effectiveAnnualRatePct.toFixed(1)}%/tahun) tergolong sangat tinggi dan menjebak. Total yang harus dikembalikan menjadi Rp ${totalRepaymentTotal.toLocaleString('id-ID')}. Disarankan mencari alternatif tanpa bunga atau menekan pengeluaran opsional selama beberapa hari.`;
    }
  } else {
    decision = 'HIGH_RISK_WARNING';
    advice = `Pinjaman Rp ${principal.toLocaleString('id-ID')} memiliki estimasi cicilan Rp ${monthlyRepaymentEst.toLocaleString('id-ID')}/bulan. Harap pastikan cicilan ini tidak melebihi 15% dari pendapatan bulanan Anda.`;
  }

  return {
    principal,
    dailyInterestRatePct,
    tenorMonths,
    monthlyRepaymentEst,
    totalInterestPayable,
    totalRepaymentTotal,
    effectiveAnnualRatePct,
    currentFreeBalance: freeBalance,
    decision,
    butlerAdvice: advice,
  };
}

export interface GojekEfficiencyResult {
  fuelExpense: number;
  dailyIncome: number;
  fuelCostRatioPct: number;
  netDailyProfit: number;
  estimatedKmPerLiter?: number;
  evaluation: 'SANGAT_EFISIEN' | 'WAJAR' | 'BOROS_PERLU_SERVIS';
  advice: string;
}

export function calculateGojekEfficiency(
  fuelExpense: number,
  dailyIncome: number,
  estimatedKm: number = 70
): GojekEfficiencyResult {
  const fuelCostRatioPct = dailyIncome > 0 ? (fuelExpense / dailyIncome) * 100 : 0;
  const netDailyProfit = Math.max(0, dailyIncome - fuelExpense);
  const liters = fuelExpense > 0 ? fuelExpense / 10000 : 0; // Asumsi Pertalite ~Rp 10.000/L
  const estimatedKmPerLiter = liters > 0 ? Math.round(estimatedKm / liters) : 0;

  let evaluation: 'SANGAT_EFISIEN' | 'WAJAR' | 'BOROS_PERLU_SERVIS' = 'WAJAR';
  let advice = '';

  if (fuelCostRatioPct <= 15) {
    evaluation = 'SANGAT_EFISIEN';
    advice = `Efisiensi bensin sangat baik (${fuelCostRatioPct.toFixed(1)}% dari pendapatan). Estimasi konsumsi ~${estimatedKmPerLiter} KM/liter. Pertahankan rute operasional ini!`;
  } else if (fuelCostRatioPct <= 25) {
    evaluation = 'WAJAR';
    advice = `Biaya bensin masih dalam batas wajar (${fuelCostRatioPct.toFixed(1)}% dari pendapatan harian).`;
  } else {
    evaluation = 'BOROS_PERLU_SERVIS';
    advice = `Biaya bensin menembus ${fuelCostRatioPct.toFixed(1)}% dari pendapatan. Disarankan memeriksa tekanan angin ban, busi, dan filter udara motor Anda.`;
  }

  return {
    fuelExpense,
    dailyIncome,
    fuelCostRatioPct,
    netDailyProfit,
    estimatedKmPerLiter,
    evaluation,
    advice,
  };
}

export async function calculateNetWorth(userId: string): Promise<{ totalCashAssets: number; totalDebts: number; netWorth: number }> {
  const [txs, debts] = await Promise.all([
    supabaseAdmin.from('transactions').select('amount, type').eq('user_id', userId).is('deleted_at', null),
    supabaseAdmin.from('debts').select('amount').eq('user_id', userId).eq('status', 'unpaid').eq('type', 'i_owe'),
  ]);

  let totalIncome = 0;
  let totalExpense = 0;
  (txs.data || []).forEach((t) => {
    if (t.type === 'income') totalIncome += Number(t.amount);
    else totalExpense += Number(t.amount);
  });

  const totalCashAssets = Math.max(0, totalIncome - totalExpense);
  let totalDebts = 0;
  (debts.data || []).forEach((d) => {
    totalDebts += Number(d.amount);
  });

  return {
    totalCashAssets,
    totalDebts,
    netWorth: totalCashAssets - totalDebts,
  };
}

export interface SinkingFundResult {
  purposeName: string;
  targetAnnualAmount: number;
  monthsRemaining: number;
  monthlySavingsRequired: number;
  dailySavingsRequired: number;
  advice: string;
}

export function calculateSinkingFund(
  targetAnnualAmount: number,
  monthsRemaining: number = 12,
  purposeName: string = 'Pajak STNK Tahunan'
): SinkingFundResult {
  const safeMonths = Math.max(1, monthsRemaining);
  const monthlySavingsRequired = Math.round(targetAnnualAmount / safeMonths);
  const dailySavingsRequired = Math.round(monthlySavingsRequired / 30);

  const advice = `Untuk memenuhi dana ${purposeName} sebesar Rp ${targetAnnualAmount.toLocaleString('id-ID')} dalam ${safeMonths} bulan ke depan, disarankan menyisihkan Rp ${monthlySavingsRequired.toLocaleString('id-ID')}/bulan (atau cukup ~Rp ${dailySavingsRequired.toLocaleString('id-ID')}/hari).`;

  return {
    purposeName,
    targetAnnualAmount,
    monthsRemaining: safeMonths,
    monthlySavingsRequired,
    dailySavingsRequired,
    advice,
  };
}

export interface EarlyRepaymentResult {
  remainingPrincipal: number;
  remainingMonths: number;
  monthlyInterestRatePct: number;
  totalRemainingInterestNormal: number;
  lumpSumPayoffAmount: number;
  totalInterestSaved: number;
  advice: string;
}

export function calculateEarlyRepaymentSavings(
  remainingPrincipal: number,
  monthlyInterestRatePct: number = 2.99,
  remainingMonths: number = 12
): EarlyRepaymentResult {
  const safeMonths = Math.max(1, remainingMonths);
  const monthlyInterestNominal = Math.round(remainingPrincipal * (monthlyInterestRatePct / 100));
  const totalRemainingInterestNormal = monthlyInterestNominal * safeMonths;
  const lumpSumPayoffAmount = remainingPrincipal; // Pokok murni jika melunasi sekarang
  const totalInterestSaved = totalRemainingInterestNormal;

  const advice = `Jika melunasi sisa pokok pinjaman Rp ${remainingPrincipal.toLocaleString('id-ID')} secara langsung hari ini, Anda berhasil menghemat total bunga sebesar Rp ${totalInterestSaved.toLocaleString('id-ID')} untuk ${safeMonths} bulan ke depan!`;

  return {
    remainingPrincipal,
    remainingMonths: safeMonths,
    monthlyInterestRatePct,
    totalRemainingInterestNormal,
    lumpSumPayoffAmount,
    totalInterestSaved,
    advice,
  };
}

export interface RealtimeLedgerResult {
  wallets: {
    cashKertas: number;
    cashKoin: number;
    gopay: number;
    seaBank: number;
    bankJago: number;
  };
  totalLiquidCash: number;
  totalIncome: number;
  totalExpense: number;
  netCashFlow: number;
  activeTalanganGojekDebt: number;
  summaryString: string;
}

export function calculateRealtimeLedger(transactions: any[]): RealtimeLedgerResult {
  const rawWallets = {
    cashKertas: 0,
    cashKoin: 0,
    gopay: 0,
    seaBank: 0,
    bankJago: 0,
  };

  let totalIncome = 0;
  let totalExpense = 0;
  let activeTalanganGojekDebt = 0;

  for (const t of transactions) {
    if (t.deleted_at) continue;
    const rawAmt = Number(t.amount || 0);
    if (isNaN(rawAmt) || rawAmt <= 0) continue;

    const type = String(t.type || '').toLowerCase();
    const method = String(t.payment_method || '').toLowerCase();
    const category = String(t.category || '').toLowerCase();
    const desc = String(t.description || '').toLowerCase();
    const tags = Array.isArray(t.tags) ? t.tags.join(' ').toLowerCase() : String(t.tags || '').toLowerCase();

    // Check if this is a talangan creation record (e.g. "talangan dari gojek 156k")
    const isTalanganDebtNote = (desc.includes('talangan dari gojek') || tags.includes('talangan')) && !desc.includes('bayar') && !desc.includes('lunas');
    const isTalanganRepayment = (desc.includes('bayar') || desc.includes('lunas') || desc.includes('potong')) && (desc.includes('talangan') || tags.includes('talangan'));

    if (isTalanganDebtNote && !desc.includes('bayar')) {
      activeTalanganGojekDebt += rawAmt;
      // Talangan debt note is not liquid cash expense, it is an operational liability
      continue;
    }

    if (isTalanganRepayment) {
      activeTalanganGojekDebt = Math.max(0, activeTalanganGojekDebt - rawAmt);
    }

    const isIncome = type === 'income' || type === 'pemasukan';
    const isExpense = type === 'expense' || type === 'pengeluaran';

    if (isIncome) totalIncome += rawAmt;
    if (isExpense) totalExpense += rawAmt;

    const delta = isIncome ? rawAmt : -rawAmt;

    if (method.includes('koin') || category.includes('koin') || desc.includes('koin')) {
      rawWallets.cashKoin += delta;
    } else if (method.includes('gopay') || category.includes('gopay')) {
      rawWallets.gopay += delta;
    } else if (method.includes('seabank') || category.includes('seabank')) {
      rawWallets.seaBank += delta;
    } else if (method.includes('jago') || category.includes('jago')) {
      rawWallets.bankJago += delta;
    } else {
      rawWallets.cashKertas += delta;
    }
  }

  const normalizedSeaBank = Math.max(0, Math.round(rawWallets.seaBank));
  const normalizedBankJago = Math.max(0, Math.round(rawWallets.bankJago));
  const normalizedGopay = Math.max(0, Math.round(rawWallets.gopay));
  const normalizedCashKertas = Math.max(0, Math.round(rawWallets.cashKertas));
  const normalizedCashKoin = Math.max(0, Math.round(rawWallets.cashKoin));

  const totalLiquidCash = normalizedCashKertas + normalizedCashKoin + normalizedGopay + normalizedSeaBank + normalizedBankJago;
  const netCashFlow = totalIncome - totalExpense;

  const summaryString = [
    `• 💵 Cash Kertas: Rp ${normalizedCashKertas.toLocaleString('id-ID')}`,
    `• 🪙 Cash Koin: Rp ${normalizedCashKoin.toLocaleString('id-ID')}`,
    `• 📱 Gopay: Rp ${normalizedGopay.toLocaleString('id-ID')}`,
    `• 🏦 SeaBank: Rp ${normalizedSeaBank.toLocaleString('id-ID')}`,
    `• 💳 Bank Jago: Rp ${normalizedBankJago.toLocaleString('id-ID')}`,
    `• 📊 Total Saldo Likuid: Rp ${totalLiquidCash.toLocaleString('id-ID')}`,
    activeTalanganGojekDebt > 0 ? `• ⚠️ Sisa Hutang Talangan Gojek: Rp ${activeTalanganGojekDebt.toLocaleString('id-ID')}` : '• ✅ Talangan Gojek: Lunas (Rp 0)'
  ].join('\n');

  return {
    wallets: {
      cashKertas: normalizedCashKertas,
      cashKoin: normalizedCashKoin,
      gopay: normalizedGopay,
      seaBank: normalizedSeaBank,
      bankJago: normalizedBankJago,
    },
    totalLiquidCash,
    totalIncome,
    totalExpense,
    netCashFlow,
    activeTalanganGojekDebt,
    summaryString,
  };
}

export interface PlanProgressResult {
  planKeyword: string;
  totalBudget: number;
  totalPaid: number;
  remainingBudget: number;
  paidTransactions: {
    id: string;
    full_id: string;
    date: string;
    amount: number;
    payment_method: string;
    description: string;
  }[];
  summaryString: string;
}

export function calculatePlanProgress(
  planKeyword: string,
  transactions: any[],
  totalBudget: number = 1040000
): PlanProgressResult {
  const kw = planKeyword.toLowerCase();
  const paidTransactions: any[] = [];
  let totalPaid = 0;

  for (const t of transactions) {
    if (t.deleted_at) continue;
    const desc = String(t.description || '').toLowerCase();
    const merchant = String(t.merchant || '').toLowerCase();
    const category = String(t.category || '').toLowerCase();
    const tags = Array.isArray(t.tags) ? t.tags.join(' ').toLowerCase() : String(t.tags || '').toLowerCase();
    const isExpense = String(t.type || '').toLowerCase() === 'expense';

    const isMatch = (desc.includes(kw) || merchant.includes(kw) || category.includes(kw) || tags.includes(kw)) &&
                    (desc.includes('tiket') || desc.includes('cicil') || desc.includes('trip') || desc.includes('dieng') || merchant.includes('dieng') || tags.includes('dieng'));

    if (isExpense && isMatch) {
      const amt = Number(t.amount || 0);
      if (amt > 0) {
        totalPaid += amt;
        const shortId = t.id ? `TX-${String(t.id).replace(/-/g, '').substring(0, 6).toUpperCase()}` : 'TX-AUTO';
        paidTransactions.push({
          id: shortId,
          full_id: t.id,
          date: t.occurred_at ? t.occurred_at.split('T')[0] : 'N/A',
          amount: amt,
          payment_method: t.payment_method || 'Unspecified',
          description: t.description || 'Cicilan rencana',
        });
      }
    }
  }

  const remainingBudget = Math.max(0, totalBudget - totalPaid);

  const txDetails = paidTransactions.map((tx, idx) => 
    `  ${idx + 1}. [${tx.id}] Rp ${tx.amount.toLocaleString('id-ID')} via ${tx.payment_method} (${tx.date}) - ${tx.description}`
  ).join('\n');

  const summaryString = [
    `📊 REKAP RESMI PEMBAYARAN RENCANA (${planKeyword.toUpperCase()}):`,
    `• Total Anggaran Pagu: Rp ${totalBudget.toLocaleString('id-ID')}`,
    `• Total Cicilan/Pembayaran Terbayar: Rp ${totalPaid.toLocaleString('id-ID')} (${paidTransactions.length} kali pembayaran)`,
    `• Sisa Kekurangan Anggaran yang Belum Terbayar: Rp ${remainingBudget.toLocaleString('id-ID')}`,
    `• Rincian Semua Transaksi Terbayar:\n${txDetails || '  (Belum ada transaksi terbayar)'}`
  ].join('\n');

  return {
    planKeyword,
    totalBudget,
    totalPaid,
    remainingBudget,
    paidTransactions,
    summaryString,
  };
}

// =============================================================================
// 🧮 SUITE KALKULATOR DETERMINISTIK ANTI-HALUSINASI (MATEMATIKA MURNI BACKEND)
// =============================================================================

export interface DailyGojekTargetResult {
  totalBudget: number;
  totalPaid: number;
  remainingPagu: number;
  currentLiquidCash: number;
  netDeficit: number;
  targetDate: string;
  daysRemaining: number;
  dailyTargetRequired: number;
  summaryString: string;
}

export function calculateDailyGojekTarget(
  totalBudget: number,
  totalPaid: number,
  currentLiquidCash: number,
  targetDateStr: string = '2026-08-29'
): DailyGojekTargetResult {
  const remainingPagu = Math.max(0, totalBudget - totalPaid);
  const netDeficit = Math.max(0, remainingPagu - currentLiquidCash);

  const targetDate = new Date(targetDateStr);
  const now = new Date();
  const diffTime = targetDate.getTime() - now.getTime();
  const daysRemaining = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const dailyTargetRequired = Math.round(netDeficit / daysRemaining);

  const summaryString = [
    `🎯 TARGET REALISTIS NARIK GOJEK MENUJU DEADLINE (${targetDateStr}):`,
    `• Total Pagu Anggaran: Rp ${totalBudget.toLocaleString('id-ID')}`,
    `• Total Cicilan Terbayar: Rp ${totalPaid.toLocaleString('id-ID')}`,
    `• Sisa Pagu Rencana: Rp ${remainingPagu.toLocaleString('id-ID')}`,
    `• Modal Kas Likuid di Tangan Saat Ini: Rp ${currentLiquidCash.toLocaleString('id-ID')}`,
    `• Kekurangan Dana Bersih Riil: Rp ${netDeficit.toLocaleString('id-ID')}`,
    `• Sisa Hari Menuju Target: ${daysRemaining} hari`,
    `• Target Pemasukan Bersih Narik Harian: Rp ${dailyTargetRequired.toLocaleString('id-ID')} / hari`
  ].join('\n');

  return {
    totalBudget,
    totalPaid,
    remainingPagu,
    currentLiquidCash,
    netDeficit,
    targetDate: targetDateStr,
    daysRemaining,
    dailyTargetRequired,
    summaryString,
  };
}

export interface BankJagoLoanResult {
  principalAmount: number;
  monthlyInterestRatePct: number;
  tenureMonths: number;
  monthlyPrincipal: number;
  monthlyInterest: number;
  monthlyInstallment: number;
  monthsPaid: number;
  remainingMonths: number;
  remainingPrincipal: number;
  totalPaidSoFar: number;
  lumpSumPayoffAmount: number;
  totalInterestSavedIfPayoffNow: number;
  summaryString: string;
}

export function calculateBankJagoLoanAmortization(
  monthsPaid: number = 1,
  principalAmount: number = 600000,
  monthlyInterestRatePct: number = 2.99,
  tenureMonths: number = 12
): BankJagoLoanResult {
  const monthlyPrincipal = Math.round(principalAmount / tenureMonths);
  const monthlyInterest = Math.round(principalAmount * (monthlyInterestRatePct / 100));
  const monthlyInstallment = monthlyPrincipal + monthlyInterest;

  const safeMonthsPaid = Math.min(tenureMonths, Math.max(0, monthsPaid));
  const remainingMonths = tenureMonths - safeMonthsPaid;
  const remainingPrincipal = principalAmount - (monthlyPrincipal * safeMonthsPaid);
  const totalPaidSoFar = monthlyInstallment * safeMonthsPaid;

  const totalRemainingInterest = monthlyInterest * remainingMonths;
  const lumpSumPayoffAmount = remainingPrincipal;
  const totalInterestSavedIfPayoffNow = totalRemainingInterest;

  const summaryString = [
    `💳 STATUS RESMI AMORTISASI PINJAMAN BANK JAGO:`,
    `• Pokok Pinjaman Awal: Rp ${principalAmount.toLocaleString('id-ID')}`,
    `• Suku Bunga: ${monthlyInterestRatePct}% Flat / bulan`,
    `• Angsuran Tetap: Rp ${monthlyInstallment.toLocaleString('id-ID')} / bulan (Pokok Rp ${monthlyPrincipal.toLocaleString('id-ID')} + Bunga Rp ${monthlyInterest.toLocaleString('id-ID')})`,
    `• Tenor: ${tenureMonths} bulan (Jatuh tempo setiap tanggal 20)`,
    `• Cicilan Terbayar: Bulan ke-${safeMonthsPaid} dari ${tenureMonths} (Total Terbayar: Rp ${totalPaidSoFar.toLocaleString('id-ID')})`,
    `• Sisa Tenor: ${remainingMonths} bulan`,
    `• Sisa Pokok Murni: Rp ${remainingPrincipal.toLocaleString('id-ID')}`,
    `• Penghematan Bunga Jika Pelunasan Dini Hari Ini: Rp ${totalInterestSavedIfPayoffNow.toLocaleString('id-ID')}`
  ].join('\n');

  return {
    principalAmount,
    monthlyInterestRatePct,
    tenureMonths,
    monthlyPrincipal,
    monthlyInterest,
    monthlyInstallment,
    monthsPaid: safeMonthsPaid,
    remainingMonths,
    remainingPrincipal,
    totalPaidSoFar,
    lumpSumPayoffAmount,
    totalInterestSavedIfPayoffNow,
    summaryString,
  };
}

export interface FuelMileageResult {
  fuelType: string;
  pricePerLiter: number;
  nominalPaid: number;
  litersPurchased: number;
  motorEfficiencyKmPerLiter: number;
  estimatedRangeKm: number;
  operationalCostPerKm: number;
  summaryString: string;
}

export function calculateFuelAndMileage(
  nominalPaid: number,
  fuelType: string = 'Pertalite',
  motorEfficiencyKmPerLiter: number = 50
): FuelMileageResult {
  const prices: Record<string, number> = {
    pertalite: 10000,
    biosolar: 6800,
    solar: 6800,
    pertamax: 15950,
    'pertamax green': 16600,
    'pertamax turbo': 18300,
    dexlite: 19700,
    'pertamina dex': 21150,
  };

  const key = fuelType.toLowerCase().trim();
  const pricePerLiter = prices[key] || 10000;
  const litersPurchased = Number((nominalPaid / pricePerLiter).toFixed(2));
  const estimatedRangeKm = Math.round(litersPurchased * motorEfficiencyKmPerLiter);
  const operationalCostPerKm = Math.round(nominalPaid / Math.max(1, estimatedRangeKm));

  const summaryString = [
    `⛽ KALKULASI EFISIENSI BBM HONDA BEAT FI:`,
    `• Jenis BBM: ${fuelType} (Rp ${pricePerLiter.toLocaleString('id-ID')}/L)`,
    `• Pembelian: Rp ${nominalPaid.toLocaleString('id-ID')} (${litersPurchased} Liter)`,
    `• Efisiensi Mesin Beat: ~${motorEfficiencyKmPerLiter} KM/Liter`,
    `• Estimasi Jarak Tempuh: ±${estimatedRangeKm} KM`,
    `• Biaya Operasional BBM: Rp ${operationalCostPerKm} / KM`
  ].join('\n');

  return {
    fuelType,
    pricePerLiter,
    nominalPaid,
    litersPurchased,
    motorEfficiencyKmPerLiter,
    estimatedRangeKm,
    operationalCostPerKm,
    summaryString,
  };
}
