'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Transaction {
  id: string;
  rawId?: string;
  date: string;
  type: string;
  amount: number;
  merchant: string;
  paymentMethod: string;
  description: string;
}

interface Activity {
  id: string;
  rawId?: string;
  date: string;
  title: string;
  status: string;
  priority: string;
}

export default function AdminDataInspectorPage() {
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'tx' | 'act'>('tx');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  const [auditData, setAuditData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Edit Modal State
  const [editingTx, setEditingTx] = useState<any>(null);
  const [newAmount, setNewAmount] = useState<string>('');
  const [newMerchant, setNewMerchant] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newType, setNewType] = useState<string>('expense');

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [createAmount, setCreateAmount] = useState<string>('');
  const [createMerchant, setCreateMerchant] = useState<string>('');
  const [createDesc, setCreateDesc] = useState<string>('');
  const [createType, setCreateType] = useState<string>('expense');

  const fetchAuditData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/audit-db');
      const data = await res.json();
      setAuditData(data);
    } catch (e) {
      console.error('Failed to fetch audit data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, []);

  const handleEditClick = (tx: any) => {
    setEditingTx(tx);
    setNewAmount(String(tx.amount || 0));
    setNewMerchant(tx.merchant || '');
    setNewDesc(tx.description || '');
    setNewType(tx.type || 'expense');
  };

  const handleSaveEdit = async () => {
    if (!editingTx) return;
    try {
      const rawId = editingTx.rawId || editingTx.id.replace('TX-', '');
      const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_transaction',
          payload: {
            id: rawId,
            amount: parseFloat(newAmount),
            merchant: newMerchant,
            description: newDesc,
            type: newType,
          },
        }),
      });
      if (res.ok) {
        alert('Transaksi berhasil diperbarui di database Supabase live!');
        setEditingTx(null);
        fetchAuditData();
      } else {
        const err = await res.json();
        alert('Gagal mengedit data: ' + err.error);
      }
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  const handleDeleteTx = async (tx: any) => {
    if (!confirm(`Hapus transaksi ${tx.id} (${tx.merchant})?`)) return;
    try {
      const rawId = tx.rawId || tx.id.replace('TX-', '');
      const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_transaction',
          payload: { id: rawId },
        }),
      });
      if (res.ok) {
        alert('Transaksi berhasil dihapus (soft delete) di database!');
        fetchAuditData();
      }
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  const handleCreateTx = async () => {
    if (!createAmount || !createMerchant) {
      alert('Jumlah dan Merchant wajib diisi!');
      return;
    }
    try {
      const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_transaction',
          payload: {
            amount: parseFloat(createAmount),
            merchant: createMerchant,
            description: createDesc,
            type: createType,
          },
        }),
      });
      if (res.ok) {
        alert('Transaksi baru berhasil ditambahkan ke database Supabase live!');
        setShowCreateModal(false);
        setCreateAmount('');
        setCreateMerchant('');
        setCreateDesc('');
        fetchAuditData();
      }
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  const txList: Transaction[] = auditData?.transactionsSummary?.sampleActiveTransactions || [];
  const actList: Activity[] = auditData?.activitiesSummary?.sampleActiveActivities || [];

  const filteredTxs = txList.filter((t) => {
    const matchesSearch =
      t.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white p-8 font-sans">
      <header className="mb-8 flex justify-between items-center border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-cyan-400">
            🗄️ Multi-Tenant Data Inspector & Manipulator
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Inspeksi Real-time, Penyuntingan, & Modifikasi Data Supabase Per User (Firman / Khofita)
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-sm transition"
          >
            + Tambah Transaksi Baru
          </button>
          <Link href="/admin" className="px-4 py-2 bg-gray-800 text-gray-200 rounded-lg text-sm font-semibold">
            ← Kembali ke Admin Center
          </Link>
        </div>
      </header>

      {/* User Selector */}
      <div className="flex gap-4 items-center mb-6 bg-[#1F2833] p-4 rounded-xl border border-gray-800">
        <span className="text-xs font-bold text-gray-400">PILIH PROFIL USER:</span>
        {[
          { id: 'all', label: '👥 Semua User (Joint Ledger)' },
          { id: 'firman', label: '👤 Mas Firman' },
          { id: 'khofita', label: '👤 Mbak Khofita' },
        ].map((u) => (
          <button
            key={u.id}
            onClick={() => setSelectedUser(u.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedUser === u.id
                ? 'bg-purple-600 text-white'
                : 'bg-[#0B0C10] text-gray-400 hover:text-white'
            }`}
          >
            {u.label}
          </button>
        ))}
      </div>

      {/* Overview Cards */}
      {auditData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#1F2833] p-4 rounded-xl border border-gray-800">
            <span className="text-xs text-gray-400 font-bold block">TOTAL TRANSAKSI IN DATABASE</span>
            <span className="text-xl font-extrabold text-white mt-1 block">
              {auditData.transactionsSummary.totalRecords} Records ({auditData.transactionsSummary.activeRecords} Active)
            </span>
          </div>
          <div className="bg-[#1F2833] p-4 rounded-xl border border-gray-800">
            <span className="text-xs text-gray-400 font-bold block">TOTAL PEMASUKAN</span>
            <span className="text-xl font-extrabold text-emerald-400 mt-1 block">
              Rp {auditData.transactionsSummary.totalIncome.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="bg-[#1F2833] p-4 rounded-xl border border-gray-800">
            <span className="text-xs text-gray-400 font-bold block">TOTAL PENGELUARAN</span>
            <span className="text-xl font-extrabold text-rose-400 mt-1 block">
              Rp {auditData.transactionsSummary.totalExpense.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="bg-[#1F2833] p-4 rounded-xl border border-gray-800">
            <span className="text-xs text-gray-400 font-bold block">NET SURPLUS</span>
            <span className="text-xl font-extrabold text-cyan-400 mt-1 block">
              +Rp {auditData.transactionsSummary.netBalance.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex justify-between items-center mb-4 bg-[#1F2833] p-4 rounded-xl border border-gray-800">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('tx')}
            className={`px-4 py-2 rounded-lg text-xs font-bold ${
              activeTab === 'tx' ? 'bg-purple-600 text-white' : 'bg-[#0B0C10] text-gray-400'
            }`}
          >
            📊 Keuangan ({filteredTxs.length})
          </button>
          <button
            onClick={() => setActiveTab('act')}
            className={`px-4 py-2 rounded-lg text-xs font-bold ${
              activeTab === 'act' ? 'bg-purple-600 text-white' : 'bg-[#0B0C10] text-gray-400'
            }`}
          >
            📅 Agenda ({actList.length})
          </button>
        </div>

        <div className="flex gap-4">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#0B0C10] border border-gray-800 text-xs text-white rounded-lg px-3 py-2"
          >
            <option value="all">Semua Tipe</option>
            <option value="income">Pemasukan (Income)</option>
            <option value="expense">Pengeluaran (Expense)</option>
          </select>
          <input
            type="text"
            placeholder="Cari Merchant / Deskripsi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#0B0C10] border border-gray-800 text-xs text-white rounded-lg px-4 py-2 w-64"
          />
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-[#1F2833] rounded-xl border border-gray-800 p-6 overflow-x-auto">
        {loading ? (
          <p className="text-gray-400 text-center py-8">Mengambil data dari Supabase live...</p>
        ) : activeTab === 'tx' ? (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="pb-3">ID</th>
                <th className="pb-3">TANGGAL</th>
                <th className="pb-3">TIPE</th>
                <th className="pb-3">NOMINAL</th>
                <th className="pb-3">MERCHANT / TEMPAT</th>
                <th className="pb-3">METODE BAYAR</th>
                <th className="pb-3">DESKRIPSI</th>
                <th className="pb-3 text-right">AKSI ADMINISTRATOR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredTxs.map((t) => (
                <tr key={t.id} className="hover:bg-[#0B0C10]/50 transition">
                  <td className="py-3 font-bold text-purple-400">{t.id}</td>
                  <td className="py-3 text-gray-400">{new Date(t.date).toLocaleDateString('id-ID')}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        t.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {t.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 font-bold text-white">Rp {t.amount.toLocaleString('id-ID')}</td>
                  <td className="py-3 text-gray-200">{t.merchant}</td>
                  <td className="py-3 text-gray-400">{t.paymentMethod}</td>
                  <td className="py-3 text-gray-300 max-w-xs truncate">{t.description}</td>
                  <td className="py-3 text-right space-x-2">
                    <button
                      onClick={() => handleEditClick(t)}
                      className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold text-[11px]"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTx(t)}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold text-[11px]"
                    >
                      🗑️ Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="pb-3">ID AGENDA</th>
                <th className="pb-3">JUDUL AKTIVITAS</th>
                <th className="pb-3">STATUS</th>
                <th className="pb-3">PRIORITAS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {actList.map((a) => (
                <tr key={a.id}>
                  <td className="py-3 font-bold text-cyan-400">{a.id}</td>
                  <td className="py-3 font-bold text-white">{a.title}</td>
                  <td className="py-3 text-emerald-400 font-bold">{a.status.toUpperCase()}</td>
                  <td className="py-3 text-purple-400 font-bold">{a.priority.toUpperCase()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {editingTx && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1F2833] border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-white mb-4">✏️ Edit Transaksi ({editingTx.id})</h3>
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">JUMLAH NOMINAL (RP)</label>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full bg-[#0B0C10] border border-gray-800 rounded-lg p-2.5 text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">MERCHANT / TEMPAT</label>
                <input
                  type="text"
                  value={newMerchant}
                  onChange={(e) => setNewMerchant(e.target.value)}
                  className="w-full bg-[#0B0C10] border border-gray-800 rounded-lg p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">DESKRIPSI</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-[#0B0C10] border border-gray-800 rounded-lg p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">TIPE TRANSAKSI</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full bg-[#0B0C10] border border-gray-800 rounded-lg p-2.5 text-white"
                >
                  <option value="expense">Pengeluaran (Expense)</option>
                  <option value="income">Pemasukan (Income)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingTx(null)}
                className="px-4 py-2 bg-gray-800 text-gray-300 font-bold rounded-lg text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1F2833] border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-white mb-4">+ Tambah Transaksi Baru via Admin</h3>
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">JUMLAH NOMINAL (RP)</label>
                <input
                  type="number"
                  placeholder="Contoh: 50000"
                  value={createAmount}
                  onChange={(e) => setCreateAmount(e.target.value)}
                  className="w-full bg-[#0B0C10] border border-gray-800 rounded-lg p-2.5 text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">MERCHANT / TEMPAT</label>
                <input
                  type="text"
                  placeholder="Contoh: Indomaret"
                  value={createMerchant}
                  onChange={(e) => setCreateMerchant(e.target.value)}
                  className="w-full bg-[#0B0C10] border border-gray-800 rounded-lg p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">DESKRIPSI</label>
                <input
                  type="text"
                  placeholder="Contoh: Beli keperluan bulanan"
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  className="w-full bg-[#0B0C10] border border-gray-800 rounded-lg p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">TIPE TRANSAKSI</label>
                <select
                  value={createType}
                  onChange={(e) => setCreateType(e.target.value)}
                  className="w-full bg-[#0B0C10] border border-gray-800 rounded-lg p-2.5 text-white"
                >
                  <option value="expense">Pengeluaran (Expense)</option>
                  <option value="income">Pemasukan (Income)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-800 text-gray-300 font-bold rounded-lg text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleCreateTx}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs"
              >
                Tambah Ke Supabase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
