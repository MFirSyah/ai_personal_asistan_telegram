export interface GanttItem {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  priority?: string;
  progressPercent: number;
  isMultiDay: boolean;
}

export interface GanttOptions {
  showCompleted?: boolean;
  onlyMultiDay?: boolean;
}

export function parseActivitiesToGantt(activities: any[], plans: any[] = [], options: GanttOptions = {}): { active: GanttItem[]; completed: GanttItem[] } {
  const activeItems: GanttItem[] = [];
  const completedItems: GanttItem[] = [];

  // Parse Activities
  for (const a of activities) {
    if (a.deleted_at || a.deletedAt) continue;
    const startStr = a.occurred_at || a.occurredAt || a.created_at || a.createdAt || new Date().toISOString();
    const startDate = new Date(startStr);
    
    // Check if description or title mentions multi-day duration (e.g. "29-30 Agustus", "3 hari", "2 hari")
    let durationDays = 1;
    let isMultiDay = false;
    const combined = `${a.title} ${a.description || ''}`.toLowerCase();
    
    if (combined.includes('29-30') || combined.includes('29 sd 30') || combined.includes('2 hari')) {
      durationDays = 2;
      isMultiDay = true;
    } else if (combined.includes('3 hari')) {
      durationDays = 3;
      isMultiDay = true;
    } else if (combined.includes('seminggu') || combined.includes('7 hari')) {
      durationDays = 7;
      isMultiDay = true;
    }

    if (options.onlyMultiDay && !isMultiDay) {
      continue;
    }

    const endDate = new Date(startDate.getTime() + (durationDays - 1) * 24 * 60 * 60 * 1000);

    let progressPercent = 0;
    const isCompleted = a.status === 'completed';
    if (isCompleted) progressPercent = 100;
    else if (a.status === 'in_progress') progressPercent = 50;

    const item: GanttItem = {
      id: a.id ? (a.id.startsWith('ACT-') ? a.id : `ACT-${String(a.id).replace(/-/g, '').substring(0, 6).toUpperCase()}`) : 'ACT-1',
      title: a.title || 'Kegiatan',
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      durationDays,
      status: a.status || 'scheduled',
      priority: a.priority || 'medium',
      progressPercent,
      isMultiDay,
    };

    if (isCompleted) {
      completedItems.push(item);
    } else {
      activeItems.push(item);
    }
  }

  // Parse Plans (Strategic targets are inherently roadmaps)
  for (const p of plans) {
    if (p.status === 'cancelled') continue;
    const startStr = p.created_at || new Date().toISOString();
    const targetStr = p.target_date || p.targetDate || startStr;
    const startDate = new Date(startStr);
    const endDate = new Date(targetStr);
    
    const diffTime = Math.max(0, endDate.getTime() - startDate.getTime());
    const durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const isCompleted = p.status === 'done';
    let progressPercent = isCompleted ? 100 : (p.status === 'in_progress' ? 50 : 25);

    const item: GanttItem = {
      id: `PLAN-${p.id ? String(p.id).replace(/-/g, '').substring(0, 5).toUpperCase() : '1'}`,
      title: `[Target] ${p.title}`,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      durationDays,
      status: isCompleted ? 'completed' : (p.status || 'scheduled'),
      priority: 'urgent',
      progressPercent,
      isMultiDay: durationDays > 1,
    };

    if (isCompleted) {
      completedItems.push(item);
    } else {
      activeItems.push(item);
    }
  }

  // Sort each group by start date ascending
  activeItems.sort((a, b) => a.startDate.localeCompare(b.startDate));
  completedItems.sort((a, b) => a.startDate.localeCompare(b.startDate));

  return { active: activeItems, completed: completedItems };
}

export function generateTelegramGanttChart(activities: any[], plans: any[] = [], options: GanttOptions = {}): string {
  const { active, completed } = parseActivitiesToGantt(activities, plans, options);

  if (active.length === 0 && completed.length === 0) {
    return 'Belum ada agenda atau target kegiatan yang tercatat untuk ditampilkan pada Gantt Chart.';
  }

  const lines: string[] = [];

  // 1. ACTIVE ROADMAP & AGENDA (Primary Focus)
  lines.push('📅 **GANTT CHART TIMELINE & ROADMAP AKTIF (MAS FIRMAN)**');
  lines.push('==================================================');

  if (active.length === 0) {
    lines.push('• ✨ *Tidak ada agenda aktif yang sedang berjalan. Seluruh target utama telah sukses diselesaikan!*');
    lines.push('');
  } else {
    for (const item of active) {
      const icon = item.status === 'in_progress' ? '⏳' : '📌';
      const badge = item.status === 'in_progress' ? '[SEDANG BERJALAN]' : '[TERJADWAL]';
      const typeBadge = item.isMultiDay ? '🗺️ Multi-Hari' : '⏱️ 1 Hari';

      // Generate ASCII Progress Bar
      const filledBlocks = Math.round(item.progressPercent / 10);
      const emptyBlocks = 10 - filledBlocks;
      const bar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);

      const dateRange = item.durationDays > 1 ? `${item.startDate} s/d ${item.endDate} (${item.durationDays} hari)` : `${item.startDate}`;

      lines.push(`• ${icon} **${item.title}** ${badge} (${typeBadge})`);
      lines.push(`  🗓️ **Rentang**: ${dateRange}`);
      lines.push(`  📊 **Progres**: [${bar}] ${item.progressPercent}%`);
      lines.push('');
    }
  }

  // 2. COMPLETED / HISTORICAL ARCHIVE (Separated, not cluttering the active roadmap)
  if (completed.length > 0) {
    lines.push('📁 **RIWAYAT AGENDA SELESAI (HISTORI ARSIP)**');
    lines.push('--------------------------------------------------');
    for (const item of completed) {
      const dateRange = item.durationDays > 1 ? `${item.startDate} s/d ${item.endDate}` : `${item.startDate}`;
      lines.push(`• ✅ **${item.title}** [SELESAI 100%] — 🗓️ ${dateRange}`);
    }
    lines.push('');
  }

  lines.push('💡 *Catatan: Agenda multi-hari dipetakan horizontal sebagai roadmap, sedangkan riwayat kegiatan selesai (seperti Trip Dieng) diarsipkan tersendiri agar timeline aktif tetap fokus.*');
  return lines.join('\n');
}

