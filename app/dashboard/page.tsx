'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Transaction, Activity, Category, InsightItem, ToastMessage } from '@/components/dashboard/types';
import Navbar from '@/components/dashboard/Navbar';
import Sidebar from '@/components/dashboard/Sidebar';
import AnalyticsView from '@/components/dashboard/AnalyticsView';
import EditDataView from '@/components/dashboard/EditDataView';
import AnomaliesView from '@/components/dashboard/AnomaliesView';
import AddEditRecordModal from '@/components/dashboard/AddEditRecordModal';
import CommandPalette from '@/components/dashboard/CommandPalette';
import NotificationCenter from '@/components/dashboard/NotificationCenter';
import QuickViewModal from '@/components/dashboard/QuickViewModal';
import ExportModal from '@/components/dashboard/ExportModal';
import ToastContainer from '@/components/dashboard/Toast';
import { DashboardSkeleton } from '@/components/dashboard/Skeleton';
import { ErrorBoundary } from '@/components/dashboard/ErrorBoundary';

function DashboardContent() {
  const searchParams = useSearchParams();
  const urlTelegramId = searchParams.get('telegram_id');

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<InsightItem[]>([]);
  const [activeTab, setActiveTab] = useState<'analisis' | 'edit' | 'anomali'>('analisis');
  const [editSubTab, setEditSubTab] = useState<'keuangan' | 'aktifitas'>('keuangan');
  const [userName, setUserName] = useState<string>('');
  const [userId, setUserId] = useState<string>('demo-user');

  // Dark Mode State (D-21)
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Briefing & Notifications state
  const [briefingDismissed, setBriefingDismissed] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  // Modals & Palette states
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<{ record: Transaction | Activity; type: 'transaction' | 'activity' } | null>(null);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [quickViewRecord, setQuickViewRecord] = useState<any | null>(null);

  // Toast Notifications state (D-07, D-08)
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Records state
  const [records, setRecords] = useState<{ transactions: Transaction[]; activities: Activity[]; categories: Category[] }>({
    transactions: [],
    activities: [],
    categories: [],
  });

  const addToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string, undoAction?: () => void) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const newToast: ToastMessage = { id, type, title, message, undoAction };
    setToasts((prev) => [...prev.slice(-4), newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('dashboard_theme', next ? 'dark' : 'light');
        if (next) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const theme = localStorage.getItem('dashboard_theme');
      if (theme === 'dark') {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  // Keyboard Shortcuts (Esc & Ctrl+K) (D-15, D-22)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddEditModal(false);
        setShowCommandPalette(false);
        setShowExportModal(false);
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

  // Auth & Data Fetching
  useEffect(() => {
    const initAuthAndData = async () => {
      setLoading(true);
      let effectiveTelegramId = urlTelegramId;
      let effectiveName = '';

      if (typeof window !== 'undefined') {
        if (!effectiveTelegramId) {
          effectiveTelegramId = localStorage.getItem('saved_telegram_id');
        }

        if ((window as any).Telegram?.WebApp) {
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
      }

      let targetUserId = (typeof window !== 'undefined' && localStorage.getItem('saved_user_id')) || 'demo-user';

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
            if (typeof window !== 'undefined') {
              localStorage.setItem('saved_telegram_id', effectiveTelegramId);
              localStorage.setItem('saved_user_id', tgData.user.id);
            }
          }
        } catch (err) {
          console.error('Failed to resolve Telegram user:', err);
        }
      }

      // Fetch Records
      try {
        const queryParams = new URLSearchParams();
        if (targetUserId) queryParams.set('userId', targetUserId);
        if (effectiveTelegramId) queryParams.set('telegram_id', effectiveTelegramId);

        const recRes = await fetch(`/api/data/records?${queryParams.toString()}`);
        const recData = await recRes.json();
        if (recData.ok) {
          setRecords({
            transactions: recData.transactions || [],
            activities: recData.activities || [],
            categories: recData.categories || [],
          });
          if (recData.userId) {
            targetUserId = recData.userId;
            setUserId(recData.userId);
            if (typeof window !== 'undefined') {
              localStorage.setItem('saved_user_id', recData.userId);
            }
          }
          if (recData.userName) {
            setUserName(recData.userName);
          }
        }
      } catch (err) {
        console.error('Failed to load records:', err);
        addToast('error', 'Gagal Memuat Data Records');
      }

      // Fetch Analytics Summary
      try {
        const queryParams = new URLSearchParams();
        if (targetUserId) queryParams.set('userId', targetUserId);
        if (effectiveTelegramId) queryParams.set('telegram_id', effectiveTelegramId);

        const res = await fetch(`/api/analytics/summary?${queryParams.toString()}`);
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

  // Handle Record Delete with Undo Toast (D-08)
  const handleDeleteRecord = async (id: string, type: 'transaction' | 'activity') => {
    const targetList = type === 'transaction' ? records.transactions : records.activities;
    const deletedItem = targetList.find((r) => r.id === id);

    // Optimistic UI Removal
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

    try {
      const res = await fetch('/api/data/records', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, recordId: id, type }),
      });
      const data = await res.json();

      if (data.ok) {
        addToast('success', 'Data Dihapus', `${type === 'transaction' ? 'Transaksi' : 'Aktivitas'} berhasil dihapus.`, async () => {
          // Undo Delete callback (D-08)
          if (deletedItem) {
            try {
              const restoreRes = await fetch('/api/data/records', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, type, data: deletedItem }),
              });
              const restoreData = await restoreRes.json();
              if (restoreData.ok && restoreData.record) {
                if (type === 'transaction') {
                  setRecords((prev) => ({ ...prev, transactions: [restoreData.record, ...prev.transactions] }));
                } else {
                  setRecords((prev) => ({ ...prev, activities: [restoreData.record, ...prev.activities] }));
                }
                addToast('info', 'Penghapusan Dibatalkan');
              }
            } catch (rErr) {
              console.error('Failed undo delete:', rErr);
            }
          }
        });
      }
    } catch (err) {
      console.error('Delete error:', err);
      addToast('error', 'Gagal Menghapus Data');
    }
  };

  // Handle Add / Edit Record (D-01)
  const handleSaveRecord = async (
    type: 'transaction' | 'activity',
    isEdit: boolean,
    id: string | null,
    payload: any
  ) => {
    try {
      const endpoint = '/api/data/records';
      const method = isEdit ? 'PATCH' : 'POST';
      const body = isEdit
        ? { userId, recordId: id, type, data: payload }
        : { userId, type, data: payload };

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await res.json();
      if (result.ok && result.record) {
        if (isEdit) {
          if (type === 'transaction') {
            setRecords((prev) => ({
              ...prev,
              transactions: prev.transactions.map((t) => (t.id === id ? result.record : t)),
            }));
          } else {
            setRecords((prev) => ({
              ...prev,
              activities: prev.activities.map((a) => (a.id === id ? result.record : a)),
            }));
          }
          addToast('success', 'Data Diperbarui', 'Perubahan berhasil disimpan!');
        } else {
          if (type === 'transaction') {
            setRecords((prev) => ({ ...prev, transactions: [result.record, ...prev.transactions] }));
          } else {
            setRecords((prev) => ({ ...prev, activities: [result.record, ...prev.activities] }));
          }
          addToast('success', 'Data Ditambahkan', 'Catatan baru telah berhasil dibuat!');
        }
      } else {
        addToast('error', 'Gagal Menyimpan Data', result.error || 'Terjadi kesalahan.');
      }
    } catch (err: any) {
      console.error('Save error:', err);
      addToast('error', 'Gagal Menyimpan Data', err.message);
    }
  };

  const openAddModal = () => {
    setEditingRecord(null);
    setShowAddEditModal(true);
  };

  const openEditModal = (record: Transaction | Activity, type: 'transaction' | 'activity') => {
    setEditingRecord({ record, type });
    setShowAddEditModal(true);
  };

  const urgentActsList = records.activities
    .filter((a) => (a.priority === 'urgent' || a.priority === 'high') && a.status !== 'completed')
    .map((a) => a.title);

  return (
    <div className="font-montserrat text-on-background bg-background min-h-screen flex flex-col antialiased pb-20 md:pb-0 transition-colors">
      {/* Toast Container (D-07) */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setEditSubTab={setEditSubTab}
        recordsCount={{ transactions: records.transactions.length, activities: records.activities.length }}
        onOpenSearch={() => setShowCommandPalette(true)}
        onOpenNotifications={() => setShowNotificationsModal(true)}
        hasBriefingNotification={!briefingDismissed}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Main Container */}
      <div className="flex flex-1 max-w-[1440px] mx-auto w-full">
        {/* Sidebar */}
        <Sidebar
          userName={userName}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setEditSubTab={setEditSubTab}
          onOpenExportModal={() => setShowExportModal(true)}
        />

        {/* Workspace Content */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden flex flex-col gap-6">
          {loading ? (
            <DashboardSkeleton />
          ) : activeTab === 'analisis' ? (
            <AnalyticsView
              analytics={analytics}
              transactions={records.transactions}
              activities={records.activities}
              briefingDismissed={briefingDismissed}
              onDismissBriefing={() => setBriefingDismissed(true)}
              onOpenAddModal={openAddModal}
              onQuickView={(item) => setQuickViewRecord(item)}
              onNavigateToEdit={(subTab) => {
                setActiveTab('edit');
                setEditSubTab(subTab);
              }}
            />
          ) : activeTab === 'edit' ? (
            <EditDataView
              editSubTab={editSubTab}
              setEditSubTab={setEditSubTab}
              transactions={records.transactions}
              activities={records.activities}
              categories={records.categories}
              onOpenEditModal={(rec, type) => openEditModal(rec, type)}
              onDeleteRecord={handleDeleteRecord}
            />
          ) : (
            <AnomaliesView
              transactions={records.transactions}
              activities={records.activities}
              onOpenEditModal={(rec, type) => openEditModal(rec, type)}
              onNavigateToEdit={() => {
                setActiveTab('edit');
                setEditSubTab('aktifitas');
              }}
            />
          )}
        </main>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={openAddModal}
        className="fixed bottom-8 right-8 w-16 h-16 bg-[#d2f000] text-black brutalist-border brutalist-shadow-lg brutalist-hover brutalist-active flex items-center justify-center z-50 cursor-pointer"
        title="Tambah Data Baru"
        aria-label="Tambah Data Baru"
      >
        <span className="material-symbols-outlined text-3xl font-bold">add</span>
      </button>

      {/* Modals & Dialogs */}
      <AddEditRecordModal
        isOpen={showAddEditModal}
        onClose={() => setShowAddEditModal(false)}
        onSubmit={handleSaveRecord}
        categories={records.categories}
        editingRecord={editingRecord}
      />

      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        transactions={records.transactions}
        activities={records.activities}
        onSelectRecord={(rec) => setQuickViewRecord(rec)}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onOpenAddModal={openAddModal}
        onOpenExportModal={() => setShowExportModal(true)}
      />

      <NotificationCenter
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        onOpenBriefing={() => {
          setBriefingDismissed(false);
          setActiveTab('analisis');
        }}
        urgentActs={urgentActsList}
      />

      <QuickViewModal record={quickViewRecord} onClose={() => setQuickViewRecord(null)} />

      <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} userId={userId} />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </ErrorBoundary>
  );
}
