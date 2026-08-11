'use client';

import Link from 'next/link';

interface SidebarProps {
  userName: string;
  activeTab: 'analisis' | 'edit' | 'anomali';
  setActiveTab: (tab: 'analisis' | 'edit' | 'anomali') => void;
  setEditSubTab: (subTab: 'keuangan' | 'aktifitas') => void;
  onOpenExportModal: () => void;
}

export default function Sidebar({
  userName,
  activeTab,
  setActiveTab,
  setEditSubTab,
  onOpenExportModal,
}: SidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col bg-[#f9f9f9] dark:bg-[#1a1c1c] border-r-4 border-black dark:border-white/20 shadow-[4px_0px_0px_0px_rgba(0,0,0,1)] w-[280px] min-h-[calc(100vh-80px)] p-4 z-40 sticky top-20 transition-colors">
      {/* User Profile Summary */}
      <div className="mb-6 p-4 brutalist-border bg-[#008080] text-[#e3fffe] brutalist-shadow">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-black brutalist-border flex items-center justify-center text-white font-bold shrink-0">
            <span className="material-symbols-outlined text-xl">person</span>
          </div>
          <div className="min-w-0">
            <div className="font-bold text-base leading-tight truncate">{userName || 'Teman'}</div>
            <div className="font-jetbrains text-[10px] opacity-80 uppercase">Akun Terhubung</div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <nav className="flex-1 flex flex-col gap-2">
        <button
          onClick={() => setActiveTab('analisis')}
          className={`flex items-center gap-3 p-3 font-bold text-sm text-left transition-all border-2 cursor-pointer ${
            activeTab === 'analisis'
              ? 'bg-[#d2f000] text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-extrabold'
              : 'text-black/80 dark:text-white/80 hover:bg-[#e2e2e2] dark:hover:bg-white/10 border-transparent hover:border-black'
          }`}
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span>Overview Analisis</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('edit');
            setEditSubTab('keuangan');
          }}
          className={`flex items-center gap-3 p-3 font-bold text-sm text-left transition-all border-2 cursor-pointer ${
            activeTab === 'edit'
              ? 'bg-[#d2f000] text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-extrabold'
              : 'text-black/80 dark:text-white/80 hover:bg-[#e2e2e2] dark:hover:bg-white/10 border-transparent hover:border-black'
          }`}
        >
          <span className="material-symbols-outlined">payments</span>
          <span>Kelola Data</span>
        </button>

        <button
          onClick={() => setActiveTab('anomali')}
          className={`flex items-center gap-3 p-3 font-bold text-sm text-left transition-all border-2 cursor-pointer ${
            activeTab === 'anomali'
              ? 'bg-[#d2f000] text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-extrabold'
              : 'text-black/80 dark:text-white/80 hover:bg-[#e2e2e2] dark:hover:bg-white/10 border-transparent hover:border-black'
          }`}
        >
          <span className="material-symbols-outlined">warning</span>
          <span>Anomali & Alerts</span>
        </button>

        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 p-3 font-bold text-sm text-left transition-all border-2 border-transparent hover:border-black text-black/80 dark:text-white/80 hover:bg-[#e2e2e2] dark:hover:bg-white/10"
        >
          <span className="material-symbols-outlined">settings</span>
          <span>Pengaturan</span>
        </Link>
      </nav>

      {/* Export Button (D-14) */}
      <div className="mt-auto flex flex-col gap-2 border-t-4 border-black dark:border-white/20 pt-4">
        <button
          onClick={onOpenExportModal}
          className="bg-[#006565] text-white brutalist-border brutalist-shadow p-3 font-bold text-xs brutalist-hover brutalist-active flex justify-center items-center gap-2 uppercase cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">download</span> Export Data...
        </button>
      </div>
    </aside>
  );
}
