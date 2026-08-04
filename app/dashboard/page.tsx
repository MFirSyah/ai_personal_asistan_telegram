'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

function DashboardContent() {
  const searchParams = useSearchParams();
  const urlTelegramId = searchParams.get('telegram_id');

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'analisis' | 'edit'>('analisis');
  const [sideTab, setSideTab] = useState<'overview' | 'keuangan' | 'aktifitas' | 'anomali'>('overview');
  const [editSubTab, setEditSubTab] = useState<'keuangan' | 'aktifitas'>('keuangan');
  const [userName, setUserName] = useState<string>('');
  const [userId, setUserId] = useState<string>('demo-user');

  // Morning Briefing Banner & Notification Center state
  const [briefingDismissed, setBriefingDismissed] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  // Edit Data states
  const [records, setRecords] = useState<{ transactions: any[]; activities: any[] }>({
    transactions: [],
    activities: [],
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modals & Shortcuts
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [quickViewRecord, setQuickViewRecord] = useState<any | null>(null);

  const [newRecordType, setNewRecordType] = useState<'transaction' | 'activity'>('transaction');
  const [formData, setFormData] = useState({
    titleOrMerchant: '',
    amount: '',
    type: 'expense',
    description: '',
    priority: 'medium',
  });

  // Escape key shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddModal(false);
        setShowCommandPalette(false);
        setQuickViewRecord(null);
        setShowNotificationsModal(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const initAuthAndData = async () => {
      setLoading(true);
      let effectiveTelegramId = urlTelegramId;
      let effectiveName = '';

      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        const webApp = (window as any).Telegram.WebApp;
        webApp.ready();
        webApp.expand();

        const tgUser = webApp.initDataUnsafe?.user;
        if (tgUser?.id) {
          effectiveTelegramId = String(tgUser.id);
          effectiveName = tgUser.first_name || '';
          setUserName(effectiveName);
        }
      }

      let targetUserId = 'demo-user';

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
            targetUserId = tgData.user.id;
            setUserName(tgData.user.name || effectiveName);
          }
        } catch (err) {
          console.error('Failed to resolve Telegram user:', err);
        }
      }

      // Fetch Records (API auto-resolves to primary user if demo-user)
      try {
        const recRes = await fetch(`/api/data/records?userId=${targetUserId}`);
        const recData = await recRes.json();
        if (recData.ok) {
          setRecords({
            transactions: recData.transactions || [],
            activities: recData.activities || [],
          });
          if (recData.userId) {
            targetUserId = recData.userId;
            setUserId(recData.userId);
          }
          if (recData.userName) {
            setUserName(recData.userName);
          }
        }
      } catch (err) {
        console.error('Failed to load records:', err);
      }

      // Fetch Analytics Summary
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

  const handleDeleteRecord = async (id: string, type: 'transaction' | 'activity') => {
    if (!confirm('Apakah kamu yakin ingin menghapus data ini?')) return;

    try {
      const res = await fetch('/api/data/records', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, recordId: id, type }),
      });
      const data = await res.json();

      if (data.ok) {
        if (type === 'transaction') {
          setRecords((prev) => ({
            ...prev,
            transactions: prev.transactions.filter((t) => t.id !== id),
          }));
        } else {
          setRecords((prev) => ({
            ...prev,
            activities: prev.activities.filter((a) => a.id !== id),
          }));
        }
        if (quickViewRecord?.id === id) setQuickViewRecord(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/data/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type: newRecordType,
          data: {
            amount: parseFloat(formData.amount) || 0,
            merchant: formData.titleOrMerchant,
            title: formData.titleOrMerchant,
            description: formData.description,
            type: formData.type,
            priority: formData.priority,
            occurred_at: new Date().toISOString(),
          },
        }),
      });

      const result = await res.json();
      if (result.ok && result.record) {
        if (newRecordType === 'transaction') {
          setRecords((prev) => ({
            ...prev,
            transactions: [result.record, ...prev.transactions],
          }));
        } else {
          setRecords((prev) => ({
            ...prev,
            activities: [result.record, ...prev.activities],
          }));
        }
        setShowAddModal(false);
        setFormData({ titleOrMerchant: '', amount: '', type: 'expense', description: '', priority: 'medium' });
      }
    } catch (err) {
      console.error('Create error:', err);
    }
  };

  // Compute summary numbers from live insights or records
  const totalExpenseSum = records.transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalIncomeSum = records.transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const safeDailyLimit = analytics.find((a: any) => a.id === 19)?.data?.safeDailyLimit || 100000;
  const completedActsCount = records.activities.filter((a) => a.status === 'completed').length;
  const totalActsCount = records.activities.length;

  // Derive briefing data from real activities (not hardcoded)
  const briefingData = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 7);

    const todayActs = records.activities
      .filter((a) => a.occurred_at?.startsWith(todayStr) && a.status !== 'completed')
      .map((a) => a.title);

    const urgentActs = records.activities
      .filter((a) => (a.priority === 'urgent' || a.priority === 'high') && a.status !== 'completed')
      .map((a) => a.title);

    const upcomingActs = records.activities
      .filter((a) => {
        if (!a.occurred_at || a.status === 'completed') return false;
        const actDate = new Date(a.occurred_at);
        return actDate > today && actDate <= tomorrow;
      })
      .map((a) => a.title);

    return { todayActs, urgentActs, upcomingActs };
  }, [records.activities]);

  // Filtered transactions & activities for Edit Data
  const filteredTxs = records.transactions.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchQ = !q || t.merchant?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q) || String(t.amount).includes(q);
    const matchCat = categoryFilter === 'all' || t.type === categoryFilter;
    return matchQ && matchCat;
  });

  const filteredActs = records.activities.filter((a) => {
    const q = searchQuery.toLowerCase();
    return !q || a.title?.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q);
  });

  return (
    <div className="font-montserrat text-on-background bg-background min-h-screen flex flex-col antialiased pb-20 md:pb-0">
      {/* TopNavBar */}
      <nav className="bg-[#006565] text-white border-b-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-4 md:px-8 h-20 max-w-[1440px] mx-auto">
          {/* Brand */}
          <div className="font-black text-xl md:text-3xl uppercase tracking-tighter text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl md:text-3xl">terminal</span>
            <span>DATA_CORE_V1</span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex gap-8 items-center h-full">
            <button
              onClick={() => setActiveTab('analisis')}
              className={`px-4 h-full flex items-center font-bold uppercase transition-all ${
                activeTab === 'analisis'
                  ? 'border-b-4 border-white bg-black/20 text-white'
                  : 'text-white/70 hover:text-white hover:bg-black/10'
              }`}
            >
              Analisis
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-4 h-full flex items-center font-bold uppercase transition-all ${
                activeTab === 'edit'
                  ? 'border-b-4 border-white bg-black/20 text-white'
                  : 'text-white/70 hover:text-white hover:bg-black/10'
              }`}
            >
              Edit Data ({records.transactions.length + records.activities.length})
            </button>
          </div>

          {/* Actions & Search Shortcut */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCommandPalette(true)}
              className="hidden md:flex items-center brutalist-border bg-white text-black h-10 px-3 hover:bg-[#d2f000] active:translate-y-1 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined mr-2">search</span>
              <span className="font-jetbrains text-xs font-bold uppercase mr-4">Quick Search...</span>
              <kbd className="bg-black text-white px-2 py-0.5 text-[10px] font-jetbrains font-bold">Ctrl+K</kbd>
            </button>

            {/* Notification Center Button */}
            <button
              onClick={() => setShowNotificationsModal(true)}
              className="relative hover:bg-white/10 p-2 brutalist-active flex items-center cursor-pointer"
              title="Notifikasi & Briefing"
            >
              <span className="material-symbols-outlined">notifications</span>
              {briefingDismissed && (
                <span className="absolute top-1 right-1 w-3 h-3 bg-[#d2f000] border-2 border-black rounded-full"></span>
              )}
            </button>

            <button
              onClick={() => setShowCommandPalette(true)}
              className="hover:bg-white/10 p-2 brutalist-active flex items-center cursor-pointer"
              title="Pengaturan"
            >
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </div>

        {/* Mobile Header Navigation Strip (Item 1 Fix) */}
        <div className="flex md:hidden border-t-2 border-black bg-black text-white px-2 py-2 justify-around font-jetbrains text-xs font-bold uppercase">
          <button
            onClick={() => setActiveTab('analisis')}
            className={`px-3 py-1 ${activeTab === 'analisis' ? 'bg-[#d2f000] text-black' : 'text-white'}`}
          >
            📊 Analisis
          </button>
          <button
            onClick={() => { setActiveTab('edit'); setEditSubTab('keuangan'); }}
            className={`px-3 py-1 ${activeTab === 'edit' && editSubTab === 'keuangan' ? 'bg-[#d2f000] text-black' : 'text-white'}`}
          >
            💳 Keuangan ({records.transactions.length})
          </button>
          <button
            onClick={() => { setActiveTab('edit'); setEditSubTab('aktifitas'); }}
            className={`px-3 py-1 ${activeTab === 'edit' && editSubTab === 'aktifitas' ? 'bg-[#d2f000] text-black' : 'text-white'}`}
          >
            📅 Aktifitas ({records.activities.length})
          </button>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="flex flex-1 max-w-[1440px] mx-auto w-full">
        {/* Sidebar Navigation (Desktop) */}
        <aside className="hidden lg:flex flex-col bg-[#f9f9f9] border-r-4 border-black shadow-[4px_0px_0px_0px_rgba(0,0,0,1)] w-[280px] min-h-[calc(100vh-80px)] p-4 z-40 sticky top-20">
          <div className="mb-8 p-4 brutalist-border bg-[#008080] text-[#e3fffe] brutalist-shadow">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-black brutalist-border flex items-center justify-center text-white font-bold">
                <span className="material-symbols-outlined text-2xl">person</span>
              </div>
              <div>
                <div className="font-bold text-lg leading-tight">{userName}</div>
                <div className="font-jetbrains text-xs opacity-80">Akun Terhubung</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 flex flex-col gap-2">
            <button
              onClick={() => { setActiveTab('analisis'); setSideTab('overview'); }}
              className={`flex items-center gap-4 p-4 mb-2 font-bold text-sm text-left transition-all border-2 ${
                activeTab === 'analisis' && sideTab === 'overview'
                  ? 'bg-[#d2f000] text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'text-black/80 hover:bg-[#e2e2e2] border-transparent hover:border-black'
              }`}
            >
              <span className="material-symbols-outlined">dashboard</span>
              <span>Overview</span>
            </button>

            <button
              onClick={() => { setActiveTab('edit'); setSideTab('keuangan'); setEditSubTab('keuangan'); }}
              className={`flex items-center gap-4 p-4 mb-2 font-bold text-sm text-left transition-all border-2 ${
                activeTab === 'edit' && editSubTab === 'keuangan'
                  ? 'bg-[#d2f000] text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'text-black/80 hover:bg-[#e2e2e2] border-transparent hover:border-black'
              }`}
            >
              <span className="material-symbols-outlined">payments</span>
              <span>Keuangan</span>
            </button>

            <button
              onClick={() => { setActiveTab('edit'); setSideTab('aktifitas'); setEditSubTab('aktifitas'); }}
              className={`flex items-center gap-4 p-4 mb-2 font-bold text-sm text-left transition-all border-2 ${
                activeTab === 'edit' && editSubTab === 'aktifitas'
                  ? 'bg-[#d2f000] text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'text-black/80 hover:bg-[#e2e2e2] border-transparent hover:border-black'
              }`}
            >
              <span className="material-symbols-outlined">analytics</span>
              <span>Aktifitas</span>
            </button>

            <button
              onClick={() => { setActiveTab('analisis'); setSideTab('anomali'); }}
              className={`flex items-center gap-4 p-4 mb-2 font-bold text-sm text-left transition-all border-2 ${
                activeTab === 'analisis' && sideTab === 'anomali'
                  ? 'bg-[#d2f000] text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'text-black/80 hover:bg-[#e2e2e2] border-transparent hover:border-black'
              }`}
            >
              <span className="material-symbols-outlined">warning</span>
              <span>Anomali</span>
            </button>
          </nav>

          <div className="mt-auto flex flex-col gap-2 border-t-4 border-black pt-4">
            <a
              href={`/api/export?userId=${userId}`}
              download
              className="bg-[#006565] text-white brutalist-border brutalist-shadow p-3 font-bold text-sm brutalist-hover brutalist-active flex justify-center items-center gap-2 uppercase"
            >
              <span className="material-symbols-outlined">download</span> Export_CSV
            </a>
          </div>
        </aside>

        {/* Main Content Workspace */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden flex flex-col gap-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] brutal-card p-8 text-center">
              <span className="material-symbols-outlined text-6xl animate-spin mb-4 text-[#008080]">sync</span>
              <p className="font-jetbrains font-bold text-xl uppercase">MEMATIKAN & MEMUAT CORE ANALYTICS...</p>
            </div>
          ) : activeTab === 'analisis' ? (
            /* ANALISIS KEUANGAN & AKTIVITAS VIEW */
            <>
              {/* MORNING BRIEFING BANNER AT VERY TOP */}
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

                    {/* Small [X] Close Button */}
                    <button
                      onClick={() => setBriefingDismissed(true)}
                      className="p-1 border-2 border-black bg-white hover:bg-[#ba1a1a] hover:text-white transition-all font-black text-sm active:translate-y-0.5 cursor-pointer"
                      title="Tutup Briefing"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-jetbrains text-xs">
                    <div className="bg-white p-3 border-2 border-black">
                      <p className="font-bold uppercase text-[#008080] mb-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">today</span> Yang Perlu Dilakukan Hari Ini:
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        {briefingData.todayActs.length > 0 ? briefingData.todayActs.map((act, i) => (
                          <li key={i}>{act}</li>
                        )) : <li className="text-black/50">Tidak ada agenda hari ini.</li>}
                      </ul>
                    </div>

                    <div className="bg-white p-3 border-2 border-black">
                      <p className="font-bold uppercase text-[#ba1a1a] mb-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">warning</span> Yang Perlu Dilakukan Urgent:
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        {briefingData.urgentActs.length > 0 ? briefingData.urgentActs.map((act, i) => (
                          <li key={i}>{act}</li>
                        )) : <li className="text-black/50">Tidak ada tugas urgent saat ini.</li>}
                      </ul>
                    </div>

                    <div className="bg-white p-3 border-2 border-black">
                      <p className="font-bold uppercase text-[#536000] mb-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">event</span> Yang Perlu Disiapkan (Mendatang):
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        {briefingData.upcomingActs.length > 0 ? briefingData.upcomingActs.map((act, i) => (
                          <li key={i}>{act}</li>
                        )) : <li className="text-black/50">Tidak ada agenda mendatang.</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Header */}
              <header className="mb-2">
                <h1 className="font-black text-3xl md:text-6xl uppercase tracking-tighter mb-2 leading-none">
                  Analisis <br /> Keuangan & Aktifitas
                </h1>
                <p className="font-jetbrains text-xs md:text-sm bg-black text-white inline-block px-4 py-2 border-4 border-black font-bold uppercase">
                  UPDATE TERAKHIR: HARI INI, {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </p>
              </header>

              {/* Bento Grid (Keuangan & Aktifitas Header Items 4 Fix) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* SECTION 1: KEMARIN & RINGKASAN KEUANGAN (Span 7 cols) */}
                <section className="md:col-span-7 flex flex-col gap-6">
                  <div className="brutal-card flex flex-col h-full">
                    <div className="brutal-header p-4 bg-[#008080] text-white border-b-4 border-black flex justify-between items-center">
                      <div>
                        <h2 className="font-bold text-xl uppercase tracking-tight">1. KEUANGAN</h2>
                        <p className="font-jetbrains text-xs opacity-90">Ringkasan Saldo & Arus Kas</p>
                      </div>
                      <button
                        onClick={() => { setActiveTab('edit'); setEditSubTab('keuangan'); }}
                        className="bg-[#d2f000] text-black border-2 border-black px-3 py-1 text-xs font-bold font-jetbrains uppercase hover:bg-white transition-all"
                      >
                        👁️ Quick Data
                      </button>
                    </div>

                    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow">
                      {/* Financial Summary */}
                      <div className="flex flex-col gap-4">
                        <div className="border-l-4 border-black pl-4">
                          <p className="font-jetbrains text-xs uppercase mb-1 font-semibold text-black/70">Pemasukan Akumulasi</p>
                          <p className="font-black text-2xl md:text-3xl text-black">
                            Rp {totalIncomeSum.toLocaleString('id-ID')}
                          </p>
                        </div>

                        <div className="border-l-4 border-[#ba1a1a] pl-4">
                          <p className="font-jetbrains text-xs uppercase mb-1 font-semibold text-[#ba1a1a]">Pengeluaran Akumulasi</p>
                          <p className="font-black text-2xl md:text-3xl text-[#ba1a1a]">
                            Rp {totalExpenseSum.toLocaleString('id-ID')}
                          </p>
                        </div>

                        <div className="border-l-4 border-black pl-4 bg-[#e2e2e2] p-3">
                          <p className="font-jetbrains text-xs uppercase mb-1 font-semibold">Net Surplus / Cash Flow</p>
                          <p className="font-black text-xl md:text-2xl text-black">
                            Rp {(totalIncomeSum - totalExpenseSum).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>

                      {/* Sisa Uang Aman */}
                      <div className="flex flex-col justify-between gap-4">
                        <div className="text-center p-4 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          <p className="font-jetbrains text-xs uppercase mb-2 font-bold text-black/70">Sisa Uang Aman / Hari</p>
                          <p className="font-black text-3xl md:text-4xl text-[#008080] leading-none">
                            Rp {(safeDailyLimit / 1000).toFixed(0)}k
                          </p>
                        </div>

                        <div className="bg-[#ffdad6] border-2 border-[#ba1a1a] p-3 text-[#93000a]">
                          <p className="font-bold text-xs flex items-start gap-1">
                            <span className="material-symbols-outlined text-base">warning</span>
                            <span>{records.transactions.length} catatan transaksi tersimpan.</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* SECTION 2: AKTIFITAS DASHBOARD (Span 5 cols) (Item 4 Fix) */}
                <section className="md:col-span-5 flex flex-col gap-6">
                  <div className="brutal-card flex flex-col h-full bg-[#eeeeee]">
                    <div className="brutal-header p-4 bg-[#536000] text-white border-b-4 border-black flex justify-between items-center">
                      <div>
                        <h2 className="font-bold text-xl uppercase tracking-tight">2. AKTIFITAS & AGENDA</h2>
                        <p className="font-jetbrains text-xs opacity-90">Jadwal & Tugas Urgent</p>
                      </div>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-[#d2f000] text-black border-2 border-black px-2 py-1 text-xs font-bold font-jetbrains uppercase hover:bg-white transition-all"
                      >
                        ➕ Tambah
                      </button>
                    </div>

                    <div className="p-6 flex flex-col gap-6 flex-grow">
                      {/* Log Status Agenda */}
                      <div className="flex items-center justify-between bg-black text-[#d2f000] p-4 border-2 border-black">
                        <span className="font-black text-3xl">{completedActsCount}/{totalActsCount}</span>
                        <span className="font-jetbrains text-xs uppercase font-bold">Aktivitas Selesai</span>
                      </div>

                      {/* Urgent Tasks */}
                      <div>
                        <h3 className="font-jetbrains text-xs uppercase mb-3 border-b-2 border-black pb-1 font-bold text-[#ba1a1a] flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">warning</span> Urgent / Mendesak:
                        </h3>
                        <ul className="flex flex-col gap-2 font-jetbrains text-xs">
                          {records.activities.filter((a) => a.priority === 'urgent' || a.priority === 'high').length === 0 ? (
                            <li className="p-2 border-2 border-black bg-white text-black/50 italic">Tidak ada tugas urgent saat ini.</li>
                          ) : (
                            records.activities.filter((a) => a.priority === 'urgent' || a.priority === 'high').map((a) => (
                              <li key={a.id} className="p-2 border-2 border-black bg-white font-bold text-[#ba1a1a]">
                                🚨 {a.title}
                              </li>
                            ))
                          )}
                        </ul>
                      </div>

                      {/* Scheduled List */}
                      <div className="mt-auto">
                        <h3 className="font-jetbrains text-xs uppercase mb-3 border-b-2 border-black pb-1 font-bold">
                          Agenda Terjadwal:
                        </h3>
                        <ul className="flex flex-col gap-2 font-jetbrains text-xs">
                          {records.activities.slice(0, 3).map((act) => (
                            <li
                              key={act.id}
                              onClick={() => setQuickViewRecord(act)}
                              className="flex items-center gap-2 p-2 border-2 border-black bg-white hover:translate-x-1 transition-all cursor-pointer"
                            >
                              <div className={`w-4 h-4 border-2 border-black ${act.status === 'completed' ? 'bg-[#d2f000]' : 'bg-white'}`}></div>
                              <span className={act.status === 'completed' ? 'line-through opacity-60' : ''}>{act.title}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* 20 ANALYTICS CARDS GRID (Item 3 & Item 6 Fix) */}
              <div className="mt-8 border-t-4 border-black pt-8">
                <h2 className="font-black text-2xl md:text-3xl uppercase tracking-tight mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-3xl">analytics</span>
                  <span>20 Model Analisis Real-Time</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {analytics.map((item) => {
                    const hasValidChartData = item.chartData && Array.isArray(item.chartData) && item.chartData.length > 0;
                    const hasInsightText = Boolean(item.insight && String(item.insight).trim().length > 0);

                    return (
                      <div key={item.id} className="brutal-card flex flex-col justify-between p-5 relative">
                        <div>
                          <div className="flex justify-between items-start mb-3 border-b-2 border-black pb-2">
                            <span className="font-jetbrains text-xs bg-black text-white px-2 py-1 font-bold">
                              #{String(item.id).padStart(2, '0')}
                            </span>
                            <span className="font-jetbrains text-xs uppercase font-bold text-[#008080]">
                              {item.category}
                            </span>
                          </div>

                          <h3 className="font-bold text-lg mb-2">{item.title}</h3>

                          {/* Item 3 Fix: If data is empty or insufficient, show detailed description and minimum data target */}
                          {hasInsightText ? (
                            <p className="font-jetbrains text-xs text-black/90 mb-4">{item.insight}</p>
                          ) : (
                            <div className="bg-[#e2e2e2] p-3 border-2 border-black mb-4 font-jetbrains text-xs space-y-2">
                              <p className="font-bold text-black flex items-center gap-1">
                                <span className="material-symbols-outlined text-base">info</span> Deskripsi Model:
                              </p>
                              <p className="text-black/80">
                                Model ini menganalisis tren, distribusi, serta kebiasaan {item.category === 'reflection' ? 'keuangan' : 'aktivitas'} kamu secara otomatis.
                              </p>
                              <div className="border-t border-black/30 pt-2">
                                <p className="font-bold text-[#008080]">
                                  📊 Target Minimal Data: Butuh minimal 3 catatan untuk mengaktifkan grafik ini.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Chart Display if Available */}
                        {hasValidChartData ? (
                          <div className="h-40 w-full mt-2 border-2 border-black bg-white p-2">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={item.chartData}>
                                <XAxis dataKey="name" stroke="#000" fontSize={10} />
                                <YAxis stroke="#000" fontSize={10} />
                                <Tooltip contentStyle={{ background: '#fff', border: '2px solid #000' }} />
                                <Bar dataKey="value" fill="#008080" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowAddModal(true)}
                            className="mt-2 w-full bg-[#d2f000] border-2 border-black hover:bg-black hover:text-white p-2 text-xs font-bold font-jetbrains uppercase transition-all"
                          >
                            ⚡ ➕ Tambah Data Baru
                          </button>
                        )}

                        {/* Quick Detail Shortcut Button */}
                        <button
                          onClick={() => setQuickViewRecord(item)}
                          className="mt-3 w-full bg-[#f9f9f9] border-2 border-black hover:bg-[#008080] hover:text-white p-2 text-xs font-bold font-jetbrains uppercase transition-all"
                        >
                          👁️ Detail Model #{item.id}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* EDIT DATA VIEW (ITEM 1 & 2 FIX: MOBILE CARDS & TABLES) */
            <>
              {/* Header & Sub-Tabs */}
              <header className="mb-4">
                <h1 className="font-black text-3xl md:text-6xl uppercase tracking-tighter mb-4 leading-none">
                  Editor: Data Core
                </h1>

                {/* Sub-tabs toggle */}
                <div className="flex gap-4 border-b-4 border-black pb-4">
                  <button
                    onClick={() => setEditSubTab('keuangan')}
                    className={`px-4 md:px-6 py-3 font-bold uppercase text-xs md:text-sm border-2 border-black transition-all ${
                      editSubTab === 'keuangan'
                        ? 'bg-[#008080] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                        : 'bg-white text-black hover:bg-[#e2e2e2]'
                    }`}
                  >
                    💳 Keuangan ({records.transactions.length})
                  </button>

                  <button
                    onClick={() => setEditSubTab('aktifitas')}
                    className={`px-4 md:px-6 py-3 font-bold uppercase text-xs md:text-sm border-2 border-black transition-all ${
                      editSubTab === 'aktifitas'
                        ? 'bg-[#536000] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                        : 'bg-white text-black hover:bg-[#e2e2e2]'
                    }`}
                  >
                    📅 Aktifitas ({records.activities.length})
                  </button>
                </div>
              </header>

              {/* Toolbar Search & Filters */}
              <div className="bg-white p-4 brutalist-border brutalist-shadow flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="block font-jetbrains text-xs uppercase mb-1 font-bold">Global Query</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2">search</span>
                    <input
                      type="text"
                      placeholder="Search ID, Description, or Value..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#f9f9f9] thin-border p-3 pl-10 font-jetbrains text-sm focus:outline-none focus:border-[#008080] focus:shadow-[4px_4px_0px_0px_#008080] transition-all"
                    />
                  </div>
                </div>

                {editSubTab === 'keuangan' && (
                  <div className="flex gap-4 w-full md:w-auto">
                    <div className="w-full md:w-40">
                      <label className="block font-jetbrains text-xs uppercase mb-1 font-bold">Kategori</label>
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full bg-[#f9f9f9] thin-border p-3 font-jetbrains text-sm appearance-none focus:outline-none focus:border-[#008080] transition-all"
                      >
                        <option value="all">All Categories</option>
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Data Table & Mobile Cards Container */}
              {editSubTab === 'keuangan' ? (
                <div className="bg-white brutalist-border brutalist-shadow-lg flex flex-col overflow-hidden">
                  <div className="bg-[#008080] text-white p-4 border-b-4 border-black flex justify-between items-center">
                    <h2 className="font-bold text-base md:text-lg uppercase">Financial Records</h2>
                    <span className="font-jetbrains text-xs bg-black text-white px-2 py-1 font-bold">
                      {filteredTxs.length} ROWS
                    </span>
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="bg-[#e2e2e2] font-bold text-xs uppercase">
                          <th className="p-4 cell-border border-b-4 border-black w-32">Date</th>
                          <th className="p-4 cell-border border-b-4 border-black">Description / Merchant</th>
                          <th className="p-4 cell-border border-b-4 border-black w-40">Category</th>
                          <th className="p-4 cell-border border-b-4 border-black w-40 text-right">Amount</th>
                          <th className="p-4 cell-border border-b-4 border-black w-32 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="font-jetbrains text-sm">
                        {filteredTxs.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center font-bold uppercase text-black/60">
                              Tidak ada catatan transaksi ditemukan.
                            </td>
                          </tr>
                        ) : (
                          filteredTxs.map((t) => (
                            <tr key={t.id} className="hover:bg-[#008080]/5 transition-colors group">
                              <td className="p-4 cell-border font-bold">
                                {new Date(t.occurred_at || t.created_at).toLocaleDateString('id-ID')}
                              </td>
                              <td className="p-4 cell-border font-bold">
                                {t.merchant || t.description || 'Transaksi'}
                              </td>
                              <td className="p-4 cell-border">
                                <span className="bg-[#e2e2e2] px-2 py-1 border border-black text-xs font-bold uppercase">
                                  {t.type || 'Expense'}
                                </span>
                              </td>
                              <td className={`p-4 cell-border text-right font-bold text-base ${t.type === 'income' ? 'text-[#008080]' : 'text-[#ba1a1a]'}`}>
                                {t.type === 'income' ? '+' : '-'}Rp {Number(t.amount).toLocaleString('id-ID')}
                              </td>
                              <td className="p-4 cell-border text-center">
                                <button
                                  onClick={() => handleDeleteRecord(t.id, 'transaction')}
                                  className="p-2 border-2 border-black bg-white hover:bg-[#ba1a1a] hover:text-white transition-all"
                                  title="Delete Record"
                                >
                                  <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card List View (Item 1 Responsive Fix) */}
                  <div className="block md:hidden p-4 space-y-4 font-jetbrains text-xs">
                    {filteredTxs.length === 0 ? (
                      <p className="text-center font-bold p-4">Tidak ada catatan transaksi.</p>
                    ) : (
                      filteredTxs.map((t) => (
                        <div key={t.id} className="border-2 border-black p-3 bg-white space-y-2 brutalist-shadow">
                          <div className="flex justify-between items-center border-b border-black pb-1">
                            <span className="font-bold">{new Date(t.occurred_at || t.created_at).toLocaleDateString('id-ID')}</span>
                            <span className="bg-[#e2e2e2] px-2 py-0.5 border border-black font-bold uppercase">{t.type}</span>
                          </div>
                          <p className="font-bold text-sm">{t.merchant || t.description || 'Transaksi'}</p>
                          <div className="flex justify-between items-center pt-1">
                            <span className={`font-black text-sm ${t.type === 'income' ? 'text-[#008080]' : 'text-[#ba1a1a]'}`}>
                              {t.type === 'income' ? '+' : '-'}Rp {Number(t.amount).toLocaleString('id-ID')}
                            </span>
                            <button
                              onClick={() => handleDeleteRecord(t.id, 'transaction')}
                              className="p-1 border-2 border-black bg-white hover:bg-[#ba1a1a] hover:text-white"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white brutalist-border brutalist-shadow-lg flex flex-col overflow-hidden">
                  <div className="bg-[#536000] text-white p-4 border-b-4 border-black flex justify-between items-center">
                    <h2 className="font-bold text-base md:text-lg uppercase">Activity Records</h2>
                    <span className="font-jetbrains text-xs bg-black text-white px-2 py-1 font-bold">
                      {filteredActs.length} ROWS
                    </span>
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="bg-[#e2e2e2] font-bold text-xs uppercase">
                          <th className="p-4 cell-border border-b-4 border-black w-32">Date</th>
                          <th className="p-4 cell-border border-b-4 border-black">Judul Agenda</th>
                          <th className="p-4 cell-border border-b-4 border-black w-32">Priority</th>
                          <th className="p-4 cell-border border-b-4 border-black w-32">Status</th>
                          <th className="p-4 cell-border border-b-4 border-black w-32 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="font-jetbrains text-sm">
                        {filteredActs.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center font-bold uppercase text-black/60">
                              Tidak ada catatan aktivitas ditemukan.
                            </td>
                          </tr>
                        ) : (
                          filteredActs.map((a) => (
                            <tr key={a.id} className="hover:bg-[#536000]/5 transition-colors group">
                              <td className="p-4 cell-border font-bold">
                                {new Date(a.occurred_at || a.created_at).toLocaleDateString('id-ID')}
                              </td>
                              <td className="p-4 cell-border font-bold">{a.title}</td>
                              <td className="p-4 cell-border">
                                <span className={`px-2 py-1 border border-black text-xs font-bold uppercase ${a.priority === 'urgent' ? 'bg-[#ba1a1a] text-white' : 'bg-[#e2e2e2]'}`}>
                                  {a.priority || 'medium'}
                                </span>
                              </td>
                              <td className="p-4 cell-border">
                                <span className={`px-2 py-1 border border-black text-xs font-bold uppercase ${a.status === 'completed' ? 'bg-[#d2f000] text-black' : 'bg-[#e2e2e2]'}`}>
                                  {a.status || 'scheduled'}
                                </span>
                              </td>
                              <td className="p-4 cell-border text-center">
                                <button
                                  onClick={() => handleDeleteRecord(a.id, 'activity')}
                                  className="p-2 border-2 border-black bg-white hover:bg-[#ba1a1a] hover:text-white transition-all"
                                  title="Delete Record"
                                >
                                  <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card List View (Item 1 Responsive Fix) */}
                  <div className="block md:hidden p-4 space-y-4 font-jetbrains text-xs">
                    {filteredActs.length === 0 ? (
                      <p className="text-center font-bold p-4">Tidak ada catatan aktivitas.</p>
                    ) : (
                      filteredActs.map((a) => (
                        <div key={a.id} className="border-2 border-black p-3 bg-white space-y-2 brutalist-shadow">
                          <div className="flex justify-between items-center border-b border-black pb-1">
                            <span className="font-bold">{new Date(a.occurred_at || a.created_at).toLocaleDateString('id-ID')}</span>
                            <span className={`px-2 py-0.5 border border-black font-bold uppercase ${a.priority === 'urgent' ? 'bg-[#ba1a1a] text-white' : 'bg-[#e2e2e2]'}`}>
                              {a.priority || 'medium'}
                            </span>
                          </div>
                          <p className="font-bold text-sm">{a.title}</p>
                          <div className="flex justify-between items-center pt-1">
                            <span className={`px-2 py-0.5 border border-black font-bold uppercase ${a.status === 'completed' ? 'bg-[#d2f000]' : 'bg-[#e2e2e2]'}`}>
                              {a.status || 'scheduled'}
                            </span>
                            <button
                              onClick={() => handleDeleteRecord(a.id, 'activity')}
                              className="p-1 border-2 border-black bg-white hover:bg-[#ba1a1a] hover:text-white"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Floating Action Button (+ Add Record) */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-[#d2f000] text-black brutalist-border brutalist-shadow-lg brutalist-hover brutalist-active flex items-center justify-center z-50 cursor-pointer"
        title="Tambah Data Baru"
      >
        <span className="material-symbols-outlined text-3xl font-bold">add</span>
      </button>

      {/* Modal Add Record */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white brutalist-border brutalist-shadow-lg p-6 max-w-md w-full relative">
            <div className="flex justify-between items-center border-b-4 border-black pb-3 mb-4">
              <h3 className="font-bold text-xl uppercase">Tambah Catatan Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="font-bold text-lg hover:text-[#ba1a1a]">✕</button>
            </div>

            <form onSubmit={handleAddRecord} className="flex flex-col gap-4">
              <div>
                <label className="block font-jetbrains text-xs font-bold uppercase mb-1">Tipe Data</label>
                <select
                  value={newRecordType}
                  onChange={(e) => setNewRecordType(e.target.value as any)}
                  className="w-full bg-[#f9f9f9] thin-border p-3 font-jetbrains text-sm"
                >
                  <option value="transaction">Transaksi Keuangan</option>
                  <option value="activity">Agenda / Aktivitas</option>
                </select>
              </div>

              <div>
                <label className="block font-jetbrains text-xs font-bold uppercase mb-1">
                  {newRecordType === 'transaction' ? 'Nama Toko / Deskripsi' : 'Judul Agenda'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={newRecordType === 'transaction' ? 'Misal: Kopi Janji Jiwa' : 'Misal: Meeting Klien'}
                  value={formData.titleOrMerchant}
                  onChange={(e) => setFormData({ ...formData, titleOrMerchant: e.target.value })}
                  className="w-full bg-[#f9f9f9] thin-border p-3 font-jetbrains text-sm"
                />
              </div>

              {newRecordType === 'transaction' && (
                <div>
                  <label className="block font-jetbrains text-xs font-bold uppercase mb-1">Nominal (Rp)</label>
                  <input
                    type="number"
                    required
                    placeholder="50000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full bg-[#f9f9f9] thin-border p-3 font-jetbrains text-sm"
                  />
                </div>
              )}

              <div className="flex gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-[#e2e2e2] text-black brutalist-border p-3 font-bold uppercase text-sm active:translate-y-1"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#008080] text-white brutalist-border p-3 font-bold uppercase text-sm active:translate-y-1"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Command Palette (Ctrl+K) */}
      {showCommandPalette && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-20 p-4">
          <div className="bg-white brutalist-border brutalist-shadow-lg p-6 max-w-xl w-full">
            <div className="flex justify-between items-center border-b-4 border-black pb-3 mb-4">
              <h3 className="font-bold text-lg uppercase flex items-center gap-2">
                <span className="material-symbols-outlined">terminal</span> Global Command Palette
              </h3>
              <span className="font-jetbrains text-xs bg-black text-white px-2 py-0.5 font-bold">ESC to Close</span>
            </div>

            <div className="flex flex-col gap-3 font-jetbrains text-xs">
              <p className="font-bold uppercase text-black/70 mb-1">Pintasan Cepat (Shortcuts):</p>
              <button
                onClick={() => { setActiveTab('analisis'); setShowCommandPalette(false); }}
                className="p-3 text-left border-2 border-black hover:bg-[#d2f000] font-bold flex justify-between items-center"
              >
                <span>📊 Buka Dashboard Analisis</span>
                <span>[Switch Tab]</span>
              </button>

              <button
                onClick={() => { setActiveTab('edit'); setEditSubTab('keuangan'); setShowCommandPalette(false); }}
                className="p-3 text-left border-2 border-black hover:bg-[#d2f000] font-bold flex justify-between items-center"
              >
                <span>💳 Kelola Data Transaksi Keuangan</span>
                <span>[Edit Keuangan]</span>
              </button>

              <button
                onClick={() => { setActiveTab('edit'); setEditSubTab('aktifitas'); setShowCommandPalette(false); }}
                className="p-3 text-left border-2 border-black hover:bg-[#d2f000] font-bold flex justify-between items-center"
              >
                <span>📅 Kelola Agenda & Aktivitas</span>
                <span>[Edit Aktivitas]</span>
              </button>

              <button
                onClick={() => { setShowAddModal(true); setShowCommandPalette(false); }}
                className="p-3 text-left border-2 border-black hover:bg-[#008080] hover:text-white font-bold flex justify-between items-center"
              >
                <span>➕ Tambah Transaksi / Agenda Baru</span>
                <span>[Quick Add]</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Center Modal */}
      {showNotificationsModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white brutalist-border brutalist-shadow-lg p-6 max-w-lg w-full">
            <div className="flex justify-between items-center border-b-4 border-black pb-3 mb-4">
              <h3 className="font-bold text-xl uppercase flex items-center gap-2">
                <span className="material-symbols-outlined text-[#008080]">notifications</span> Notification Center
              </h3>
              <button onClick={() => setShowNotificationsModal(false)} className="font-bold text-lg">✕</button>
            </div>

            <div className="flex flex-col gap-4 font-jetbrains text-xs">
              <div className="p-4 border-2 border-black bg-[#d2f000]/30">
                <p className="font-bold uppercase text-sm mb-1">☀️ Morning Briefing Hari Ini</p>
                <p className="text-black/80 mb-3">Briefing pagi yang disusun khusus untukmu telah tersedia.</p>
                <button
                  onClick={() => { setBriefingDismissed(false); setShowNotificationsModal(false); setActiveTab('analisis'); }}
                  className="bg-black text-white px-3 py-2 font-bold uppercase hover:bg-[#008080] transition-all"
                >
                  📖 Buka & Baca Briefing
                </button>
              </div>

              {briefingData.urgentActs.length > 0 ? (
                <div className="p-4 border-2 border-black bg-white">
                  <p className="font-bold uppercase text-sm mb-1 text-[#ba1a1a]">🚨 Peringatan Agenda Urgent</p>
                  <ul className="text-black/80 font-jetbrains text-xs space-y-1 list-disc list-inside">
                    {briefingData.urgentActs.map((act, i) => <li key={i}>{act}</li>)}
                  </ul>
                </div>
              ) : (
                <div className="p-4 border-2 border-black bg-white">
                  <p className="font-bold uppercase text-sm mb-1 text-[#008080]">✅ Tidak Ada Agenda Urgent</p>
                  <p className="text-black/60">Semua tugas berjalan lancar, tidak ada yang mendesak.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick View Item Detail Modal */}
      {quickViewRecord && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white brutalist-border brutalist-shadow-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center border-b-4 border-black pb-3 mb-4">
              <h3 className="font-bold text-lg uppercase">Detail Rekaman</h3>
              <button onClick={() => setQuickViewRecord(null)} className="font-bold text-lg">✕</button>
            </div>

            <div className="font-jetbrains text-sm space-y-3">
              <p><strong>Judul / Item:</strong> {quickViewRecord.title || quickViewRecord.merchant || quickViewRecord.description}</p>
              {quickViewRecord.amount && <p><strong>Nominal:</strong> Rp {Number(quickViewRecord.amount).toLocaleString('id-ID')}</p>}
              {quickViewRecord.insight && <p><strong>Insight:</strong> {quickViewRecord.insight}</p>}
              {quickViewRecord.category && <p><strong>Kategori:</strong> {quickViewRecord.category}</p>}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setQuickViewRecord(null)}
                className="bg-black text-white px-4 py-2 font-bold uppercase text-xs"
              >
                Tutup (ESC)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-jetbrains font-bold">LOADING DASHBOARD...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
