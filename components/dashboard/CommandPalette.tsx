'use client';

import { useState, useMemo } from 'react';
import { Transaction, Activity } from './types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  activities: Activity[];
  onSelectRecord: (record: any) => void;
  onNavigateTab: (tab: 'analisis' | 'edit' | 'anomali') => void;
  onOpenAddModal: () => void;
  onOpenExportModal: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  transactions,
  activities,
  onSelectRecord,
  onNavigateTab,
  onOpenAddModal,
  onOpenExportModal,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const matchedTxs = transactions
      .filter(
        (t) =>
          t.merchant?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.short_id?.toLowerCase().includes(q) ||
          String(t.amount).includes(q)
      )
      .slice(0, 5)
      .map((t) => ({ ...t, _kind: 'transaction' as const }));

    const matchedActs = activities
      .filter(
        (a) =>
          a.title?.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q) ||
          a.short_id?.toLowerCase().includes(q)
      )
      .slice(0, 5)
      .map((a) => ({ ...a, _kind: 'activity' as const }));

    return [...matchedTxs, ...matchedActs];
  }, [query, transactions, activities]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-16 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="command-palette-title"
    >
      <div className="bg-white dark:bg-[#1a1c1c] brutalist-border brutalist-shadow-lg p-6 max-w-xl w-full">
        <div className="flex justify-between items-center border-b-4 border-black pb-3 mb-4">
          <h3 id="command-palette-title" className="font-bold text-base md:text-lg uppercase flex items-center gap-2 text-black dark:text-white">
            <span className="material-symbols-outlined">terminal</span> Global Command Palette
          </h3>
          <span className="font-jetbrains text-[10px] bg-black text-white px-2 py-0.5 font-bold">ESC to Close</span>
        </div>

        {/* Live Search Input */}
        <div className="relative mb-4">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2">search</span>
          <input
            type="text"
            autoFocus
            placeholder="Cari transaksi, agenda, atau ketik perintah..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#f9f9f9] dark:bg-[#2a2d2d] thin-border p-3 pl-10 font-jetbrains text-xs focus:outline-none focus:border-[#008080]"
          />
        </div>

        {/* Live Search Results (D-15) */}
        {query.trim().length > 0 ? (
          <div className="flex flex-col gap-2 font-jetbrains text-xs max-h-60 overflow-y-auto mb-4">
            <p className="font-bold uppercase text-black/60 dark:text-white/60 text-[10px]">Hasil Pencarian Data ({searchResults.length}):</p>
            {searchResults.length === 0 ? (
              <p className="p-3 text-black/50 italic border-2 border-dashed border-black">Tidak ada data ditemukan untuk &quot;{query}&quot;</p>
            ) : (
              searchResults.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectRecord(item);
                    onClose();
                  }}
                  className="p-2.5 text-left border-2 border-black hover:bg-[#d2f000] hover:text-black font-bold flex justify-between items-center transition-colors cursor-pointer"
                >
                  <span className="truncate">
                    {item._kind === 'transaction'
                      ? `💳 ${item.merchant || item.description}: Rp ${Number(item.amount).toLocaleString('id-ID')}`
                      : `📅 ${item.title}`}
                  </span>
                  <span className="text-[10px] bg-black text-white px-1.5 py-0.5 ml-2 font-mono shrink-0">
                    {item.short_id || item._kind.toUpperCase()}
                  </span>
                </button>
              ))
            )}
          </div>
        ) : (
          /* Static Shortcuts */
          <div className="flex flex-col gap-2 font-jetbrains text-xs">
            <p className="font-bold uppercase text-black/60 dark:text-white/60 text-[10px]">Pintasan Akses Cepat:</p>
            <button
              onClick={() => {
                onNavigateTab('analisis');
                onClose();
              }}
              className="p-2.5 text-left border-2 border-black hover:bg-[#d2f000] hover:text-black font-bold flex justify-between items-center transition-colors cursor-pointer"
            >
              <span>📊 Buka Dashboard Overview Analisis</span>
              <span>[Tab Analisis]</span>
            </button>

            <button
              onClick={() => {
                onNavigateTab('edit');
                onClose();
              }}
              className="p-2.5 text-left border-2 border-black hover:bg-[#d2f000] hover:text-black font-bold flex justify-between items-center transition-colors cursor-pointer"
            >
              <span>💳 Kelola Data Keuangan & Aktivitas</span>
              <span>[Tab Edit]</span>
            </button>

            <button
              onClick={() => {
                onNavigateTab('anomali');
                onClose();
              }}
              className="p-2.5 text-left border-2 border-black hover:bg-[#d2f000] hover:text-black font-bold flex justify-between items-center transition-colors cursor-pointer"
            >
              <span>⚠️ Lihat Anomali & Peringatan Waktu</span>
              <span>[Tab Anomali]</span>
            </button>

            <button
              onClick={() => {
                onOpenAddModal();
                onClose();
              }}
              className="p-2.5 text-left border-2 border-black hover:bg-[#008080] hover:text-white font-bold flex justify-between items-center transition-colors cursor-pointer"
            >
              <span>➕ Tambah Transaksi / Agenda Baru</span>
              <span>[Quick Add]</span>
            </button>

            <button
              onClick={() => {
                onOpenExportModal();
                onClose();
              }}
              className="p-2.5 text-left border-2 border-black hover:bg-[#008080] hover:text-white font-bold flex justify-between items-center transition-colors cursor-pointer"
            >
              <span>📥 Export File CSV / Laporan Keuangan</span>
              <span>[Export Data]</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
