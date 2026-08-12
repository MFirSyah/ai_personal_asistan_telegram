'use client';

import { useMemo } from 'react';
import { Transaction, Category } from './types';

interface BudgetProgressWidgetProps {
  transactions: Transaction[];
  categories: Category[];
}

// Default monthly target budget per category (in IDR)
const DEFAULT_CATEGORY_BUDGETS: Record<string, number> = {
  'Makanan': 2000000,
  'Makan & Minum': 2000000,
  'Transportasi': 800000,
  'Bensin': 500000,
  'Belanja': 1500000,
  'Kebutuhan Harian': 1200000,
  'Hiburan': 500000,
  'Tagihan': 1000000,
  'Kesehatan': 500000,
};

export default function BudgetProgressWidget({
  transactions = [],
  categories = [],
}: BudgetProgressWidgetProps) {
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  // Aggregate current month expense by category name
  const categorySpending = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const spending: Record<string, number> = {};

    transactions.forEach((t) => {
      if (t.type !== 'expense') return;
      const d = new Date(t.occurred_at || t.created_at || '');
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        const catName = t.category_id ? (categoryMap.get(t.category_id) || 'Lain-lain') : 'Lain-lain';
        spending[catName] = (spending[catName] || 0) + Number(t.amount || 0);
      }
    });

    return spending;
  }, [transactions, categoryMap]);

  // List of active budget targets
  const budgetList = useMemo(() => {
    const keys = new Set([...Object.keys(DEFAULT_CATEGORY_BUDGETS), ...Object.keys(categorySpending)]);
    return Array.from(keys).map((catName) => {
      const spent = categorySpending[catName] || 0;
      const target = DEFAULT_CATEGORY_BUDGETS[catName] || 1000000;
      const percentage = Math.min(100, Math.round((spent / target) * 100));
      const isWarning = percentage >= 80 && percentage < 100;
      const isExceeded = percentage >= 100;

      return {
        catName,
        spent,
        target,
        percentage,
        isWarning,
        isExceeded,
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [categorySpending]);

  return (
    <div className="bg-white dark:bg-[#1a1c1c] brutalist-border brutalist-shadow-lg p-5 font-jetbrains text-xs space-y-4">
      <div className="flex justify-between items-center border-b-4 border-black pb-3">
        <div>
          <h2 className="font-black text-base md:text-lg uppercase tracking-tight text-black dark:text-white">
            🎯 Target Budget Bulanan Per Kategori
          </h2>
          <p className="text-[11px] text-black/60 dark:text-white/60 font-bold">
            Monitor Batas Maksimum Pengeluaran Bulan Ini
          </p>
        </div>
        <span className="bg-[#008080] text-white px-2.5 py-1 font-bold text-xs border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {budgetList.filter(b => b.spent > 0).length} Kategori Terpakai
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {budgetList.slice(0, 6).map((b) => (
          <div
            key={b.catName}
            className={`border-2 border-black p-3 space-y-2 transition-all ${
              b.isExceeded
                ? 'bg-[#ba1a1a]/10 dark:bg-[#ba1a1a]/20 border-[#ba1a1a]'
                : b.isWarning
                ? 'bg-[#ff8c00]/10 dark:bg-[#ff8c00]/20'
                : 'bg-[#f9f9f9] dark:bg-[#2a2d2d]'
            }`}
          >
            <div className="flex justify-between items-center font-bold">
              <span className="text-black dark:text-white uppercase">{b.catName}</span>
              {b.isExceeded ? (
                <span className="bg-[#ba1a1a] text-white px-1.5 py-0.5 text-[9px] uppercase font-bold border border-black animate-pulse">
                  🚨 Over Budget ({b.percentage}%)
                </span>
              ) : b.isWarning ? (
                <span className="bg-[#ff8c00] text-black px-1.5 py-0.5 text-[9px] uppercase font-bold border border-black">
                  ⚠️ Hampir Batas ({b.percentage}%)
                </span>
              ) : (
                <span className="text-black/70 dark:text-white/70 text-[10px]">
                  {b.percentage}% Terpakai
                </span>
              )}
            </div>

            {/* Progress Bar Container */}
            <div className="w-full bg-white dark:bg-black border border-black h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  b.isExceeded
                    ? 'bg-[#ba1a1a]'
                    : b.isWarning
                    ? 'bg-[#ff8c00]'
                    : 'bg-[#008080]'
                }`}
                style={{ width: `${b.percentage}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[10px] font-bold text-black/80 dark:text-white/80">
              <span>Terpakai: Rp {b.spent.toLocaleString('id-ID')}</span>
              <span>Target: Rp {b.target.toLocaleString('id-ID')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
