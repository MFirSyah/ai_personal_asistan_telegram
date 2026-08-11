'use client';

import { useState, useEffect } from 'react';
import { Transaction, Activity, Category } from './types';

interface AddEditRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (type: 'transaction' | 'activity', isEdit: boolean, id: string | null, data: any) => Promise<void>;
  categories: Category[];
  editingRecord?: { record: Transaction | Activity; type: 'transaction' | 'activity' } | null;
}

export default function AddEditRecordModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  editingRecord,
}: AddEditRecordModalProps) {
  const isEdit = Boolean(editingRecord);
  const [recordType, setRecordType] = useState<'transaction' | 'activity'>('transaction');

  const [formData, setFormData] = useState({
    titleOrMerchant: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category_id: '',
    description: '',
    occurred_at: new Date().toISOString().slice(0, 16),
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    status: 'scheduled' as 'scheduled' | 'in_progress' | 'completed' | 'cancelled',
  });

  useEffect(() => {
    if (editingRecord) {
      const { record, type } = editingRecord;
      setRecordType(type);

      const d = record.occurred_at ? new Date(record.occurred_at) : new Date();
      const localIsoDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

      if (type === 'transaction') {
        const tx = record as Transaction;
        setFormData({
          titleOrMerchant: tx.merchant || '',
          amount: String(tx.amount || ''),
          type: tx.type || 'expense',
          category_id: tx.category_id || '',
          description: tx.description || '',
          occurred_at: localIsoDate,
          priority: 'medium',
          status: 'scheduled',
        });
      } else {
        const act = record as Activity;
        setFormData({
          titleOrMerchant: act.title || '',
          amount: '',
          type: 'expense',
          category_id: '',
          description: act.description || '',
          occurred_at: localIsoDate,
          priority: act.priority || 'medium',
          status: act.status || 'scheduled',
        });
      }
    } else {
      setRecordType('transaction');
      const now = new Date();
      const localIsoDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setFormData({
        titleOrMerchant: '',
        amount: '',
        type: 'expense',
        category_id: '',
        description: '',
        occurred_at: localIsoDate,
        priority: 'medium',
        status: 'scheduled',
      });
    }
  }, [editingRecord, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isoOccurredAt = new Date(formData.occurred_at).toISOString();

    const payload: any = {
      occurred_at: isoOccurredAt,
      description: formData.description,
    };

    if (recordType === 'transaction') {
      payload.merchant = formData.titleOrMerchant;
      payload.amount = parseFloat(formData.amount) || 0;
      payload.type = formData.type;
      payload.category_id = formData.category_id || null;
    } else {
      payload.title = formData.titleOrMerchant;
      payload.priority = formData.priority;
      payload.status = formData.status;
    }

    await onSubmit(recordType, isEdit, editingRecord?.record?.id || null, payload);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white dark:bg-[#1a1c1c] brutalist-border brutalist-shadow-lg p-6 max-w-md w-full relative max-h-[90vh] overflow-y-auto font-jetbrains text-xs">
        <div className="flex justify-between items-center border-b-4 border-black pb-3 mb-4">
          <h3 id="modal-title" className="font-bold text-lg uppercase tracking-tight text-black dark:text-white">
            {isEdit ? '✏️ Edit Catatan Record' : '➕ Tambah Catatan Baru'}
          </h3>
          <button
            onClick={onClose}
            className="font-bold text-base hover:text-[#ba1a1a] p-1"
            aria-label="Tutup Modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Record Type Selector (Disabled in Edit Mode) */}
          <div>
            <label className="block font-bold uppercase mb-1 text-black dark:text-white">Tipe Data</label>
            <select
              disabled={isEdit}
              value={recordType}
              onChange={(e) => setRecordType(e.target.value as any)}
              className="w-full bg-[#f9f9f9] dark:bg-[#2a2d2d] text-black dark:text-white thin-border p-2.5 font-jetbrains text-xs disabled:opacity-60"
            >
              <option value="transaction">Transaksi Keuangan</option>
              <option value="activity">Agenda / Aktivitas</option>
            </select>
          </div>

          {/* Title or Merchant */}
          <div>
            <label className="block font-bold uppercase mb-1 text-black dark:text-white">
              {recordType === 'transaction' ? 'Nama Toko / Tempat / Merchant' : 'Judul Agenda / Tugas'}
            </label>
            <input
              type="text"
              required
              placeholder={recordType === 'transaction' ? 'Misal: Superindo, Kopi Janji Jiwa' : 'Misal: Meeting Projek Selesai'}
              value={formData.titleOrMerchant}
              onChange={(e) => setFormData({ ...formData, titleOrMerchant: e.target.value })}
              className="w-full bg-[#f9f9f9] dark:bg-[#2a2d2d] text-black dark:text-white thin-border p-2.5 font-jetbrains text-xs"
            />
          </div>

          {/* Amount and Type for Transactions */}
          {recordType === 'transaction' && (
            <>
              <div>
                <label className="block font-bold uppercase mb-1 text-black dark:text-white">Jenis Transaksi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'expense' })}
                    className={`p-2 border-2 border-black font-bold uppercase ${
                      formData.type === 'expense' ? 'bg-[#ba1a1a] text-white' : 'bg-[#e2e2e2] dark:bg-[#2a2d2d] text-black dark:text-white'
                    }`}
                  >
                    💸 Pengeluaran
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'income' })}
                    className={`p-2 border-2 border-black font-bold uppercase ${
                      formData.type === 'income' ? 'bg-[#008080] text-white' : 'bg-[#e2e2e2] dark:bg-[#2a2d2d] text-black dark:text-white'
                    }`}
                  >
                    💰 Pemasukan
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase mb-1 text-black dark:text-white">Nominal (Rp)</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="50000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full bg-[#f9f9f9] dark:bg-[#2a2d2d] text-black dark:text-white thin-border p-2.5 font-jetbrains text-xs"
                />
              </div>

              <div>
                <label className="block font-bold uppercase mb-1 text-black dark:text-white">Kategori Transaksi</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full bg-[#f9f9f9] dark:bg-[#2a2d2d] text-black dark:text-white thin-border p-2.5 font-jetbrains text-xs"
                >
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Priority & Status for Activities */}
          {recordType === 'activity' && (
            <>
              <div>
                <label className="block font-bold uppercase mb-1 text-black dark:text-white">Tingkat Prioritas</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full bg-[#f9f9f9] dark:bg-[#2a2d2d] text-black dark:text-white thin-border p-2.5 font-jetbrains text-xs"
                >
                  <option value="low">Low (Rendah)</option>
                  <option value="medium">Medium (Sedang)</option>
                  <option value="high">High (Tinggi)</option>
                  <option value="urgent">Urgent (Mendesak 🚨)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase mb-1 text-black dark:text-white">Status Agenda</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-[#f9f9f9] dark:bg-[#2a2d2d] text-black dark:text-white thin-border p-2.5 font-jetbrains text-xs"
                >
                  <option value="scheduled">Scheduled (Terjadwal)</option>
                  <option value="in_progress">In Progress (Sedang Berjalan)</option>
                  <option value="completed">Completed (Selesai ✅)</option>
                  <option value="cancelled">Cancelled (Dibatalkan)</option>
                </select>
              </div>
            </>
          )}

          {/* Date & Time Picker */}
          <div>
            <label className="block font-bold uppercase mb-1 text-black dark:text-white">Waktu Wajib Kejadian</label>
            <input
              type="datetime-local"
              required
              value={formData.occurred_at}
              onChange={(e) => setFormData({ ...formData, occurred_at: e.target.value })}
              className="w-full bg-[#f9f9f9] dark:bg-[#2a2d2d] text-black dark:text-white thin-border p-2.5 font-jetbrains text-xs"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold uppercase mb-1 text-black dark:text-white">Deskripsi Tambahan</label>
            <textarea
              rows={2}
              placeholder="Catatan tambahan..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#f9f9f9] dark:bg-[#2a2d2d] text-black dark:text-white thin-border p-2.5 font-jetbrains text-xs resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#e2e2e2] text-black brutalist-border p-2.5 font-bold uppercase active:translate-y-0.5 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#008080] text-white brutalist-border p-2.5 font-bold uppercase active:translate-y-0.5 cursor-pointer hover:bg-black transition-colors"
            >
              {isEdit ? 'Simpan Perubahan' : 'Simpan Data Baru'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
