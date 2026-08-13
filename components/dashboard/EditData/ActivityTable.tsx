'use client';

import { Activity, SortField, SortDirection } from '../types';

interface ActivityTableProps {
  paginatedList: Activity[];
  totalFilteredCount: number;
  currentPage: number;
  totalPages: number;
  sortField: SortField;
  sortDirection: SortDirection;
  handleSort: (field: SortField) => void;
  onOpenEditModal: (record: Activity, type: 'activity') => void;
  onDeleteRecord: (id: string, type: 'activity') => void;
  onUpdateActivityStatus?: (id: string, newStatus: 'scheduled' | 'in_progress' | 'completed' | 'cancelled') => void;
}

export default function ActivityTable({
  paginatedList,
  totalFilteredCount,
  currentPage,
  totalPages,
  sortField,
  sortDirection,
  handleSort,
  onOpenEditModal,
  onDeleteRecord,
  onUpdateActivityStatus,
}: ActivityTableProps) {
  return (
    <div className="bg-white dark:bg-[#1a1c1c] brutalist-border brutalist-shadow-lg flex flex-col overflow-hidden">
      <div className="bg-[#536000] text-white p-4 border-b-4 border-black flex justify-between items-center">
        <h2 className="font-bold text-base md:text-lg uppercase">Record Activity & Agenda</h2>
        <span className="font-jetbrains text-xs bg-black text-white px-2 py-1 font-bold">
          {totalFilteredCount} DATA ({currentPage}/{totalPages} HALAMAN)
        </span>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[950px]">
          <thead>
            <tr className="bg-[#e2e2e2] dark:bg-[#2a2d2d] text-black dark:text-white font-bold text-xs uppercase">
              <th className="p-3 cell-border border-b-4 border-black w-28">Short ID</th>
              <th
                onClick={() => handleSort('occurred_at')}
                className="p-3 cell-border border-b-4 border-black w-28 cursor-pointer hover:bg-black/10 select-none"
              >
                Tanggal {sortField === 'occurred_at' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th className="p-3 cell-border border-b-4 border-black w-20">Jam</th>
              <th
                onClick={() => handleSort('title')}
                className="p-3 cell-border border-b-4 border-black w-44 cursor-pointer hover:bg-black/10 select-none"
              >
                Judul Agenda {sortField === 'title' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th className="p-3 cell-border border-b-4 border-black min-w-[180px]">Deskripsi / Catatan</th>
              <th className="p-3 cell-border border-b-4 border-black w-28">Prioritas</th>
              <th className="p-3 cell-border border-b-4 border-black w-44">Status (Manual)</th>
              <th className="p-3 cell-border border-b-4 border-black w-24 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="font-jetbrains text-xs text-black dark:text-white">
            {paginatedList.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center font-bold uppercase text-black/60 dark:text-white/60">
                  Tidak ada catatan agenda ditemukan.
                </td>
              </tr>
            ) : (
              paginatedList.map((a) => {
                const occDate = new Date(a.occurred_at || a.created_at || '');
                const currStatus = a.status || 'scheduled';

                return (
                  <tr key={a.id} className="hover:bg-[#536000]/10 transition-colors">
                    <td className="p-3 cell-border font-bold">
                      <span className="bg-black text-[#d2f000] px-2 py-0.5 border border-black font-mono text-[11px]">
                        {a.short_id || `ACT-${a.id?.replace(/-/g, '').substring(0, 6).toUpperCase()}`}
                      </span>
                    </td>
                    <td className="p-3 cell-border font-bold">
                      {occDate.toLocaleDateString('id-ID')}
                    </td>
                    <td className="p-3 cell-border font-bold text-black/70 dark:text-white/70">
                      {occDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3 cell-border font-bold text-black dark:text-white">
                      {a.title}
                    </td>
                    <td className="p-3 cell-border text-black/80 dark:text-white/80">
                      {a.description || '-'}
                    </td>
                    <td className="p-3 cell-border">
                      <span
                        className={`px-2 py-0.5 border border-black text-[10px] font-bold uppercase ${
                          a.priority === 'urgent'
                            ? 'bg-[#ba1a1a] text-white'
                            : a.priority === 'high'
                            ? 'bg-[#ff8c00] text-black'
                            : 'bg-[#e2e2e2] text-black'
                        }`}
                      >
                        {a.priority || 'medium'}
                      </span>
                    </td>
                    <td className="p-3 cell-border">
                      {/* Interactive Manual Status Change Dropdown */}
                      <select
                        value={currStatus}
                        onChange={(e) =>
                          onUpdateActivityStatus &&
                          onUpdateActivityStatus(
                            a.id,
                            e.target.value as 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
                          )
                        }
                        className={`w-full p-1.5 border-2 border-black font-jetbrains text-xs font-bold uppercase focus:outline-none cursor-pointer ${
                          currStatus === 'completed'
                            ? 'bg-[#d2f000] text-black'
                            : currStatus === 'in_progress'
                            ? 'bg-[#008080] text-white'
                            : currStatus === 'cancelled'
                            ? 'bg-[#ba1a1a] text-white'
                            : 'bg-white dark:bg-black text-black dark:text-white'
                        }`}
                      >
                        <option value="scheduled" className="bg-white text-black font-bold">TERJADWAL</option>
                        <option value="in_progress" className="bg-[#008080] text-white font-bold">SEDANG BERJALAN ⏳</option>
                        <option value="completed" className="bg-[#d2f000] text-black font-bold">SELESAI ✅</option>
                        <option value="cancelled" className="bg-[#ba1a1a] text-white font-bold">DIBATALKAN ❌</option>
                      </select>
                    </td>
                    <td className="p-3 cell-border text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => onOpenEditModal(a, 'activity')}
                          className="p-1.5 border-2 border-black bg-white dark:bg-black hover:bg-[#d2f000] hover:text-black text-black dark:text-white transition-all cursor-pointer"
                          title="Edit Record"
                          aria-label="Edit Aktivitas"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button
                          onClick={() => onDeleteRecord(a.id, 'activity')}
                          className="p-1.5 border-2 border-black bg-white dark:bg-black hover:bg-[#ba1a1a] hover:text-white text-black dark:text-white transition-all cursor-pointer"
                          title="Hapus Record"
                          aria-label="Hapus Aktivitas"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="block md:hidden p-4 space-y-3 font-jetbrains text-xs text-black dark:text-white">
        {paginatedList.length === 0 ? (
          <p className="text-center font-bold p-4">Tidak ada catatan agenda.</p>
        ) : (
          paginatedList.map((a) => {
            const currStatus = a.status || 'scheduled';
            return (
              <div key={a.id} className="border-2 border-black p-3 bg-white dark:bg-[#1a1c1c] space-y-2 brutalist-shadow">
                <div className="flex justify-between items-center border-b border-black pb-1">
                  <span className="bg-black text-[#d2f000] px-2 py-0.5 border border-black font-bold font-mono">
                    {a.short_id || `ACT-${a.id?.replace(/-/g, '').substring(0, 6).toUpperCase()}`}
                  </span>
                  <span className="font-bold font-mono text-[11px] text-black/80 dark:text-white/80">
                    {(() => {
                      const d = new Date(a.occurred_at || a.created_at || '');
                      if (isNaN(d.getTime())) return '-';
                      return `${d.toLocaleDateString('id-ID')} • ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
                    })()}
                  </span>
                </div>
                <p className="font-bold text-sm">📌 {a.title}</p>
                {a.description && (
                  <p className="text-xs text-black/70 dark:text-white/70 font-normal">💬 {a.description}</p>
                )}
                <div className="flex justify-between items-center pt-1 gap-2">
                  <select
                    value={currStatus}
                    onChange={(e) =>
                      onUpdateActivityStatus &&
                      onUpdateActivityStatus(
                        a.id,
                        e.target.value as 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
                      )
                    }
                    className="p-1 border-2 border-black font-jetbrains text-[10px] font-bold uppercase bg-white dark:bg-black text-black dark:text-white"
                  >
                    <option value="scheduled">TERJADWAL</option>
                    <option value="in_progress">BERJALAN ⏳</option>
                    <option value="completed">SELESAI ✅</option>
                    <option value="cancelled">BATAL ❌</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onOpenEditModal(a, 'activity')}
                      className="p-1 border-2 border-black bg-white dark:bg-black hover:bg-[#d2f000] text-black dark:text-white hover:text-black"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button
                      onClick={() => onDeleteRecord(a.id, 'activity')}
                      className="p-1 border-2 border-black bg-white dark:bg-black hover:bg-[#ba1a1a] text-black dark:text-white hover:text-white"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
