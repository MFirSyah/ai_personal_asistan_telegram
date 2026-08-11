'use client';

interface QuickViewModalProps {
  record: any;
  onClose: () => void;
}

export default function QuickViewModal({ record, onClose }: QuickViewModalProps) {
  if (!record) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quickview-title"
    >
      <div className="bg-white dark:bg-[#1a1c1c] brutalist-border brutalist-shadow-lg p-6 max-w-md w-full font-jetbrains text-xs">
        <div className="flex justify-between items-center border-b-4 border-black pb-3 mb-4">
          <h3 id="quickview-title" className="font-bold text-base uppercase text-black dark:text-white">
            Detail Rekaman #{record.id || 'N/A'}
          </h3>
          <button onClick={onClose} className="font-bold text-lg p-1 hover:text-[#ba1a1a]" aria-label="Tutup Modal">
            ✕
          </button>
        </div>

        <div className="space-y-3 text-black dark:text-white">
          <p>
            <strong>Judul / Item:</strong> {record.title || record.merchant || record.description || 'Tidak ada judul'}
          </p>
          {record.amount !== undefined && (
            <p>
              <strong>Nominal:</strong> Rp {Number(record.amount).toLocaleString('id-ID')}
            </p>
          )}
          {record.type && (
            <p>
              <strong>Tipe:</strong> <span className="uppercase font-bold">{record.type}</span>
            </p>
          )}
          {record.insight && (
            <p className="bg-[#f9f9f9] dark:bg-[#2a2d2d] p-3 border-2 border-black">
              <strong>Insight Model:</strong> {record.insight}
            </p>
          )}
          {record.category && (
            <p>
              <strong>Kategori Model:</strong> {record.category}
            </p>
          )}
          {record.occurred_at && (
            <p>
              <strong>Waktu Kejadian:</strong> {new Date(record.occurred_at).toLocaleString('id-ID')}
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-black text-white px-4 py-2 font-bold uppercase text-xs hover:bg-[#008080] transition-colors cursor-pointer"
          >
            Tutup (ESC)
          </button>
        </div>
      </div>
    </div>
  );
}
