'use client';

import React, { useMemo } from 'react';
import { Activity } from './types';
import { parseActivitiesToGantt, GanttItem } from '@/lib/analytics/gantt';

interface ActivityGanttChartProps {
  activities: Activity[];
  plans?: any[];
}

export default function ActivityGanttChart({ activities, plans = [] }: ActivityGanttChartProps) {
  const items: GanttItem[] = useMemo(() => {
    return parseActivitiesToGantt(activities, plans);
  }, [activities, plans]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  if (items.length === 0) {
    return (
      <div className="bg-surface rounded-2xl p-6 border border-border/40 text-center">
        <p className="text-sm text-text-secondary">Belum ada data kegiatan untuk ditampilkan pada Gantt Chart.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl p-6 border border-border/40 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <span>📅</span> Gantt Chart Timeline Kegiatan & Agenda
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Visualisasi rentang waktu aktivitas harian dan agenda berdurasi multi-hari secara terstruktur.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Selesai
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Terjadwal
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> Target Plan
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item) => {
          const isCompleted = item.status === 'completed';
          const isPlan = item.id.startsWith('PLAN-');
          const isToday = item.startDate <= todayStr && item.endDate >= todayStr;

          const barColor = isCompleted
            ? 'bg-emerald-500/80 hover:bg-emerald-500 border-emerald-400'
            : isPlan
            ? 'bg-blue-500/80 hover:bg-blue-500 border-blue-400'
            : 'bg-amber-500/80 hover:bg-amber-500 border-amber-400';

          return (
            <div key={item.id} className="p-3.5 rounded-xl bg-background/50 border border-border/30 hover:border-primary/40 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface border border-border/50 text-text-secondary font-semibold">
                    {item.id}
                  </span>
                  <span className="text-sm font-bold text-text-primary">
                    {item.title}
                  </span>
                  {isToday && (
                    <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      Hari Ini
                    </span>
                  )}
                </div>
                <div className="text-xs font-mono text-text-secondary flex items-center gap-2">
                  <span>🗓️ {item.startDate} {item.durationDays > 1 ? `s/d ${item.endDate} (${item.durationDays} hari)` : ''}</span>
                  <span className="font-semibold text-text-primary">{item.progressPercent}%</span>
                </div>
              </div>

              {/* Progress Timeline Track */}
              <div className="w-full h-3 bg-surface rounded-full overflow-hidden border border-border/40 relative">
                <div
                  className={`h-full rounded-full border transition-all duration-500 ${barColor}`}
                  style={{ width: `${Math.max(8, item.progressPercent)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
