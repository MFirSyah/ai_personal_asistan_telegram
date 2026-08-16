'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Transaction {
  id: string;
  rawId: string;
  userId: string;
  userName: string;
  date: string;
  type: string;
  amount: number;
  merchant: string;
  paymentMethod: string;
  description: string;
  deletedAt?: string | null;
}

interface Activity {
  id: string;
  rawId: string;
  userId: string;
  userName: string;
  date: string;
  title: string;
  status: string;
  priority: string;
  deletedAt?: string | null;
}

interface UserPreference {
  key: string;
  value: string;
  learnedFrom: string;
  updatedAt: string;
  userName: string;
}

export default function AdminDataInspectorPage() {
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'tx' | 'act' | 'pref'>('tx');
  const [statusFilter, setStatusFilter] = useState<'active' | 'deleted' | 'all'>('active');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [auditData, setAuditData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Edit Modal State
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [newAmount, setNewAmount] = useState<string>('');
  const [newMerchant, setNewMerchant] = useState<string>('');
  const [newMethod, setNewMethod] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newType, setNewType] = useState<string>('expense');

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [createUserId, setCreateUserId] = useState<string>('');
  const [createAmount, setCreateAmount] = useState<string>('');
  const [createMerchant, setCreateMerchant] = useState<string>('');
  const [createMethod, setCreateMethod] = useState<string>('Cash');
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

  const handleEditClick = (tx: Transaction) => {
    setEditingTx(tx);
    setNewAmount(String(tx.amount || 0));
    setNewMerchant(tx.merchant || '');
    setNewMethod(tx.paymentMethod || 'Cash');
    setNewDesc(tx.description || '');
    setNewType(tx.type || 'expense');
  };

  const handleSaveEdit = async () => {
    if (!editingTx) return;
    try {
      const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_transaction',
          payload: {
            id: editingTx.rawId,
            amount: parseFloat(newAmount),
            merchant: newMerchant,
            payment_method: newMethod,
            description: newDesc,
            type: newType,
          },
        }),
      });
      if (res.ok) {
        alert('Data transaksi berhasil diperbarui di Supabase live!');
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

  const handleDeleteTx = async (tx: Transaction) => {
    if (!confirm(`Hapus (soft delete) transaksi ${tx.id} (${tx.merchant})?`)) return;
    try {
      const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_transaction',
          payload: { id: tx.rawId },
        }),
      });
      if (res.ok) {
        alert('Transaksi berhasil di-soft delete!');
        fetchAuditData();
      }
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  const handleRestoreTx = async (tx: Transaction) => {
    try {
      const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'restore_transaction',
          payload: { id: tx.rawId },
        }),
      });
      if (res.ok) {
        alert('Transaksi berhasil dipulihkan!');
        fetchAuditData();
      }
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  const handleCreateTx = async () => {
    if (!createAmount || !createMerchant) {
      alert('Jumlah Nominal dan Merchant wajib diisi!');
      return;
    }
    try {
      const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_transaction',
          payload: {
            user_id: createUserId || (usersList[0]?.id || '00000000-0000-0000-0000-000000000001'),
            amount: parseFloat(createAmount),
            merchant: createMerchant,
            payment_method: createMethod,
            description: createDesc,
            type: createType,
          },
        }),
      });
      if (res.ok) {
        alert('Transaksi baru berhasil ditambahkan!');
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

  const allTxs: Transaction[] = auditData?.transactionsSummary?.allTransactions || [];
  const allActs: Activity[] = auditData?.activitiesSummary?.allActivities || [];
  const prefs: UserPreference[] = auditData?.userPreferences || [];
  const usersList: any[] = auditData?.usersList || [];

  // Filtering per User and Filters
  const userFilteredTxs = allTxs.filter((t) => {
    if (selectedUser === 'all') return true;
    return t.userId === selectedUser || t.userName.toLowerCase().includes(selectedUser.toLowerCase());
  });

  const finalFilteredTxs = userFilteredTxs.filter((t) => {
    const matchesSearch =
      t.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    
    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = !t.deletedAt;
    if (statusFilter === 'deleted') matchesStatus = !!t.deletedAt;

    return matchesSearch && matchesType && matchesStatus;
  });

  const userFilteredActs = allActs.filter((a) => {
    if (selectedUser === 'all') return true;
    return a.userId === selectedUser || a.userName.toLowerCase().includes(selectedUser.toLowerCase());
  });

  const activeUserTxs = userFilteredTxs.filter((t) => !t.deletedAt);
  let userIncome = 0;
  let userExpense = 0;
  activeUserTxs.forEach((t) => {
    if (t.type === 'income') userIncome += t.amount;
    if (t.type === 'expense') userExpense += t.amount;
  });
  const userNetBalance = userIncome - userExpense;

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white p-8 font-sans">
      {/* Header */}
      <header className="mb-8 flex justify-between items-center border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-cyan-400">
            🗄️ Multi-Tenant Super Admin Data Inspector
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Modifikasi Live, Audit Presisi, & Filter Data Per User (Mas Firman & Mbak Khofita)
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-lg transition"
          >
            + Tambah Transaksi Baru
          </button>
          <Link href="/admin" className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl text-xs font-semibold">
            ← Kembali ke Control Center
          </Link>
        </div>
      </header>

      {/* User Selector Tabs */}
      <div className="bg-[#1F2833] p-4 rounded-2xl border border-gray-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-extrabold text-gray-400 tracking-wider">PILIH PROFIL USER:</span>
          <button
            onClick={() => setSelectedUser('all')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              selectedUser === 'all'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-[#0B0C10] text-gray-400 hover:text-white'
            }`}
          >
            👥 Semua User (Joint Ledger - {allTxs.filter((t) => !t.deletedAt).length} TX)
          </button>
          {usersList.map((u) => (
            <button
              key={u.id}
              onClick={() => setSelectedUser(u.id)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                selectedUser === u.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-[#0B0C10] text-gray-400 hover:text-white'
              }`}
            >
              👤 {u.name}
            </button>
          ))}
        </div>

        <div className="text-xs text-gray-400">
          Status Database Supabase: <span className="text-emerald-400 font-bold">🟢 Live Connected</span>
        </div>
      </div>

      {/* Dynamic User Analytics Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1F2833] p-5 rounded-2xl border border-gray-800">
          <span className="text-[11px] font-bold text-gray-400 block tracking-wider">TOTAL PEMASUKAN</span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">
            Rp {userIncome.toLocaleString('id-ID')}
          </span>
        </div>

        <div className="bg-[#1F2833] p-5 rounded-2xl border border-gray-800">
          <span className="text-[11px] font-bold text-gray-400 block tracking-wider">TOTAL PENGELUARAN</span>
          <span className="text-2xl font-black text-rose-400 mt-1 block">
            Rp {userExpense.toLocaleString('id-ID')}
          </span>
        </div>

        <div className="bg-[#1F2833] p-5 rounded-2xl border border-gray-800">
          <span className="text-[11px] font-bold text-gray-400 block tracking-wider">NET SURPLUS (SALDO)</span>
          <span className="text-2xl font-black text-cyan-400 mt-1 block">
            +Rp {userNetBalance.toLocaleString('id-ID')}
          </span>
        </div>

        <div className="bg-[#1F2833] p-5 rounded-2xl border border-gray-800">
          <span className="text-[11px] font-bold text-gray-400 block tracking-wider">AGENDA COMPLETED</span>
          <span className="text-2xl font-black text-purple-400 mt-1 block">
            {userFilteredActs.filter((a) => a.status === 'completed').length} / {userFilteredActs.length} Agenda
          </span>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-[#1F2833] p-4 rounded-2xl border border-gray-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('tx')}
            className={`px-4 py-2 rounded-xl text-xs font-bold ${
              activeTab === 'tx' ? 'bg-purple-600 text-white' : 'bg-[#0B0C10] text-gray-400'
            }`}
          >
            📊 Keuangan ({finalFilteredTxs.length})
          </button>
          <button
            onClick={() => setActiveTab('act')}
            className={`px-4 py-2 rounded-xl text-xs font-bold ${
              activeTab === 'act' ? 'bg-purple-600 text-white' : 'bg-[#0B0C10] text-gray-400'
            }`}
          >
            📅 Agenda ({userFilteredActs.length})
          </button>
          <button
            onClick={() => setActiveTab('pref')}
            className={`px-4 py-2 rounded-xl text-xs font-bold ${
              activeTab === 'pref' ? 'bg-purple-600 text-white' : 'bg-[#0B0C10] text-gray-400'
            }`}
          >
            ⚙️ Preferensi Memori ({prefs.length})
          </button>
        </div>

        {activeTab === 'tx' && (
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-[#0B0C10] border border-gray-800 text-xs text-white rounded-xl px-3 py-2"
            >
              <option value="active">Hanya Aktif</option>
              <option value="deleted">Hanya Soft-Deleted</option>
              <option value="all">Semua Status</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-[#0B0C10] border border-gray-800 text-xs text-white rounded-xl px-3 py-2"
            >
              <option value="all">Semua Tipe</option>
              <option value="income">Pemasukan (Income)</option>
              <option value="expense">Pengeluaran (Expense)</option>
            </select>

            <input
              type="text"
              placeholder="Cari Merchant, Deskripsi, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0B0C10] border border-gray-800 text-xs text-white rounded-xl px-4 py-2 w-64 focus:outline-none focus:border-purple-500"
            />
          </div>
        )}
      </div>

      {/* Main Table Content */}
      <div className="bg-[#1F2833] rounded-2xl border border-gray-800 p-6 overflow-x-auto">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-gray-400 text-xs font-semibold">Mengambil seluruh data Supabase live...</p>
          </div>
        ) : activeTab === 'tx' ? (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 font-bold">
                <th className="pb-3">ID</th>
                <th className="pb-3">PENGGUNA</th>
                <th className="pb-3">TANGGAL</th>
                <th className="pb-3">TIPE</th>
                <th className="pb-3">NOMINAL</th>
                <th className="pb-3">MERCHANT / TEMPAT</th>
                <th className="pb-3">METODE BAYAR</th>
                <th className="pb-3">DESKRIPSI</th>
                <th className="pb-3 text-right">AKSI SUPER ADMIN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {finalFilteredTxs.map((t) => (
                <tr key={t.id} className={`hover:bg-[#0B0C10]/60 transition ${t.deletedAt ? 'opacity-50 bg-rose-950/10' : ''}`}>
                  <td className="py-3 font-extrabold text-purple-400">{t.id}</td>
                  <td className="py-3 font-semibold text-white">{t.userName}</td>
                  <td className="py-3 text-gray-400">{new Date(t.date).toLocaleString('id-ID')}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-md font-black text-[10px] ${
                        t.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {t.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 font-extrabold text-white">Rp {t.amount.toLocaleString('id-ID')}</td>
                  <td className="py-3 text-gray-200 font-medium">{t.merchant}</td>
                  <td className="py-3 text-gray-400">{t.paymentMethod}</td>
                  <td className="py-3 text-gray-300 max-w-xs truncate">{t.description}</td>
                  <td className="py-3 text-right space-x-2">
                    <button
                      onClick={() => handleEditClick(t)}
                      className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold text-[11px] transition"
                    >
                      ✏️ Edit
                    </button>
                    {t.deletedAt ? (
                      <button
                        onClick={() => handleRestoreTx(t)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] transition"
                      >
                        🔄 Pulihkan
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDeleteTx(t)}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-[11px] transition"
                      >
                        🗑️ Hapus
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : activeTab === 'act' ? (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 font-bold">
                <th className="pb-3">ID AGENDA</th>
                <th className="pb-3">PENGGUNA</th>
                <th className="pb-3">WAKTU EKSEKUSI</th>
                <th className="pb-3">JUDUL AGENDA</th>
                <th className="pb-3">STATUS</th>
                <th className="pb-3">PRIORITAS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {userFilteredActs.map((a) => (
                <tr key={a.id} className="hover:bg-[#0B0C10]/60 transition">
                  <td className="py-3 font-extrabold text-cyan-400">{a.id}</td>
                  <td className="py-3 font-semibold text-white">{a.userName}</td>
                  <td className="py-3 text-gray-400">{new Date(a.date).toLocaleString('id-ID')}</td>
                  <td className="py-3 font-bold text-white">{a.title}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] ${
                        a.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {a.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 font-extrabold text-purple-400">{a.priority.toUpperCase()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 font-bold">
                <th className="pb-3">PREFERENCE KEY</th>
                <th className="pb-3">NILAI PREFERENSI</th>
                <th className="pb-3">SUMBER KONTEKS</th>
                <th className="pb-3">TERAKHIR DIPERBARUI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {prefs.map((p, i) => (
                <tr key={i} className="hover:bg-[#0B0C10]/60 transition">
                  <td className="py-3 font-bold text-purple-400">{p.key}</td>
                  <td className="py-3 font-medium text-white max-w-sm">{p.value}</td>
                  <td className="py-3 text-gray-400">{p.learnedFrom}</td>
                  <td className="py-3 text-gray-500">{new Date(p.updatedAt).toLocaleDateString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {editingTx && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1F2833] border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-extrabold text-white mb-4">✏️ Edit Transaksi ({editingTx.id})</h3>
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-bold mb-1">JUMLAH NOMINAL (RP)</label>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full bg-[#0B0C10] border border-gray-800 rounded-xl p-3 text-white font-extrabold focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-bold mb-1">MERCHANT / TEMPAT</label>
                <input
                  type="text"
                  value={newMerchant}
                  onChange={(e) => setNewMerchant(e.target.value)}
                  className="w-full bg-[#0B0C10] border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-bold mb-1">METODE PEMBAYARAN</label>
                <input
                  type="text"
                  value={newMethod}
                  onChange={(e) => setNewMethod(e.target.value)}
                  className="w-full bg-[#0B0C10] border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-bold mb-1">DESKRIPSI</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-[#0B0C10] border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-bold mb-1">TIPE TRANSAKSI</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full bg-[#0B0C10] border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="expense">Pengeluaran (Expense)</option>
                  <option value="income">Pemasukan (Income)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingTx(null)}
                className="px-4 py-2.5 bg-gray-800 text-gray-300 font-bold rounded-xl text-xs hover:bg-gray-700"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition"
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
          <div className="bg-[#1F2833] border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-extrabold text-white mb-4">+ Tambah Transaksi Baru via Admin</h3>
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-bold mb-1">PILIK PENGGUNA (OWNER)</label>
                <select
                  value={createUserId}
                  onChange={(e) => setCreateUserId(e.target.value)}
                  className="w-full bg-[#0B0C10] border border-gray-800 rounded-xl p-3 text-white"
                >
                  {usersList.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-400 font-bold mb-1">JUMLAH NOMINAL (RP)</label>
                <input
                  type="number"
                  placeholder="Contoh: 50000"
                  value={createAmount}
                  onChange={(e) => setCreateAmount(e.target.value)}
                  className="w-full bg-[#0B0C10] border border-gray-800 rounded-xl p-3 text-white font-extrabold"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-bold mb-1">MERCHANT / TEMPAT</label>
                <input
                  type="text"
                  placeholder="Contoh: Indomaret"
                  value={createMerchant}
                  onChange={(e) => setCreateMerchant(e.target.value)}
                  className="w-full bg-[#0B0C10] border border-gray-800 rounded-xl p-3 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-bold mb-1">DESKRIPSI</label>
                <input
                  type="text"
                  placeholder="Contoh: Belanja keperluan rumah"
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  className="w-full bg-[#0B0C10] border border-gray-800 rounded-xl p-3 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-bold mb-1">TIPE TRANSAKSI</label>
                <select
                  value={createType}
                  onChange={(e) => setCreateType(e.target.value)}
                  className="w-full bg-[#0B0C10] border border-gray-800 rounded-xl p-3 text-white"
                >
                  <option value="expense">Pengeluaran (Expense)</option>
                  <option value="income">Pemasukan (Income)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2.5 bg-gray-800 text-gray-300 font-bold rounded-xl text-xs hover:bg-gray-700"
              >
                Batal
              </button>
              <button
                onClick={handleCreateTx}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition"
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
