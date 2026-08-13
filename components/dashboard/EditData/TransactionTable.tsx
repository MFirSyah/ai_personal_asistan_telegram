'use client';

import { Transaction, SortField, SortDirection } from '../types';

interface TransactionTableProps {
  paginatedList: Transaction[];
  totalFilteredCount: number;
  currentPage: number;
  totalPages: number;
  sortField: SortField;
  sortDirection: SortDirection;
  categoryMap: Map<string, string>;
  handleSort: (field: SortField) => void;
  onOpenEditModal: (record: Transaction, type: 'transaction') => void;
  onDeleteRecord: (id: string, type: 'transaction') => void;
}

export default function TransactionTable({
  paginatedList,
  totalFilteredCount,
  currentPage,
  totalPages,
  sortField,
  sortDirection,
  categoryMap,
  handleSort,
  onOpenEditModal,
  onDeleteRecord,
}: TransactionTableProps) {
  return (
    <div className="bg-white dark:bg-[#1a1c1c] brutalist-border brutalist-shadow-lg flex flex-col overflow-hidden">
      <div className="bg-[#008080] text-white p-4 border-b-4 border-black flex justify-between items-center">
        <h2 className="font-bold text-base md:text-lg uppercase">Record Transaksi Keuangan</h2>
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
                onClick={() => handleSort('merchant')}
                className="p-3 cell-border border-b-4 border-black w-36 cursor-pointer hover:bg-black/10 select-none"
              >
                Toko / Merchant {sortField === 'merchant' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th className="p-3 cell-border border-b-4 border-black min-w-[180px]">Deskripsi / Catatan</th>
              <th className="p-3 cell-border border-b-4 border-black w-28">Kategori</th>
              <th className="p-3 cell-border border-b-4 border-black w-28">Asal Input</th>
              <th
                onClick={() => handleSort('amount')}
                className="p-3 cell-border border-b-4 border-black w-32 text-right cursor-pointer hover:bg-black/10 select-none"
              >
                Nominal {sortField === 'amount' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th className="p-3 cell-border border-b-4 border-black w-24 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="font-jetbrains text-xs text-black dark:text-white">
            {paginatedList.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center font-bold uppercase text-black/60 dark:text-white/60">
                  Tidak ada catatan transaksi ditemukan.
                </td>
              </tr>
            ) : (
              paginatedList.map((t) => {
                const occDate = new Date(t.occurred_at || t.created_at || '');
                return (
                  <tr key={t.id} className="hover:bg-[#008080]/10 transition-colors">
                    <td className="p-3 cell-border font-bold">
                      <span className="bg-black text-[#d2f000] px-2 py-0.5 border border-black font-mono text-[11px]">
                        {t.short_id || `TX-${t.id?.replace(/-/g, '').substring(0, 6).toUpperCase()}`}
                      </span>
                    </td>
                    <td className="p-3 cell-border font-bold">
                      {occDate.toLocaleDateString('id-ID')}
                    </td>
                    <td className="p-3 cell-border font-bold text-black/70 dark:text-white/70">
                      {occDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3 cell-border font-bold text-black dark:text-white">
                      {t.merchant || '-'}
                    </td>
                    <td className="p-3 cell-border text-black/80 dark:text-white/80">
                      {t.description || '-'}
                    </td>
                    <td className="p-3 cell-border">
                      <span className="bg-[#e2e2e2] dark:bg-white/20 text-black dark:text-white px-2 py-0.5 border border-black text-[10px] font-bold uppercase">
                        {t.category_id ? categoryMap.get(t.category_id) || t.type : t.type}
                      </span>
                    </td>
                    <td className="p-3 cell-border">
                      <span className="bg-black/10 dark:bg-white/10 text-black dark:text-white px-1.5 py-0.5 text-[9px] uppercase font-jetbrains font-bold border border-black/30">
                        {t.source === 'telegram_chat' ? '🤖 Telegram' : t.source === 'receipt_ocr' ? '📄 Struk' : t.source || 'Manual'}
                      </span>
                    </td>
                    <td className={`p-3 cell-border text-right font-bold text-sm ${t.type === 'income' ? 'text-[#008080] dark:text-[#20b2aa]' : 'text-[#ba1a1a] dark:text-[#ff6b6b]'}`}>
                      {t.type === 'income' ? '+' : '-'}Rp {Number(t.amount).toLocaleString('id-ID')}
                    </td>
                    <td className="p-3 cell-border text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => onOpenEditModal(t, 'transaction')}
                          className="p-1.5 border-2 border-black bg-white dark:bg-black hover:bg-[#d2f000] hover:text-black text-black dark:text-white transition-all cursor-pointer"
                          title="Edit Record"
                          aria-label="Edit Transaksi"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button
                          onClick={() => onDeleteRecord(t.id, 'transaction')}
                          className="p-1.5 border-2 border-black bg-white dark:bg-black hover:bg-[#ba1a1a] hover:text-white text-black dark:text-white transition-all cursor-pointer"
                          title="Hapus Record"
                          aria-label="Hapus Transaksi"
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
          <p className="text-center font-bold p-4">Tidak ada catatan transaksi.</p>
        ) : (
          paginatedList.map((t) => (
            <div key={t.id} className="border-2 border-black p-3 bg-white dark:bg-[#1a1c1c] space-y-2 brutalist-shadow">
              <div className="flex justify-between items-center border-b border-black pb-1">
                <span className="bg-black text-[#d2f000] px-2 py-0.5 border border-black font-bold font-mono">
                  {t.short_id || `TX-${t.id?.replace(/-/g, '').substring(0, 6).toUpperCase()}`}
                </span>
                <span className="font-bold font-mono text-[11px] text-black/80 dark:text-white/80">
                  {(() => {
                    const d = new Date(t.occurred_at || t.created_at || '');
                    if (isNaN(d.getTime())) return '-';
                    return `${d.toLocaleDateString('id-ID')} • ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
                  })()}
                </span>
              </div>
              <p className="font-bold text-sm">Toko: {t.merchant || '-'}</p>
              {t.description && (
                <p className="text-xs text-black/70 dark:text-white/70 font-normal">💬 {t.description}</p>
              )}
              {t.source && (
                <span className="inline-block bg-black/10 dark:bg-white/10 text-black dark:text-white px-1.5 py-0.2 text-[9px] uppercase font-jetbrains font-bold border border-black/30">
                  {t.source === 'telegram_chat' ? '🤖 Telegram AI' : t.source === 'receipt_ocr' ? '📄 Scan Struk' : t.source}
                </span>
              )}
              <div className="flex justify-between items-center pt-1">
                <span className={`font-black text-sm ${t.type === 'income' ? 'text-[#008080] dark:text-[#20b2aa]' : 'text-[#ba1a1a] dark:text-[#ff6b6b]'}`}>
                  {t.type === 'income' ? '+' : '-'}Rp {Number(t.amount).toLocaleString('id-ID')}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => onOpenEditModal(t, 'transaction')}
                    className="p-1 border-2 border-black bg-white dark:bg-black hover:bg-[#d2f000] text-black dark:text-white hover:text-black"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button
                    onClick={() => onDeleteRecord(t.id, 'transaction')}
                    className="p-1 border-2 border-black bg-white dark:bg-black hover:bg-[#ba1a1a] text-black dark:text-white hover:text-white"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
