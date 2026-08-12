'use client';

import { Subscription, Debt, Installment } from '@/lib/features/smart-alerts';

interface InstallmentsWidgetProps {
  subscriptions: Subscription[];
  debts: Debt[];
  installments: Installment[];
}

export default function InstallmentsWidget({
  subscriptions = [],
  debts = [],
  installments = [],
}: InstallmentsWidgetProps) {
  const totalSubMonthly = subscriptions.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  const totalInstMonthly = installments.reduce((sum, i) => sum + Number(i.monthly_amount || 0), 0);
  const grandTotalMonthly = totalSubMonthly + totalInstMonthly;

  return (
    <div className="bg-white dark:bg-[#1a1c1c] brutalist-border brutalist-shadow-lg p-5 font-jetbrains text-xs space-y-4">
      <div className="flex justify-between items-center border-b-4 border-black pb-3">
        <div>
          <h2 className="font-black text-base md:text-lg uppercase tracking-tight text-black dark:text-white">
            💳 Cicilan & Tagihan Rutin Bulanan
          </h2>
          <p className="text-[11px] text-black/60 dark:text-white/60 font-bold">
            Beban Tetap Jatuh Tempo Setiap Bulan
          </p>
        </div>
        <div className="text-right">
          <span className="bg-[#ba1a1a] text-white px-2.5 py-1 font-bold text-xs border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            Total: Rp {grandTotalMonthly.toLocaleString('id-ID')}/bln
          </span>
        </div>
      </div>

      {/* Grid 2 Column for Installments & Subscriptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Section 1: Cicilan Active */}
        <div className="border-2 border-black p-3 bg-[#f9f9f9] dark:bg-[#2a2d2d] space-y-2">
          <div className="flex justify-between items-center border-b border-black pb-1.5 font-bold uppercase text-black dark:text-white">
            <span>📦 Cicilan Berjalan ({installments.length})</span>
            <span className="text-[#008080] dark:text-[#20b2aa]">
              Rp {totalInstMonthly.toLocaleString('id-ID')}
            </span>
          </div>

          {installments.length === 0 ? (
            <p className="text-black/60 dark:text-white/60 font-bold py-2 text-center text-[11px]">
              Belum ada catatan cicilan aktif.
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {installments.map((inst) => (
                <div
                  key={inst.id}
                  className="bg-white dark:bg-[#1a1c1c] border border-black p-2 flex justify-between items-center"
                >
                  <div>
                    <span className="font-bold text-black dark:text-white block">{inst.item_name}</span>
                    <span className="text-[10px] text-black/70 dark:text-white/70">
                      Tenor: Sisa {inst.remaining_months} dari {inst.total_months} Bulan | Jatuh Tempo Tgl {inst.due_day}
                    </span>
                  </div>
                  <span className="font-black text-sm text-[#ba1a1a] dark:text-[#ff6b6b]">
                    Rp {Number(inst.monthly_amount).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Subscriptions & Tagihan Rutin */}
        <div className="border-2 border-black p-3 bg-[#f9f9f9] dark:bg-[#2a2d2d] space-y-2">
          <div className="flex justify-between items-center border-b border-black pb-1.5 font-bold uppercase text-black dark:text-white">
            <span>🔄 Langganan Rutin ({subscriptions.length})</span>
            <span className="text-[#536000] dark:text-[#d2f000]">
              Rp {totalSubMonthly.toLocaleString('id-ID')}
            </span>
          </div>

          {subscriptions.length === 0 ? (
            <p className="text-black/60 dark:text-white/60 font-bold py-2 text-center text-[11px]">
              Belum ada catatan langganan rutin.
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-white dark:bg-[#1a1c1c] border border-black p-2 flex justify-between items-center"
                >
                  <div>
                    <span className="font-bold text-black dark:text-white block">{sub.service_name}</span>
                    <span className="text-[10px] text-black/70 dark:text-white/70">
                      Jatuh Tempo: {sub.next_billing_date} ({sub.billing_cycle || 'Bulanan'})
                    </span>
                  </div>
                  <span className="font-black text-sm text-black dark:text-white">
                    Rp {Number(sub.amount).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Debts summary banner */}
      {debts.length > 0 && (
        <div className="p-2.5 bg-[#d2f000] text-black border-2 border-black flex justify-between items-center font-bold">
          <span>📋 Catatan Utang / Piutang Belum Lunas: {debts.length} Item</span>
          <span className="text-xs">
            Total: Rp {debts.reduce((sum, d) => sum + Number(d.amount || 0), 0).toLocaleString('id-ID')}
          </span>
        </div>
      )}
    </div>
  );
}
