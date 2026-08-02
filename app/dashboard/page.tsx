'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import {
  TrendingUp,
  Sparkles,
  Calendar,
  Layers,
  Activity,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

function DashboardContent() {
  const searchParams = useSearchParams();
  const urlTelegramId = searchParams.get('telegram_id');

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'reflection' | 'current' | 'projection'>('all');
  const [userName, setUserName] = useState<string>('User');
  const [telegramLinked, setTelegramLinked] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const initAuthAndData = async () => {
      setLoading(true);

      let effectiveTelegramId = urlTelegramId;
      let effectiveName = 'User';

      // 1. Check Telegram WebApp environment (inside Telegram client)
      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        const webApp = (window as any).Telegram.WebApp;
        webApp.ready();
        webApp.expand();

        const tgUser = webApp.initDataUnsafe?.user;
        if (tgUser?.id) {
          effectiveTelegramId = String(tgUser.id);
          effectiveName = tgUser.first_name || 'User';
          setUserName(effectiveName);
        }
      }

      let targetUserId = 'demo-user';

      // 2. Resolve User by Telegram ID (Direct Telegram Mini App Auto-Login)
      if (effectiveTelegramId) {
        try {
          const tgRes = await fetch('/api/auth/telegram-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              telegramId: effectiveTelegramId,
              name: effectiveName,
            }),
          });
          const tgData = await tgRes.json();

          if (tgData.ok && tgData.user) {
            setTelegramLinked(true);
            targetUserId = tgData.user.id;
            setUserName(tgData.user.name || effectiveName);
            setUserEmail(tgData.user.email);
          }
        } catch (err) {
          console.error('Failed to resolve Telegram user:', err);
        }
      }

      // 3. Fallback to Supabase Authenticated Web Session if no Telegram ID
      if (targetUserId === 'demo-user') {
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (authUser && authUser.email) {
          setUserEmail(authUser.email);

          if (effectiveTelegramId) {
            try {
              const linkRes = await fetch('/api/auth/link-telegram', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: authUser.email,
                  telegramId: effectiveTelegramId,
                  name: effectiveName !== 'User' ? effectiveName : authUser.email.split('@')[0],
                }),
              });
              const linkData = await linkRes.json();
              if (linkData.ok && linkData.user) {
                setTelegramLinked(true);
                targetUserId = linkData.user.id;
                setUserName(linkData.user.name || effectiveName);
              }
            } catch (err) {
              console.error('Failed to link Telegram account:', err);
            }
          }
        }
      }

      // 4. Fetch Analytics Summary
      try {
        const res = await fetch(`/api/analytics/summary?userId=${targetUserId}`);
        const data = await res.json();

        if (data.insights && Array.isArray(data.insights)) {
          setAnalytics(data.insights);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuthAndData();
  }, [urlTelegramId]);

  const filteredAnalytics = analytics.filter((item) => {
    if (activeTab === 'all') return true;
    return item.category === activeTab;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Dashboard Personal Finance & Analytics
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Ringkasan 20 Analisis Keuangan & Aktivitas untuk <span className="text-indigo-300 font-semibold">{userName}</span>
            {userEmail && <span className="text-xs text-slate-500 block font-mono mt-0.5">{userEmail}</span>}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {telegramLinked && (
            <span className="flex items-center gap-1.5 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full font-medium">
              <CheckCircle className="w-3.5 h-3.5" /> Telegram Linked & Active
            </span>
          )}

          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-lg border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'all'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" /> Semua (20 Analisis)
        </button>

        <button
          onClick={() => setActiveTab('reflection')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'reflection'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" /> 1. Refleksi & Historis
        </button>

        <button
          onClick={() => setActiveTab('current')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'current'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" /> 2. Kondisi Saat Ini
        </button>

        <button
          onClick={() => setActiveTab('projection')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'projection'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> 3. Proyeksi & Rekomendasi
        </button>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
          <p className="text-slate-400 text-sm">Menghubungkan akun Telegram & memuat data analisis...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnalytics.map((item) => (
            <div
              key={item.id}
              className="glass-card glass-card-hover rounded-xl p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Analisis #{item.id}
                  </span>
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-slate-100 mb-2">{item.title}</h3>

                {/* Display Value depending on type */}
                {item.type === 'stat' && item.data?.amount !== undefined && (
                  <div className="text-2xl font-bold text-indigo-300 my-2">
                    Rp {Number(item.data.amount).toLocaleString('id-ID')}
                  </div>
                )}

                {item.type === 'stat' && item.data?.count !== undefined && (
                  <div className="text-2xl font-bold text-emerald-400 my-2">
                    {item.data.count} Entri
                  </div>
                )}

                {item.type === 'stat' && item.data?.ratio !== undefined && (
                  <div className="text-2xl font-bold text-amber-400 my-2">
                    {item.data.ratio}%
                  </div>
                )}

                {/* Chart Visualization */}
                {item.type === 'chart' && item.chart_config && (
                  <div className="h-44 my-3">
                    <ResponsiveContainer width="100%" height="100%">
                      {item.chart_config.type === 'pie' ? (
                        <PieChart>
                          <Pie
                            data={item.chart_config.labels.map((lbl: string, idx: number) => ({
                              name: lbl,
                              value: item.chart_config.datasets[0].data[idx] || 0,
                            }))}
                            dataKey="value"
                            cx="50%"
                            cy="50%"
                            outerRadius={55}
                          >
                            {item.chart_config.labels.map((_: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ background: '#0f172a', borderColor: '#334155' }}
                          />
                        </PieChart>
                      ) : (
                        <BarChart
                          data={item.chart_config.labels.map((lbl: string, idx: number) => ({
                            name: lbl,
                            val: item.chart_config.datasets[0].data[idx] || 0,
                          }))}
                        >
                          <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                          <YAxis stroke="#64748b" fontSize={10} />
                          <Tooltip
                            contentStyle={{ background: '#0f172a', borderColor: '#334155' }}
                          />
                          <Bar dataKey="val" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                )}

                <p className="text-xs text-slate-300 leading-relaxed mt-2">{item.insight_text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 text-sm">Memuat dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
