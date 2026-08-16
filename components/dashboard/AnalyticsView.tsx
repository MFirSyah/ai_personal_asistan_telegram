'use client';

import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import { InsightItem, Transaction, Activity } from './types';
import { Subscription, Debt, Installment } from '@/lib/features/smart-alerts';
import BudgetProgressWidget from './BudgetProgressWidget';
import InstallmentsWidget from './InstallmentsWidget';

interface AnalyticsViewProps {
  analytics: InsightItem[];
  transactions: Transaction[];
  activities: Activity[];
  subscriptions?: Subscription[];
  debts?: Debt[];
  installments?: Installment[];
  briefingDismissed: boolean;
  onDismissBriefing: () => void;
  onOpenAddModal: () => void;
  onQuickView: (item: any) => void;
  onNavigateToEdit: (subTab: 'keuangan' | 'aktifitas') => void;
}

const PIE_COLORS = ['#008080', '#536000', '#ba1a1a', '#d2f000', '#006565', '#ff8c00', '#8a2be2'];

export default function AnalyticsView({
  analytics,
  transactions,
  activities,
  subscriptions = [],
  debts = [],
  installments = [],
  briefingDismissed,
  onDismissBriefing,
  onOpenAddModal,
  onQuickView,
  onNavigateToEdit,
}: AnalyticsViewProps) {
  const totalExpenseSum = useMemo(
    () => transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount || 0), 0),
    [transactions]
  );

  const totalIncomeSum = useMemo(
    () => transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + Number(t.amount || 0), 0),
    [transactions]
  );

  const safeDailyLimit = useMemo(
    () => analytics.find((a) => a.id === 19)?.data?.safeDailyLimit || 100000,
    [analytics]
  );

  const completedActsCount = useMemo(
    () => activities.filter((a) => a.status === 'completed').length,
    [activities]
  );

  const totalActsCount = activities.length;

  const briefingData = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const todayActs = activities
      .filter((a) => a.occurred_at?.startsWith(todayStr) && a.status !== 'completed')
      .map((a) => a.title);

    const urgentActs = activities
      .filter((a) => (a.priority === 'urgent' || a.priority === 'high') && a.status !== 'completed')
      .map((a) => a.title);

    const upcomingActs = activities
      .filter((a) => {
        if (!a.occurred_at || a.status === 'completed') return false;
        const actDate = new Date(a.occurred_at);
        return actDate > today && actDate <= nextWeek;
      })
      .map((a) => a.title);

    return { todayActs, urgentActs, upcomingActs };
  }, [activities]);

  const hasNoData = transactions.length === 0 && activities.length === 0;

  return (
    <div className="flex flex-col gap-6">
      {/* MORNING BRIEFING BANNER */}
      {!briefingDismissed && (
        <div className="brutal-card p-4 md:p-6 bg-[#d2f000] text-black border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative transition-all">
          <div className="flex justify-between items-start border-b-4 border-black pb-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl font-bold text-[#008080]">wb_sunny</span>
              <div>
                <h2 className="font-black text-lg md:text-xl uppercase tracking-tight">Morning Briefing Harian</h2>
                <p className="font-jetbrains text-xs font-bold text-black/80">Ringkasan Pagi Khusus Untukmu</p>
              </div>
            </div>

            <button
              onClick={onDismissBriefing}
              className="p-1 border-2 border-black bg-white hover:bg-[#ba1a1a] hover:text-white transition-all font-black text-sm active:translate-y-0.5 cursor-pointer"
              title="Tutup Briefing"
              aria-label="Tutup Briefing"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-jetbrains text-xs">
            <div className="bg-white p-3 border-2 border-black">
              <p className="font-bold uppercase text-[#008080] mb-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-base">today</span> Agenda Hari Ini:
              </p>
              <ul className="list-disc list-inside space-y-1">
                {briefingData.todayActs.length > 0 ? (
                  briefingData.todayActs.map((act, i) => <li key={i}>{act}</li>)
                ) : (
                  <li className="text-black/50">Tidak ada agenda hari ini.</li>
                )}
              </ul>
            </div>

            <div className="bg-white p-3 border-2 border-black">
              <p className="font-bold uppercase text-[#ba1a1a] mb-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-base">warning</span> Perlu Perhatian Urgent:
              </p>
              <ul className="list-disc list-inside space-y-1">
                {briefingData.urgentActs.length > 0 ? (
                  briefingData.urgentActs.map((act, i) => <li key={i}>{act}</li>)
                ) : (
                  <li className="text-black/50">Tidak ada tugas urgent saat ini.</li>
                )}
              </ul>
            </div>

            <div className="bg-white p-3 border-2 border-black">
              <p className="font-bold uppercase text-[#536000] mb-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-base">event</span> Agenda Mendatang (7 Hari):
              </p>
              <ul className="list-disc list-inside space-y-1">
                {briefingData.upcomingActs.length > 0 ? (
                  briefingData.upcomingActs.map((act, i) => <li key={i}>{act}</li>)
                ) : (
                  <li className="text-black/50">Tidak ada agenda mendatang.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Welcome Card if zero records (D-10) */}
      {hasNoData && (
        <div className="brutal-card p-6 bg-[#008080] text-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-4 mb-4">
            <span className="material-symbols-outlined text-4xl">rocket_launch</span>
            <div>
              <h2 className="font-black text-2xl uppercase">Selamat Datang di DATA_CORE_V1!</h2>
              <p className="font-jetbrains text-xs opacity-90">Asisten Keuangan & Personal Insights Pintar</p>
            </div>
          </div>
          <p className="font-jetbrains text-sm mb-4">
            Belum ada catatan keuangan atau aktivitas. Mari mulai dengan mencatat transaksi pertama kamu!
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={onOpenAddModal}
              className="bg-[#d2f000] text-black border-2 border-black px-4 py-2 font-bold font-jetbrains uppercase hover:bg-white transition-all cursor-pointer"
            >
              ➕ Tambah Catatan Pertama
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="mb-2">
        <h1 className="font-black text-3xl md:text-5xl uppercase tracking-tighter mb-2 leading-none">
          Analisis Keuangan & Aktifitas
        </h1>
        <p className="font-jetbrains text-xs md:text-sm bg-black text-white inline-block px-4 py-2 border-4 border-black font-bold uppercase">
          UPDATE TERAKHIR: HARI INI, {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
        </p>
      </header>

      {/* Target Budget Progress Bar Widget */}
      
      {/* --- SMART REALTIME DAILY ALLOWANCE & PRODUCTIVITY WIDGETS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Widget 1: Batas Belanja Aman Harian (B_harian) & Daily Burn Rate */}
        <div className="bg-white dark:bg-zinc-900 border border-teal-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">Batas Belanja Aman Harian</span>
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300">Realtime</span>
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mb-1">
            Rp {(Math.max(10000, Math.round((totalIncomeSum - totalExpenseSum - 67941) / Math.max(1, 30 - new Date().getDate() + 1)))).toLocaleString('id-ID')}
            <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400"> / hari</span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">
            Rata-rata pengeluaran harianmu bulan ini adalah <strong className="text-zinc-900 dark:text-zinc-200">Rp {(Math.round(totalExpenseSum / Math.max(1, new Date().getDate()))).toLocaleString('id-ID')}/hari</strong>.
          </p>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div className="bg-teal-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.round(((totalExpenseSum / Math.max(1, new Date().getDate())) / Math.max(10000, (totalIncomeSum - totalExpenseSum) / 30)) * 100))}%` }}></div>
          </div>
        </div>

        {/* Widget 2: Produktivitas & Prioritas Agenda */}
        <div className="bg-white dark:bg-zinc-900 border border-blue-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Produktivitas Agenda</span>
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {totalActsCount > 0 ? `${Math.round((completedActsCount / totalActsCount) * 100)}% Selesai` : '0%'}
            </span>
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mb-1">
            {completedActsCount} <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">/ {totalActsCount} Agenda</span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">
            Urgent: <strong className="text-red-500">{activities.filter(a => a.priority === 'urgent' || a.priority === 'high').length}</strong> | Medium: <strong className="text-amber-500">{activities.filter(a => a.priority === 'medium').length}</strong> | Low: <strong className="text-teal-500">{activities.filter(a => a.priority === 'low').length}</strong>
          </p>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden flex">
            <div className="bg-emerald-500 h-full" style={{ width: `${totalActsCount > 0 ? (completedActsCount / totalActsCount) * 100 : 0}%` }}></div>
            <div className="bg-amber-500 h-full" style={{ width: `${totalActsCount > 0 ? ((totalActsCount - completedActsCount) / totalActsCount) * 100 : 0}%` }}></div>
          </div>
        </div>

        {/* Widget 3: Filter Rentang Waktu Dashboard */}
        <div className="bg-white dark:bg-zinc-900 border border-purple-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">Perspektif Rentang Waktu</span>
              <span className="text-[10px] text-zinc-400">Cockpit View</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">Pilih perspektif periode analisis data umum di Dashboard:</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['Hari Ini', '7 Hari', 'Bulan Ini', '3 Bulan', '1 Tahun'].map((label, idx) => (
              <button
                key={label}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${idx === 2 ? 'bg-purple-600 text-white shadow' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

<BudgetProgressWidget transactions={transactions} categories={[]} />

      {/* Monthly Installments & Fixed Subscriptions Widget */}
      <InstallmentsWidget subscriptions={subscriptions || []} debts={debts || []} installments={installments || []} />

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* SECTION 1: Financial Summary (7 cols) */}
        <section className="md:col-span-7 flex flex-col gap-6">
          <div className="brutal-card flex flex-col h-full">
            <div className="brutal-header p-4 bg-[#008080] text-white border-b-4 border-black flex justify-between items-center">
              <div>
                <h2 className="font-bold text-xl uppercase tracking-tight">1. KEUANGAN</h2>
                <p className="font-jetbrains text-xs opacity-90">Ringkasan Saldo & Arus Kas</p>
              </div>
              <button
                onClick={() => onNavigateToEdit('keuangan')}
                className="bg-[#d2f000] text-black border-2 border-black px-3 py-1 text-xs font-bold font-jetbrains uppercase hover:bg-white transition-all cursor-pointer"
              >
                👁️ Quick Data
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow">
              <div className="flex flex-col gap-4">
                <div className="border-l-4 border-black pl-4">
                  <p className="font-jetbrains text-xs uppercase mb-1 font-semibold text-black/70 dark:text-white/70">Pemasukan Akumulasi</p>
                  <p className="font-black text-2xl md:text-3xl text-black dark:text-white">
                    Rp {totalIncomeSum.toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="border-l-4 border-[#ba1a1a] pl-4">
                  <p className="font-jetbrains text-xs uppercase mb-1 font-semibold text-[#ba1a1a]">Pengeluaran Akumulasi</p>
                  <p className="font-black text-2xl md:text-3xl text-[#ba1a1a]">
                    Rp {totalExpenseSum.toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="border-l-4 border-black pl-4 bg-[#e2e2e2] dark:bg-white/10 p-3">
                  <p className="font-jetbrains text-xs uppercase mb-1 font-semibold">Net Surplus / Cash Flow</p>
                  <p className="font-black text-xl md:text-2xl text-black dark:text-white">
                    Rp {(totalIncomeSum - totalExpenseSum).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              <div className="flex flex-col justify-between gap-4">
                <div className="text-center p-4 border-4 border-black bg-white dark:bg-[#1a1c1c] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <p className="font-jetbrains text-xs uppercase mb-2 font-bold text-black/70 dark:text-white/70">Sisa Uang Aman / Hari</p>
                  <p className="font-black text-3xl md:text-4xl text-[#008080] leading-none">
                    Rp {(safeDailyLimit / 1000).toFixed(0)}k
                  </p>
                </div>

                <div className="bg-[#ffdad6] border-2 border-[#ba1a1a] p-3 text-[#93000a]">
                  <p className="font-bold text-xs flex items-start gap-1">
                    <span className="material-symbols-outlined text-base">warning</span>
                    <span>{transactions.length} catatan transaksi tersimpan.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Activity Summary (5 cols) */}
        <section className="md:col-span-5 flex flex-col gap-6">
          <div className="brutal-card flex flex-col h-full bg-[#eeeeee] dark:bg-[#2a2d2d]">
            <div className="brutal-header p-4 bg-[#536000] text-white border-b-4 border-black flex justify-between items-center">
              <div>
                <h2 className="font-bold text-xl uppercase tracking-tight">2. AKTIFITAS & AGENDA</h2>
                <p className="font-jetbrains text-xs opacity-90">Jadwal & Tugas Urgent</p>
              </div>
              <button
                onClick={onOpenAddModal}
                className="bg-[#d2f000] text-black border-2 border-black px-2 py-1 text-xs font-bold font-jetbrains uppercase hover:bg-white transition-all cursor-pointer"
              >
                ➕ Tambah
              </button>
            </div>

            <div className="p-6 flex flex-col gap-6 flex-grow text-black dark:text-white">
              <div className="flex items-center justify-between bg-black text-[#d2f000] p-4 border-2 border-black">
                <span className="font-black text-3xl">{completedActsCount}/{totalActsCount}</span>
                <span className="font-jetbrains text-xs uppercase font-bold">Aktivitas Selesai</span>
              </div>

              <div>
                <h3 className="font-jetbrains text-xs uppercase mb-3 border-b-2 border-black pb-1 font-bold text-[#ba1a1a] flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">warning</span> Urgent / Mendesak:
                </h3>
                <ul className="flex flex-col gap-2 font-jetbrains text-xs">
                  {activities.filter((a) => a.priority === 'urgent' || a.priority === 'high').length === 0 ? (
                    <li className="p-2 border-2 border-black bg-white dark:bg-[#1a1c1c] text-black/50 dark:text-white/50 italic">
                      Tidak ada tugas urgent saat ini.
                    </li>
                  ) : (
                    activities
                      .filter((a) => a.priority === 'urgent' || a.priority === 'high')
                      .map((a) => (
                        <li key={a.id} className="p-2 border-2 border-black bg-white dark:bg-[#1a1c1c] font-bold text-[#ba1a1a]">
                          🚨 {a.title}
                        </li>
                      ))
                  )}
                </ul>
              </div>

              <div className="mt-auto">
                <h3 className="font-jetbrains text-xs uppercase mb-3 border-b-2 border-black pb-1 font-bold text-black dark:text-white">
                  Agenda Terjadwal:
                </h3>
                <ul className="flex flex-col gap-2 font-jetbrains text-xs">
                  {activities.slice(0, 3).map((act) => (
                    <li
                      key={act.id}
                      onClick={() => onQuickView(act)}
                      className="flex items-center gap-2 p-2 border-2 border-black bg-white dark:bg-[#1a1c1c] text-black dark:text-white hover:translate-x-1 transition-all cursor-pointer"
                    >
                      <div className={`w-4 h-4 border-2 border-black ${act.status === 'completed' ? 'bg-[#d2f000]' : 'bg-white dark:bg-black'}`}></div>
                      <span className={act.status === 'completed' ? 'line-through opacity-60' : ''}>{act.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 20 ANALYTICS CARDS GRID with Chart Variations (D-09) */}
      <div className="mt-8 border-t-4 border-black pt-8">
        <h2 className="font-black text-2xl md:text-3xl uppercase tracking-tight mb-6 flex items-center gap-2 text-black dark:text-white">
          <span className="material-symbols-outlined text-3xl">analytics</span>
          <span>20 Model Analisis Real-Time</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analytics.map((item) => {
            const hasValidChartData = item.chartData && Array.isArray(item.chartData) && item.chartData.length > 0;
            const hasInsightText = Boolean(item.insight && String(item.insight).trim().length > 0);

            // Chart Type Variation Logic (D-09)
            const chartType =
              item.id === 5 || item.id === 7 || item.id === 14
                ? 'pie'
                : item.id === 4 || item.id === 12
                ? 'line'
                : item.id === 11 || item.id === 16
                ? 'area'
                : 'bar';

            return (
              <div key={item.id} className="brutal-card flex flex-col justify-between p-5 relative bg-white dark:bg-[#1a1c1c] text-black dark:text-white">
                <div>
                  <div className="flex justify-between items-start mb-3 border-b-2 border-black pb-2">
                    <span className="font-jetbrains text-xs bg-black text-white px-2 py-1 font-bold">
                      #{String(item.id).padStart(2, '0')}
                    </span>
                    <span className="font-jetbrains text-xs uppercase font-bold text-[#008080] dark:text-[#20b2aa]">
                      {item.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg mb-2 text-black dark:text-white">{item.title}</h3>

                  {hasInsightText ? (
                    <p className="font-jetbrains text-xs text-black/90 dark:text-white/90 mb-4">{item.insight}</p>
                  ) : (
                    <div className="bg-[#e2e2e2] dark:bg-white/10 p-3 border-2 border-black mb-4 font-jetbrains text-xs space-y-2">
                      <p className="font-bold text-black dark:text-white flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">info</span> Deskripsi Model:
                      </p>
                      <p className="text-black/80 dark:text-white/80">
                        Model ini menganalisis tren, distribusi, serta kebiasaan {item.category === 'reflection' ? 'keuangan' : 'aktivitas'} kamu.
                      </p>
                      <div className="border-t border-black/30 pt-2">
                        <p className="font-bold text-[#008080] dark:text-[#20b2aa]">
                          📊 Target Minimal Data: Butuh minimal 3 catatan untuk mengaktifkan grafik ini.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chart Display Variations (D-09) */}
                {hasValidChartData ? (
                  <div className="h-40 w-full mt-2 border-2 border-black bg-white dark:bg-[#2a2d2d] p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === 'pie' ? (
                        <PieChart>
                          <Pie
                            data={item.chartData}
                            cx="50%"
                            cy="50%"
                            outerRadius={50}
                            dataKey="value"
                            label={({ name }) => name}
                          >
                            {item.chartData!.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ background: '#333', border: '2px solid #000', color: '#fff' }} />
                        </PieChart>
                      ) : chartType === 'line' ? (
                        <LineChart data={item.chartData}>
                          <XAxis dataKey="name" stroke="#888888" fontSize={10} />
                          <YAxis stroke="#888888" fontSize={10} />
                          <Tooltip contentStyle={{ background: '#333', border: '2px solid #000', color: '#fff' }} />
                          <Line type="monotone" dataKey="value" stroke="#008080" strokeWidth={3} />
                        </LineChart>
                      ) : chartType === 'area' ? (
                        <AreaChart data={item.chartData}>
                          <XAxis dataKey="name" stroke="#888888" fontSize={10} />
                          <YAxis stroke="#888888" fontSize={10} />
                          <Tooltip contentStyle={{ background: '#333', border: '2px solid #000', color: '#fff' }} />
                          <Area type="monotone" dataKey="value" stroke="#536000" fill="#d2f000" />
                        </AreaChart>
                      ) : (
                        <BarChart data={item.chartData}>
                          <XAxis dataKey="name" stroke="#888888" fontSize={10} />
                          <YAxis stroke="#888888" fontSize={10} />
                          <Tooltip contentStyle={{ background: '#333', border: '2px solid #000', color: '#fff' }} />
                          <Bar dataKey="value" fill="#008080" />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <button
                    onClick={onOpenAddModal}
                    className="mt-2 w-full bg-[#d2f000] text-black border-2 border-black hover:bg-black hover:text-white p-2 text-xs font-bold font-jetbrains uppercase transition-all cursor-pointer"
                  >
                    ⚡ ➕ Tambah Data Baru
                  </button>
                )}

                <button
                  onClick={() => onQuickView(item)}
                  className="mt-3 w-full bg-[#f9f9f9] dark:bg-[#2a2d2d] text-black dark:text-white border-2 border-black hover:bg-[#008080] hover:text-white p-2 text-xs font-bold font-jetbrains uppercase transition-all cursor-pointer"
                >
                  👁️ Detail Model #{item.id}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
