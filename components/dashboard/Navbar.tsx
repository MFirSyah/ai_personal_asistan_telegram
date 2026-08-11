'use client';

import Link from 'next/link';

interface NavbarProps {
  activeTab: 'analisis' | 'edit' | 'anomali';
  setActiveTab: (tab: 'analisis' | 'edit' | 'anomali') => void;
  setEditSubTab: (subTab: 'keuangan' | 'aktifitas') => void;
  recordsCount: { transactions: number; activities: number };
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  hasBriefingNotification: boolean;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  setEditSubTab,
  recordsCount,
  onOpenSearch,
  onOpenNotifications,
  hasBriefingNotification,
  isDarkMode,
  onToggleDarkMode,
}: NavbarProps) {
  return (
    <nav className="bg-[#006565] text-white border-b-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full sticky top-0 z-50 transition-colors">
      <div className="flex justify-between items-center w-full px-4 md:px-8 h-20 max-w-[1440px] mx-auto">
        {/* Brand */}
        <Link href="/dashboard" className="font-black text-xl md:text-3xl uppercase tracking-tighter text-white flex items-center gap-2 hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined text-2xl md:text-3xl">terminal</span>
          <span>DATA_CORE_V1</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex gap-4 lg:gap-8 items-center h-full">
          <button
            onClick={() => setActiveTab('analisis')}
            className={`px-4 h-full flex items-center font-bold uppercase transition-all cursor-pointer ${
              activeTab === 'analisis'
                ? 'border-b-4 border-white bg-black/20 text-white'
                : 'text-white/70 hover:text-white hover:bg-black/10'
            }`}
            aria-current={activeTab === 'analisis' ? 'page' : undefined}
          >
            📊 Analisis
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-4 h-full flex items-center font-bold uppercase transition-all cursor-pointer ${
              activeTab === 'edit'
                ? 'border-b-4 border-white bg-black/20 text-white'
                : 'text-white/70 hover:text-white hover:bg-black/10'
            }`}
            aria-current={activeTab === 'edit' ? 'page' : undefined}
          >
            ✏️ Edit Data ({recordsCount.transactions + recordsCount.activities})
          </button>
          <button
            onClick={() => setActiveTab('anomali')}
            className={`px-4 h-full flex items-center font-bold uppercase transition-all cursor-pointer ${
              activeTab === 'anomali'
                ? 'border-b-4 border-white bg-black/20 text-white'
                : 'text-white/70 hover:text-white hover:bg-black/10'
            }`}
            aria-current={activeTab === 'anomali' ? 'page' : undefined}
          >
            ⚠️ Anomali
          </button>
        </div>

        {/* Actions & Search Shortcut */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Dark Mode Toggle (D-21) */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 border-2 border-black bg-white text-black hover:bg-[#d2f000] active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center"
            title={isDarkMode ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
            aria-label="Toggle Dark Mode"
          >
            <span className="material-symbols-outlined text-lg">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Quick Search Ctrl+K Button */}
          <button
            onClick={onOpenSearch}
            className="hidden md:flex items-center brutalist-border bg-white text-black h-10 px-3 hover:bg-[#d2f000] active:translate-y-1 transition-all cursor-pointer"
            aria-label="Buka Pencarian Cepat"
          >
            <span className="material-symbols-outlined mr-2">search</span>
            <span className="font-jetbrains text-xs font-bold uppercase mr-4">Quick Search...</span>
            <kbd className="bg-black text-white px-2 py-0.5 text-[10px] font-jetbrains font-bold">Ctrl+K</kbd>
          </button>

          {/* Notification Center Button */}
          <button
            onClick={onOpenNotifications}
            className="relative hover:bg-white/10 p-2 brutalist-active flex items-center cursor-pointer border-2 border-transparent hover:border-white transition-all"
            title="Notifikasi & Briefing"
            aria-label="Notifikasi & Briefing"
          >
            <span className="material-symbols-outlined">notifications</span>
            {hasBriefingNotification && (
              <span className="absolute top-1 right-1 w-3 h-3 bg-[#d2f000] border-2 border-black rounded-full animate-ping"></span>
            )}
          </button>

          {/* Settings Link (D-05) */}
          <Link
            href="/dashboard/settings"
            className="p-2 border-2 border-black bg-white text-black hover:bg-[#d2f000] transition-all flex items-center justify-center"
            title="Pengaturan Account & Assistant"
            aria-label="Pengaturan"
          >
            <span className="material-symbols-outlined text-lg">settings</span>
          </Link>
        </div>
      </div>

      {/* Mobile Header Navigation Strip */}
      <div className="flex md:hidden border-t-2 border-black bg-black text-white px-2 py-2 justify-around font-jetbrains text-xs font-bold uppercase overflow-x-auto">
        <button
          onClick={() => setActiveTab('analisis')}
          className={`px-3 py-1 ${activeTab === 'analisis' ? 'bg-[#d2f000] text-black' : 'text-white'}`}
        >
          📊 Analisis
        </button>
        <button
          onClick={() => { setActiveTab('edit'); setEditSubTab('keuangan'); }}
          className={`px-3 py-1 ${activeTab === 'edit' ? 'bg-[#d2f000] text-black' : 'text-white'}`}
        >
          💳 Data ({recordsCount.transactions + recordsCount.activities})
        </button>
        <button
          onClick={() => setActiveTab('anomali')}
          className={`px-3 py-1 ${activeTab === 'anomali' ? 'bg-[#d2f000] text-black' : 'text-white'}`}
        >
          ⚠️ Anomali
        </button>
      </div>
    </nav>
  );
}
