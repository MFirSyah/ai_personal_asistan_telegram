'use client';

import { useState, useMemo } from 'react';
import { Transaction, Activity, Category, RecordFilter, SortField, SortDirection } from './types';
import RecordSearchAndFilter from './EditData/RecordSearchAndFilter';
import RecordPagination from './EditData/RecordPagination';
import TransactionTable from './EditData/TransactionTable';
import ActivityTable from './EditData/ActivityTable';

interface EditDataViewProps {
  editSubTab: 'keuangan' | 'aktifitas';
  setEditSubTab: (subTab: 'keuangan' | 'aktifitas') => void;
  transactions: Transaction[];
  activities: Activity[];
  categories: Category[];
  onOpenEditModal: (record: Transaction | Activity, type: 'transaction' | 'activity') => void;
  onDeleteRecord: (id: string, type: 'transaction' | 'activity') => void;
  onUpdateActivityStatus?: (id: string, newStatus: 'scheduled' | 'in_progress' | 'completed' | 'cancelled') => void;
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
  onUpdateActivityStatus,
}: EditDataViewProps) {
  // Filter state
  const [filter, setFilter] = useState<RecordFilter>({
    query: '',
    category: 'all',
    dateRange: 'all',
  });

  // Sort state
  const [sortField, setSortField] = useState<SortField>('occurred_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Pagination state
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
        valA = (a.title || '').toLowerCase();
        valB = (b.title || '').toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [activities, filter, sortField, sortDirection]);

  const activeList = editSubTab === 'keuangan' ? filteredTxs : filteredActs;
  const totalPages = Math.ceil(activeList.length / ITEMS_PER_PAGE) || 1;

  const paginatedList = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return activeList.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [activeList, currentPage]);

  return (
    <div className="flex flex-col gap-6">
      {/* Sub-Header & Navigation Tabs */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-black text-3xl md:text-5xl uppercase tracking-tighter mb-1 leading-none">
            Kelola Data: {editSubTab === 'keuangan' ? 'Keuangan' : 'Aktifitas'}
          </h1>
          <p className="font-jetbrains text-xs md:text-sm bg-black text-white inline-block px-3 py-1 border-2 border-black font-bold uppercase">
            {editSubTab === 'keuangan' ? `${transactions.length} Records Transaksi` : `${activities.length} Records Agenda`}
          </p>
        </div>

        <div className="flex gap-2">
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

      {/* Toolbar Search & Filters */}
      <RecordSearchAndFilter
        editSubTab={editSubTab}
        filter={filter}
        setFilter={setFilter}
        setCurrentPage={setCurrentPage}
      />

      {/* Main Table Content */}
      {editSubTab === 'keuangan' ? (
        <TransactionTable
          paginatedList={paginatedList as Transaction[]}
          totalFilteredCount={filteredTxs.length}
          currentPage={currentPage}
          totalPages={totalPages}
          sortField={sortField}
          sortDirection={sortDirection}
          categoryMap={categoryMap}
          handleSort={handleSort}
          onOpenEditModal={(rec) => onOpenEditModal(rec, 'transaction')}
          onDeleteRecord={(id) => onDeleteRecord(id, 'transaction')}
        />
      ) : (
        <ActivityTable
          paginatedList={paginatedList as Activity[]}
          totalFilteredCount={filteredActs.length}
          currentPage={currentPage}
          totalPages={totalPages}
          sortField={sortField}
          sortDirection={sortDirection}
          handleSort={handleSort}
          onOpenEditModal={(rec) => onOpenEditModal(rec, 'activity')}
          onDeleteRecord={(id) => onDeleteRecord(id, 'activity')}
          onUpdateActivityStatus={onUpdateActivityStatus}
        />
      )}

      {/* Pagination Controls */}
      <RecordPagination
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
}
