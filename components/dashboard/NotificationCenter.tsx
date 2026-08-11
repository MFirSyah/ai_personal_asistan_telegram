'use client';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBriefing: () => void;
  urgentActs: string[];
}

export default function NotificationCenter({
  isOpen,
  onClose,
  onOpenBriefing,
  urgentActs,
}: NotificationCenterProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-modal-title"
    >
      <div className="bg-white dark:bg-[#1a1c1c] brutalist-border brutalist-shadow-lg p-6 max-w-lg w-full font-jetbrains text-xs">
        <div className="flex justify-between items-center border-b-4 border-black pb-3 mb-4">
          <h3 id="notification-modal-title" className="font-bold text-xl uppercase flex items-center gap-2 text-black dark:text-white">
            <span className="material-symbols-outlined text-[#008080]">notifications</span> Notification Center
          </h3>
          <button onClick={onClose} className="font-bold text-lg p-1 hover:text-[#ba1a1a]" aria-label="Tutup Modal">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="p-4 border-2 border-black bg-[#d2f000]/30 text-black">
            <p className="font-bold uppercase text-sm mb-1">☀️ Morning Briefing Hari Ini</p>
            <p className="text-black/80 mb-3">Briefing pagi yang disusun khusus untukmu telah tersedia.</p>
            <button
              onClick={() => {
                onOpenBriefing();
                onClose();
              }}
              className="bg-black text-white px-3 py-2 font-bold uppercase hover:bg-[#008080] transition-all cursor-pointer"
            >
              📖 Buka & Baca Briefing
            </button>
          </div>

          {urgentActs.length > 0 ? (
            <div className="p-4 border-2 border-black bg-white dark:bg-[#2a2d2d] text-black dark:text-white">
              <p className="font-bold uppercase text-sm mb-1 text-[#ba1a1a]">🚨 Peringatan Agenda Urgent</p>
              <ul className="text-black/80 dark:text-white/80 space-y-1 list-disc list-inside">
                {urgentActs.map((act, i) => (
                  <li key={i}>{act}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="p-4 border-2 border-black bg-white dark:bg-[#2a2d2d] text-black dark:text-white">
              <p className="font-bold uppercase text-sm mb-1 text-[#008080]">✅ Tidak Ada Agenda Urgent</p>
              <p className="text-black/60 dark:text-white/60">Semua tugas berjalan lancar, tidak ada yang mendesak.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
