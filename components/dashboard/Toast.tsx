'use client';

import { ToastMessage } from './types';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastProps) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const bgClass =
          toast.type === 'success'
            ? 'bg-[#d2f000] text-black border-black'
            : toast.type === 'error'
            ? 'bg-[#ffdad6] text-[#93000a] border-[#ba1a1a]'
            : toast.type === 'warning'
            ? 'bg-[#ffe8a3] text-black border-black'
            : 'bg-[#008080] text-white border-black';

        return (
          <div
            key={toast.id}
            className={`p-4 border-4 ${bgClass} shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] pointer-events-auto flex items-start justify-between gap-3 transition-all animate-bounce-once`}
            role="alert"
          >
            <div className="flex items-start gap-2 flex-1">
              <span className="material-symbols-outlined text-xl">
                {toast.type === 'success'
                  ? 'check_circle'
                  : toast.type === 'error'
                  ? 'error'
                  : toast.type === 'warning'
                  ? 'warning'
                  : 'info'}
              </span>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-tight">{toast.title}</h4>
                {toast.message && <p className="font-jetbrains text-xs opacity-90 mt-0.5">{toast.message}</p>}
                {toast.undoAction && (
                  <button
                    onClick={() => {
                      toast.undoAction?.();
                      onDismiss(toast.id);
                    }}
                    className="mt-2 text-xs font-bold font-jetbrains underline uppercase bg-black text-white px-2 py-1 border border-black hover:bg-white hover:text-black transition-all"
                  >
                    ↺ Batal (Undo)
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="font-black text-xs hover:opacity-70 p-1"
              aria-label="Tutup Notifikasi"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
