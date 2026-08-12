'use client';

import { RecordFilter } from '../types';

interface RecordSearchAndFilterProps {
  editSubTab: 'keuangan' | 'aktifitas';
  filter: RecordFilter;
  setFilter: (filter: RecordFilter) => void;
  setCurrentPage: (page: number) => void;
}

export default function RecordSearchAndFilter({
  editSubTab,
  filter,
  setFilter,
  setCurrentPage,
}: RecordSearchAndFilterProps) {
  return (
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

      {/* Date Range Filter */}
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

      {/* Category / Type Filter (Only for Keuangan) */}
      {editSubTab === 'keuangan' && (
        <div className="w-full md:w-48">
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
            <option value="expense">🔴 Pengeluaran</option>
            <option value="income">🟢 Pemasukan</option>
          </select>
        </div>
      )}
    </div>
  );
}
