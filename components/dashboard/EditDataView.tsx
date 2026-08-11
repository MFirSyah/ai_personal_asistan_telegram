'use client';

import { useState, useMemo } from 'react';
import { Transaction, Activity, Category, RecordFilter, SortField, SortDirection } from './types';

interface EditDataViewProps {
  editSubTab: 'keuangan' | 'aktifitas';
  setEditSubTab: (subTab: 'keuangan' | 'aktifitas') => void;
  transactions: Transaction[];
  activities: Activity[];
  categories: Category[];
  onOpenEditModal: (record: Transaction | Activity, type: 'transaction' | 'activity') => void;
  onDeleteRecord: (id: string, type: 'transaction' | 'activity') => void;
}

const ITEMS_PER_PAGE = 25;

export default function EditDataView({
  editSubTab,
  setEditSubTab,
  transactions,
  activities,
  categories,
  onOpenEditModal,
  onDeleteRecord,
}: EditDataViewProps) {
  // Filter state
  const [filter, setFilter] = useState<RecordFilter>({
    query: '',
    category: 'all',
    dateRange: 'all',
  });

  // Sort state (D-03)
  const [sortField, setSortField] = useState<SortField>('occurred_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Pagination state (D-02)
  const [currentPage, setCurrentPage] = useState(1);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Date Range Filtering (D-04)
  const isWithinDateRange = (dateStr: string) => {
    if (!dateStr || filter.dateRange === 'all') return true;
    const d = new Date(dateStr);
    const now = new Date();

    if (filter.dateRange === 'today') {
      return d.toDateString() === now.toDateString();
    } else if (filter.dateRange === '7days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      return d >= sevenDaysAgo;
    } else if (filter.dateRange === 'this_month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    } else if (filter.dateRange === 'last_month') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
    } else if (filter.dateRange === 'custom') {
      if (filter.startDate && d < new Date(filter.startDate)) return false;
      if (filter.endDate && d > new Date(filter.endDate + 'T23:59:59')) return false;
      return true;
    }
    return true;
  };

  // Filtered & Sorted Transactions
  const filteredTxs = useMemo(() => {
    const q = filter.query.toLowerCase().trim();
    let result = transactions.filter((t) => {
      const matchQ =
        !q ||
        t.short_id?.toLowerCase().includes(q) ||
        t.id?.toLowerCase().includes(q) ||
        t.merchant?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        String(t.amount).includes(q);

      const matchCat = filter.category === 'all' || t.type === filter.category;
      const matchDate = isWithinDateRange(t.occurred_at);

      return matchQ && matchCat && matchDate;
    });

    // Sorting (D-03)
    result.sort((a, b) => {
      let valA: any = a.occurred_at;
      let valB: any = b.occurred_at;

      if (sortField === 'amount') {
        valA = Number(a.amount || 0);
        valB = Number(b.amount || 0);
      } else if (sortField === 'merchant') {
        valA = (a.merchant || a.description || '').toLowerCase();
        valB = (b.merchant || b.description || '').toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [transactions, filter, sortField, sortDirection]);

  // Filtered & Sorted Activities
  const filteredActs = useMemo(() => {
    const q = filter.query.toLowerCase().trim();
    let result = activities.filter((a) => {
      const matchQ =
        !q ||
        a.short_id?.toLowerCase().includes(q) ||
        a.id?.toLowerCase().includes(q) ||
        a.title?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q);

      const matchDate = isWithinDateRange(a.occurred_at);

      return matchQ && matchDate;
    });

    result.sort((a, b) => {
      let valA: any = a.occurred_at;
      let valB: any = b.occurred_at;

      if (sortField === 'title') {
        valA = a.title.toLowerCase();
        valB = b.title.toLowerCase();
      } else if (sortField === 'priority') {
        const order = { urgent: 4, high: 3, medium: 2, low: 1 };
        valA = order[a.priority] || 0;
        valB = order[b.priority] || 0;
      } else if (sortField === 'status') {
        valA = a.status;
        valB = b.status;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [activities, filter, sortField, sortDirection]);

  // Pagination calculation (D-02)
  const currentList = editSubTab === 'keuangan' ? filteredTxs : filteredActs;
  const totalPages = Math.ceil(currentList.length / ITEMS_PER_PAGE) || 1;
  const paginatedList = currentList.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Sub-Tabs */}
      <header className="mb-2">
        <h1 className="font-black text-3xl md:text-5xl uppercase tracking-tighter mb-4 leading-none">
          Kelola Data: {editSubTab === 'keuangan' ? 'Keuangan' : 'Aktifitas & Agenda'}
        </h1>

        <div className="flex gap-4 border-b-4 border-black pb-4">
          <button
            onClick={() => {
              setEditSubTab('keuangan');
              setCurrentPage(1);
            }}
            className={`px-4 md:px-6 py-3 font-bold uppercase text-xs md:text-sm border-2 border-black transition-all cursor-pointer ${
              editSubTab === 'keuangan'
                ? 'bg-[#008080] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-extrabold'
                : 'bg-white dark:bg-[#1a1c1c] text-black dark:text-white hover:bg-[#e2e2e2]'
            }`}
          >
            💳 Keuangan ({transactions.length})
          </button>

          <button
            onClick={() => {
              setEditSubTab('aktifitas');
              setCurrentPage(1);
            }}
            className={`px-4 md:px-6 py-3 font-bold uppercase text-xs md:text-sm border-2 border-black transition-all cursor-pointer ${
              editSubTab === 'aktifitas'
                ? 'bg-[#536000] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-extrabold'
                : 'bg-white dark:bg-[#1a1c1c] text-black dark:text-white hover:bg-[#e2e2e2]'
            }`}
          >
            📅 Aktifitas ({activities.length})
          </button>
        </div>
      </header>

      {/* Toolbar Search & Filters (D-04) */}
      <div className="bg-white dark:bg-[#1a1c1c] p-4 brutalist-border brutalist-shadow flex flex-col md:flex-row gap-4 items-end">
        {/* Search */}
        <div className="flex-1 w-full">
          <label className="block font-jetbrains text-xs uppercase mb-1 font-bold text-black dark:text-white">Cari Data</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-black/60 dark:text-white/60">search</span>
            <input
              type="text"
              placeholder="Cari ID, Deskripsi, Toko, atau Nominal..."
              value={filter.query}
              onChange={(e) => {
                setFilter({ ...filter, query: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full bg-[#f9f9f9] dark:bg-[#2a2d2d] text-black dark:text-white thin-border p-2.5 pl-9 font-jetbrains text-xs focus:outline-none focus:border-[#008080]"
            />
          </div>
        </div>

        {/* Date Range Filter (D-04) */}
        <div className="w-full md:w-48">
          <label className="block font-jetbrains text-xs uppercase mb-1 font-bold text-black dark:text-white">Rentang Waktu</label>
          <select
            value={filter.dateRange}
            onChange={(e) => {
              setFilter({ ...filter, dateRange: e.target.value as any });
              setCurrentPage(1);
            }}
            className="w-full bg-[#f9f9f9] dark:bg-[#2a2d2d] text-black dark:text-white thin-border p-2.5 font-jetbrains text-xs appearance-none focus:outline-none focus:border-[#008080]"
          >
            <option value="all">Semua Waktu</option>
            <option value="today">Hari Ini</option>
            <option value="7days">7 Hari Terakhir</option>
            <option value="this_month">Bulan Ini</option>
            <option value="last_month">Bulan Lalu</option>
          </select>
        </div>

        {/* Category Filter for Transactions */}
        {editSubTab === 'keuangan' && (
          <div className="w-full md:w-40">
            <label className="block font-jetbrains text-xs uppercase mb-1 font-bold text-black dark:text-white">Tipe Transaksi</label>
            <select
              value={filter.category}
              onChange={(e) => {
                setFilter({ ...filter, category: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full bg-[#f9f9f9] dark:bg-[#2a2d2d] text-black dark:text-white thin-border p-2.5 font-jetbrains text-xs appearance-none focus:outline-none focus:border-[#008080]"
            >
              <option value="all">Semua Kategori</option>
              <option value="expense">Pengeluaran</option>
              <option value="income">Pemasukan</option>
            </select>
          </div>
        )}
      </div>

      {/* Table Container */}
      {editSubTab === 'keuangan' ? (
        <div className="bg-white dark:bg-[#1a1c1c] brutalist-border brutalist-shadow-lg flex flex-col overflow-hidden">
          <div className="bg-[#008080] text-white p-4 border-b-4 border-black flex justify-between items-center">
            <h2 className="font-bold text-base md:text-lg uppercase">Record Transaksi Keuangan</h2>
            <span className="font-jetbrains text-xs bg-black text-white px-2 py-1 font-bold">
              {filteredTxs.length} DATA ({currentPage}/{totalPages} HALAMAN)
            </span>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#e2e2e2] dark:bg-[#2a2d2d] text-black dark:text-white font-bold text-xs uppercase">
                  <th className="p-3 cell-border border-b-4 border-black w-32">Short ID</th>
                  <th
                    onClick={() => handleSort('occurred_at')}
                    className="p-3 cell-border border-b-4 border-black w-32 cursor-pointer hover:bg-black/10 select-none"
                  >
                    Tanggal {sortField === 'occurred_at' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('merchant')}
                    className="p-3 cell-border border-b-4 border-black cursor-pointer hover:bg-black/10 select-none"
                  >
                    Deskripsi / Toko {sortField === 'merchant' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="p-3 cell-border border-b-4 border-black w-32">Kategori</th>
                  <th
                    onClick={() => handleSort('amount')}
                    className="p-3 cell-border border-b-4 border-black w-40 text-right cursor-pointer hover:bg-black/10 select-none"
                  >
                    Nominal {sortField === 'amount' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="p-3 cell-border border-b-4 border-black w-36 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="font-jetbrains text-xs text-black dark:text-white">
                {paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center font-bold uppercase text-black/60 dark:text-white/60">
                      Tidak ada catatan transaksi ditemukan.
                    </td>
                  </tr>
                ) : (
                  (paginatedList as Transaction[]).map((t) => (
                    <tr key={t.id} className="hover:bg-[#008080]/10 transition-colors">
                      <td className="p-3 cell-border font-bold">
                        <span className="bg-black text-[#d2f000] px-2 py-0.5 border border-black font-mono text-[11px]">
                          {t.short_id || `TX-${t.id?.replace(/-/g, '').substring(0, 6).toUpperCase()}`}
                        </span>
                      </td>
                      <td className="p-3 cell-border font-bold">
                        {new Date(t.occurred_at || t.created_at || '').toLocaleDateString('id-ID')}
                      </td>
                      <td className="p-3 cell-border font-bold">
                        <div>{t.merchant || t.description || 'Transaksi'}</div>
                        {t.merchant && t.description && (
                          <div className="text-[11px] font-normal text-black/70 dark:text-white/70 mt-0.5 font-jetbrains">
                            💬 {t.description}
                          </div>
                        )}
                        {t.source && (
                          <span className="mt-1 inline-block bg-black/10 dark:bg-white/10 text-black dark:text-white px-1.5 py-0.2 text-[9px] uppercase font-jetbrains font-bold border border-black/30">
                            {t.source === 'telegram_chat' ? '🤖 Telegram AI' : t.source === 'receipt_ocr' ? '📄 Scan Struk' : t.source}
                          </span>
                        )}
                      </td>
                      <td className="p-3 cell-border">
                        <span className="bg-[#e2e2e2] dark:bg-white/20 text-black dark:text-white px-2 py-0.5 border border-black text-[10px] font-bold uppercase">
                          {t.category_id ? categoryMap.get(t.category_id) || t.type : t.type}
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="block md:hidden p-4 space-y-3 font-jetbrains text-xs text-black dark:text-white">
            {paginatedList.length === 0 ? (
              <p className="text-center font-bold p-4">Tidak ada catatan transaksi.</p>
            ) : (
              (paginatedList as Transaction[]).map((t) => (
                <div key={t.id} className="border-2 border-black p-3 bg-white dark:bg-[#1a1c1c] space-y-2 brutalist-shadow">
                  <div className="flex justify-between items-center border-b border-black pb-1">
                    <span className="bg-black text-[#d2f000] px-2 py-0.5 border border-black font-bold font-mono">
                      {t.short_id || `TX-${t.id?.replace(/-/g, '').substring(0, 6).toUpperCase()}`}
                    </span>
                    <span className="font-bold">{new Date(t.occurred_at || t.created_at || '').toLocaleDateString('id-ID')}</span>
                  </div>
                  <p className="font-bold text-sm">{t.merchant || t.description || 'Transaksi'}</p>
                  {t.merchant && t.description && (
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
      ) : (
        /* Activity Table View */
        <div className="bg-white dark:bg-[#1a1c1c] brutalist-border brutalist-shadow-lg flex flex-col overflow-hidden">
          <div className="bg-[#536000] text-white p-4 border-b-4 border-black flex justify-between items-center">
            <h2 className="font-bold text-base md:text-lg uppercase">Record Activity & Agenda</h2>
            <span className="font-jetbrains text-xs bg-black text-white px-2 py-1 font-bold">
              {filteredActs.length} DATA ({currentPage}/{totalPages} HALAMAN)
            </span>
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#e2e2e2] dark:bg-[#2a2d2d] text-black dark:text-white font-bold text-xs uppercase">
                  <th className="p-3 cell-border border-b-4 border-black w-32">Short ID</th>
                  <th
                    onClick={() => handleSort('occurred_at')}
                    className="p-3 cell-border border-b-4 border-black w-32 cursor-pointer hover:bg-black/10 select-none"
                  >
                    Tanggal {sortField === 'occurred_at' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('title')}
                    className="p-3 cell-border border-b-4 border-black cursor-pointer hover:bg-black/10 select-none"
                  >
                    Judul Agenda {sortField === 'title' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('priority')}
                    className="p-3 cell-border border-b-4 border-black w-32 cursor-pointer hover:bg-black/10 select-none"
                  >
                    Prioritas {sortField === 'priority' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('status')}
                    className="p-3 cell-border border-b-4 border-black w-32 cursor-pointer hover:bg-black/10 select-none"
                  >
                    Status {sortField === 'status' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="p-3 cell-border border-b-4 border-black w-36 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="font-jetbrains text-xs text-black dark:text-white">
                {paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center font-bold uppercase text-black/60 dark:text-white/60">
                      Tidak ada catatan aktivitas ditemukan.
                    </td>
                  </tr>
                ) : (
                  (paginatedList as Activity[]).map((a) => (
                    <tr key={a.id} className="hover:bg-[#536000]/10 transition-colors">
                      <td className="p-3 cell-border font-bold">
                        <span className="bg-black text-[#d2f000] px-2 py-0.5 border border-black font-mono text-[11px]">
                          {a.short_id || `ACT-${a.id?.replace(/-/g, '').substring(0, 6).toUpperCase()}`}
                        </span>
                      </td>
                      <td className="p-3 cell-border font-bold">
                        {new Date(a.occurred_at || a.created_at || '').toLocaleDateString('id-ID')}
                      </td>
                      <td className="p-3 cell-border font-bold">
                        <div>{a.title}</div>
                        {a.description && (
                          <div className="text-[11px] font-normal text-black/70 dark:text-white/70 mt-0.5 font-jetbrains">
                            💬 {a.description}
                          </div>
                        )}
                      </td>
                      <td className="p-3 cell-border">
                        <span
                          className={`px-2 py-0.5 border border-black text-[10px] font-bold uppercase ${
                            a.priority === 'urgent'
                              ? 'bg-[#ba1a1a] text-white'
                              : a.priority === 'high'
                              ? 'bg-[#ff8c00] text-white'
                              : 'bg-[#e2e2e2] dark:bg-white/20 text-black dark:text-white'
                          }`}
                        >
                          {a.priority || 'medium'}
                        </span>
                      </td>
                      <td className="p-3 cell-border">
                        <span
                          className={`px-2 py-0.5 border border-black text-[10px] font-bold uppercase ${
                            a.status === 'completed' ? 'bg-[#d2f000] text-black' : 'bg-[#e2e2e2] dark:bg-white/20 text-black dark:text-white'
                          }`}
                        >
                          {a.status || 'scheduled'}
                        </span>
                      </td>
                      <td className="p-3 cell-border text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => onOpenEditModal(a, 'activity')}
                            className="p-1.5 border-2 border-black bg-white dark:bg-black hover:bg-[#d2f000] text-black dark:text-white hover:text-black transition-all cursor-pointer"
                            title="Edit Record"
                            aria-label="Edit Aktivitas"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button
                            onClick={() => onDeleteRecord(a.id, 'activity')}
                            className="p-1.5 border-2 border-black bg-white dark:bg-black hover:bg-[#ba1a1a] text-black dark:text-white hover:text-white transition-all cursor-pointer"
                            title="Hapus Record"
                            aria-label="Hapus Aktivitas"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="block md:hidden p-4 space-y-3 font-jetbrains text-xs text-black dark:text-white">
            {paginatedList.length === 0 ? (
              <p className="text-center font-bold p-4">Tidak ada catatan aktivitas.</p>
            ) : (
              (paginatedList as Activity[]).map((a) => (
                <div key={a.id} className="border-2 border-black p-3 bg-white dark:bg-[#1a1c1c] space-y-2 brutalist-shadow">
                  <div className="flex justify-between items-center border-b border-black pb-1">
                    <span className="bg-black text-[#d2f000] px-2 py-0.5 border border-black font-bold font-mono">
                      {a.short_id || `ACT-${a.id?.replace(/-/g, '').substring(0, 6).toUpperCase()}`}
                    </span>
                    <span className="font-bold">{new Date(a.occurred_at || a.created_at || '').toLocaleDateString('id-ID')}</span>
                  </div>
                  <p className="font-bold text-sm">{a.title}</p>
                  {a.description && (
                    <p className="text-xs text-black/70 dark:text-white/70 font-normal">💬 {a.description}</p>
                  )}
                  <div className="flex justify-between items-center pt-1">
                    <span className={`px-2 py-0.5 border border-black font-bold uppercase ${a.status === 'completed' ? 'bg-[#d2f000] text-black' : 'bg-[#e2e2e2] dark:bg-white/20 text-black dark:text-white'}`}>
                      {a.status || 'scheduled'}
                    </span>
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
              ))
            )}
          </div>
        </div>
      )}

      {/* Pagination Controls (D-02) */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-white dark:bg-[#1a1c1c] p-4 brutalist-border font-jetbrains text-xs text-black dark:text-white">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 border-2 border-black bg-[#f9f9f9] dark:bg-[#2a2d2d] text-black dark:text-white font-bold uppercase disabled:opacity-40 hover:bg-[#008080] hover:text-white transition-all cursor-pointer"
          >
            ← Sebelumnya
          </button>

          <span className="font-bold">
            Halaman {currentPage} dari {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-4 py-2 border-2 border-black bg-[#f9f9f9] dark:bg-[#2a2d2d] text-black dark:text-white font-bold uppercase disabled:opacity-40 hover:bg-[#008080] hover:text-white transition-all cursor-pointer"
          >
            Selanjutnya →
          </button>
        </div>
      )}
    </div>
  );
}
