'use client';

import { useState } from 'react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function ExportModal({ isOpen, onClose, userId }: ExportModalProps) {
  const [target, setTarget] = useState<'all' | 'transactions' | 'activities'>('all');
  const [format, setFormat] = useState<'csv' | 'sql'>('csv');

  if (!isOpen) return null;

  const exportUrl = `/api/export?userId=${userId}&target=${target}&format=${format}`;

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
            📥 Export & Backup Data
          </h3>
          <button onClick={onClose} className="font-bold text-base hover:text-[#ba1a1a] p-1" aria-label="Tutup Modal">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Format Selection */}
          <div>
            <label className="block font-bold uppercase mb-2 text-black dark:text-white">1. Pilih Format File</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-3 border-2 border-black font-bold uppercase text-left transition-colors cursor-pointer flex flex-col gap-1 ${
                  format === 'csv'
                    ? 'bg-[#d2f000] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-[#f9f9f9] dark:bg-[#2a2d2d] text-black dark:text-white hover:bg-[#e2e2e2]'
                }`}
              >
                <span className="text-sm">📊 File CSV</span>
                <span className="text-[10px] font-normal opacity-80">Untuk Excel & Google Sheets</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('sql')}
                className={`p-3 border-2 border-black font-bold uppercase text-left transition-colors cursor-pointer flex flex-col gap-1 ${
                  format === 'sql'
                    ? 'bg-[#d2f000] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-[#f9f9f9] dark:bg-[#2a2d2d] text-black dark:text-white hover:bg-[#e2e2e2]'
                }`}
              >
                <span className="text-sm">💾 Skrip SQL</span>
                <span className="text-[10px] font-normal opacity-80">Backup Database PostgreSQL</span>
              </button>
            </div>
          </div>

          {/* Target Selection */}
          {format === 'csv' && (
            <div>
              <label className="block font-bold uppercase mb-2 text-black dark:text-white">2. Pilih Cakupan Data</label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 p-2.5 border-2 border-black dark:border-white/20 bg-[#f9f9f9] dark:bg-[#2a2d2d] text-black dark:text-white cursor-pointer hover:bg-[#d2f000] hover:text-black transition-colors font-bold">
                  <input
                    type="radio"
                    name="target"
                    value="all"
                    checked={target === 'all'}
                    onChange={() => setTarget('all')}
                  />
                  <span>📁 Semua Data (Keuangan & Agenda)</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 border-2 border-black dark:border-white/20 bg-[#f9f9f9] dark:bg-[#2a2d2d] text-black dark:text-white cursor-pointer hover:bg-[#d2f000] hover:text-black transition-colors font-bold">
                  <input
                    type="radio"
                    name="target"
                    value="transactions"
                    checked={target === 'transactions'}
                    onChange={() => setTarget('transactions')}
                  />
                  <span>💳 Transaksi Keuangan Saja</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 border-2 border-black dark:border-white/20 bg-[#f9f9f9] dark:bg-[#2a2d2d] text-black dark:text-white cursor-pointer hover:bg-[#d2f000] hover:text-black transition-colors font-bold">
                  <input
                    type="radio"
                    name="target"
                    value="activities"
                    checked={target === 'activities'}
                    onChange={() => setTarget('activities')}
                  />
                  <span>📅 Agenda & Aktivitas Saja</span>
                </label>
              </div>
            </div>
          )}

          {format === 'sql' && (
            <div className="p-3 border-2 border-black dark:border-white/20 bg-[#008080]/10 text-black dark:text-white space-y-1">
              <p className="font-bold uppercase text-[#008080] dark:text-[#20b2aa]">🛡️ Skrip SQL Terisolasi:</p>
              <p className="text-[10px]">
                Menghasilkan query <code>INSERT INTO</code> lengkap untuk seluruh transaksi, aktivitas, preferensi, cicilan, dan langganan khusus akun Anda.
              </p>
            </div>
          )}

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
              <span className="material-symbols-outlined text-base">download</span>
              <span>Unduh {format.toUpperCase()}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
