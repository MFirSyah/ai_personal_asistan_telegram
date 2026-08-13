'use client';

import { useMemo } from 'react';
import { Transaction, Activity } from './types';

interface AnomaliesViewProps {
  transactions: Transaction[];
  activities: Activity[];
  onOpenEditModal: (record: any, type: 'transaction' | 'activity') => void;
  onNavigateToEdit: () => void;
}

export default function AnomaliesView({
  transactions,
  activities,
  onOpenEditModal,
  onNavigateToEdit,
}: AnomaliesViewProps) {
  // Expense anomalies (> 500,000 IDR or unusually high)
  const expenseAnomalies = useMemo(() => {
    return transactions.filter((t) => t.type === 'expense' && Number(t.amount || 0) >= 500000);
  }, [transactions]);

  // Schedule collision anomalies (activities occurring on same day & hour)
  const scheduleCollisions = useMemo(() => {
    const collisions: { a1: Activity; a2: Activity }[] = [];
    for (let i = 0; i < activities.length; i++) {
      for (let j = i + 1; j < activities.length; j++) {
        const d1 = new Date(activities[i].occurred_at);
        const d2 = new Date(activities[j].occurred_at);

        if (!isNaN(d1.getTime()) && !isNaN(d2.getTime())) {
          const diffMinutes = Math.abs(d1.getTime() - d2.getTime()) / (1000 * 60);
          if (diffMinutes <= 30 && activities[i].status !== 'completed' && activities[j].status !== 'completed') {
            collisions.push({ a1: activities[i], a2: activities[j] });
          }
        }
      }
    }
    return collisions;
  }, [activities]);

  const urgentActivities = useMemo(() => {
    return activities.filter((a) => (a.priority === 'urgent' || a.priority === 'high') && a.status !== 'completed');
  }, [activities]);

  const hasNoAnomalies = expenseAnomalies.length === 0 && scheduleCollisions.length === 0 && urgentActivities.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <header className="mb-2">
        <h1 className="font-black text-3xl md:text-5xl uppercase tracking-tighter mb-2 leading-none">
          ⚠️ Anomali & Deteksi Risiko
        </h1>
        <p className="font-jetbrains text-xs md:text-sm bg-black text-white inline-block px-4 py-2 border-4 border-black font-bold uppercase">
          DETEKSI OTOMATIS AI: {expenseAnomalies.length + scheduleCollisions.length + urgentActivities.length} PERINGATAN
        </p>
      </header>

      {hasNoAnomalies ? (
        <div className="brutal-card p-8 bg-[#d2f000] text-black border-4 border-black text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <span className="material-symbols-outlined text-6xl text-[#008080] mb-2">verified_user</span>
          <h2 className="font-black text-2xl uppercase tracking-tight mb-2">Semua Berjalan Aman & Lancar!</h2>
          <p className="font-jetbrains text-xs max-w-md mx-auto">
            Tidak terdeteksi adanya anomali pengeluaran tak wajar, bentrokan jadwal, atau tugas mumpuk yang belum terselesaikan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* High Expense Anomalies */}
          <div className="brutal-card p-5 bg-white dark:bg-[#1a1c1c] border-4 border-black flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 border-b-2 border-black pb-2 mb-3">
                <span className="material-symbols-outlined text-[#ba1a1a]">payments</span>
                <h3 className="font-bold text-base uppercase text-[#ba1a1a]">
                  Pengeluaran Skala Besar (&ge; Rp 500k)
                </h3>
              </div>
              <p className="font-jetbrains text-xs text-black/70 dark:text-white/70 mb-4">
                Transaksi dengan nominal besar yang perlu kamu konfirmasi atau tinjau kembali:
              </p>

              <div className="space-y-3 font-jetbrains text-xs">
                {expenseAnomalies.length === 0 ? (
                  <p className="p-3 border-2 border-black bg-[#f9f9f9] dark:bg-[#2a2d2d] italic">Tidak ada pengeluaran di atas Rp 500.000.</p>
                ) : (
                  expenseAnomalies.map((tx) => (
                    <div key={tx.id} className="p-3 border-2 border-black bg-[#ffdad6] text-[#93000a] flex justify-between items-center">
                      <div>
                        <p className="font-bold text-sm">{tx.merchant || tx.description || 'Transaksi'}</p>
                        <p className="text-[10px] opacity-80">{new Date(tx.occurred_at).toLocaleDateString('id-ID')} • {new Date(tx.occurred_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-sm">Rp {Number(tx.amount).toLocaleString('id-ID')}</p>
                        <button
                          onClick={() => onOpenEditModal(tx, 'transaction')}
                          className="text-[10px] font-bold underline uppercase bg-black text-white px-2 py-0.5 mt-1 border border-black hover:bg-white hover:text-black transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Schedule Collisions */}
          <div className="brutal-card p-5 bg-white dark:bg-[#1a1c1c] border-4 border-black flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 border-b-2 border-black pb-2 mb-3">
                <span className="material-symbols-outlined text-[#ff8c00]">event_busy</span>
                <h3 className="font-bold text-base uppercase text-[#ff8c00]">
                  Jadwal Berbenturan (&le; 30 Menit)
                </h3>
              </div>
              <p className="font-jetbrains text-xs text-black/70 dark:text-white/70 mb-4">
                Agenda yang memiliki jam pelaksanaan terlalu berdekatan:
              </p>

              <div className="space-y-3 font-jetbrains text-xs">
                {scheduleCollisions.length === 0 ? (
                  <p className="p-3 border-2 border-black bg-[#f9f9f9] dark:bg-[#2a2d2d] italic">Tidak ada jadwal yang bentrok saat ini.</p>
                ) : (
                  scheduleCollisions.map((col, idx) => (
                    <div key={idx} className="p-3 border-2 border-black bg-[#ffe8a3] text-black space-y-1">
                      <p className="font-bold">⚠️ Bentrokan #{idx + 1}:</p>
                      <p className="text-xs">1. {col.a1.title} ({new Date(col.a1.occurred_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})</p>
                      <p className="text-xs">2. {col.a2.title} ({new Date(col.a2.occurred_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={onNavigateToEdit}
              className="mt-4 w-full bg-[#008080] text-white brutalist-border p-2.5 font-bold uppercase font-jetbrains text-xs hover:bg-black transition-colors cursor-pointer"
            >
              🔄 Atur Ulang Jam Agenda di Editor
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
