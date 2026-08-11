'use client';

import { useState } from 'react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function ExportModal({ isOpen, onClose, userId }: ExportModalProps) {
  const [target, setTarget] = useState<'all' | 'transactions' | 'activities'>('all');

  if (!isOpen) return null;

  const exportUrl = `/api/export?userId=${userId}&target=${target}`;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
    >
      <div className="bg-white dark:bg-[#1a1c1c] brutalist-border brutalist-shadow-lg p-6 max-w-md w-full font-jetbrains text-xs">
        <div className="flex justify-between items-center border-b-4 border-black pb-3 mb-4">
          <h3 id="export-modal-title" className="font-bold text-lg uppercase tracking-tight text-black dark:text-white">
            📥 Opsi Export Data CSV
          </h3>
          <button onClick={onClose} className="font-bold text-base hover:text-[#ba1a1a] p-1" aria-label="Tutup Modal">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block font-bold uppercase mb-2 text-black dark:text-white">Pilih Target Data Export</label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 p-3 border-2 border-black dark:border-white/20 bg-[#f9f9f9] dark:bg-[#2a2d2d] text-black dark:text-white cursor-pointer hover:bg-[#d2f000] hover:text-black transition-colors font-bold">
                <input
                  type="radio"
                  name="target"
                  value="all"
                  checked={target === 'all'}
                  onChange={() => setTarget('all')}
                />
                <span>📁 Semua Data (Keuangan & Aktifitas)</span>
              </label>

              <label className="flex items-center gap-2 p-3 border-2 border-black dark:border-white/20 bg-[#f9f9f9] dark:bg-[#2a2d2d] text-black dark:text-white cursor-pointer hover:bg-[#d2f000] hover:text-black transition-colors font-bold">
                <input
                  type="radio"
                  name="target"
                  value="transactions"
                  checked={target === 'transactions'}
                  onChange={() => setTarget('transactions')}
                />
                <span>💳 Transaksi Keuangan Saja</span>
              </label>

              <label className="flex items-center gap-2 p-3 border-2 border-black dark:border-white/20 bg-[#f9f9f9] dark:bg-[#2a2d2d] text-black dark:text-white cursor-pointer hover:bg-[#d2f000] hover:text-black transition-colors font-bold">
                <input
                  type="radio"
                  name="target"
                  value="activities"
                  checked={target === 'activities'}
                  onChange={() => setTarget('activities')}
                />
                <span>📅 Aktifitas & Agenda Saja</span>
              </label>
            </div>
          </div>

          <div className="p-3 border-2 border-black dark:border-white/20 bg-[#e2e2e2] dark:bg-white/10 text-black dark:text-white opacity-90">
            <p className="font-bold">Format Output:</p>
            <p className="text-[10px]">File CSV (Excel-Compatible UTF-8 dengan BOM sanitasi quote ganda).</p>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              onClick={onClose}
              className="flex-1 bg-[#e2e2e2] text-black brutalist-border p-3 font-bold uppercase text-xs active:translate-y-0.5 cursor-pointer"
            >
              Batal
            </button>
            <a
              href={exportUrl}
              download
              onClick={onClose}
              className="flex-1 bg-[#008080] text-white brutalist-border p-3 font-bold uppercase text-xs active:translate-y-0.5 flex justify-center items-center gap-1 hover:bg-black transition-colors"
            >
              <span className="material-symbols-outlined text-base">download</span> Unduh CSV
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
