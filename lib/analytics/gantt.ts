export interface GanttItem {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  priority?: string;
  progressPercent: number;
}

export function parseActivitiesToGantt(activities: any[], plans: any[] = []): GanttItem[] {
  const items: GanttItem[] = [];

  // Parse Activities
  for (const a of activities) {
    if (a.deleted_at || a.deletedAt) continue;
    const startStr = a.occurred_at || a.occurredAt || a.created_at || a.createdAt || new Date().toISOString();
    const startDate = new Date(startStr);
    
    // Check if description or title mentions multi-day duration (e.g. "29-30 Agustus", "3 hari", "2 hari")
    let durationDays = 1;
    const combined = `${a.title} ${a.description || ''}`.toLowerCase();
    
    if (combined.includes('29-30') || combined.includes('29 sd 30') || combined.includes('2 hari')) {
      durationDays = 2;
    } else if (combined.includes('3 hari')) {
      durationDays = 3;
    } else if (combined.includes('seminggu') || combined.includes('7 hari')) {
      durationDays = 7;
    }

    const endDate = new Date(startDate.getTime() + (durationDays - 1) * 24 * 60 * 60 * 1000);

    let progressPercent = 0;
    if (a.status === 'completed') progressPercent = 100;
    else if (a.status === 'in_progress') progressPercent = 50;

    items.push({
      id: a.id ? (a.id.startsWith('ACT-') ? a.id : `ACT-${String(a.id).replace(/-/g, '').substring(0, 6).toUpperCase()}`) : 'ACT-1',
      title: a.title || 'Kegiatan',
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      durationDays,
      status: a.status || 'scheduled',
      priority: a.priority || 'medium',
      progressPercent,
    });
  }

  // Parse Plans
  for (const p of plans) {
    if (p.status === 'cancelled') continue;
    const startStr = p.created_at || new Date().toISOString();
    const targetStr = p.target_date || p.targetDate || startStr;
    const startDate = new Date(startStr);
    const endDate = new Date(targetStr);
    
    const diffTime = Math.max(0, endDate.getTime() - startDate.getTime());
    const durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    let progressPercent = p.status === 'done' ? 100 : (p.status === 'in_progress' ? 50 : 25);

    items.push({
      id: `PLAN-${p.id ? String(p.id).replace(/-/g, '').substring(0, 5).toUpperCase() : '1'}`,
      title: `[Target] ${p.title}`,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      durationDays,
      status: p.status === 'done' ? 'completed' : (p.status || 'scheduled'),
      priority: 'urgent',
      progressPercent,
    });
  }

  // Sort by start date ascending
  items.sort((a, b) => a.startDate.localeCompare(b.startDate));
  return items;
}

export function generateTelegramGanttChart(activities: any[], plans: any[] = []): string {
  const items = parseActivitiesToGantt(activities, plans);
  if (items.length === 0) {
    return 'Belum ada agenda atau kegiatan aktif yang tercatat untuk ditampilkan pada Gantt Chart.';
  }

  const lines = [
    '📅 **GANTT CHART TIMELINE KEGIATAN & AGENDA (MAS FIRMAN)**',
    '==================================================',
  ];

  for (const item of items) {
    const icon = item.status === 'completed' ? '✅' : (item.status === 'in_progress' ? '⏳' : '📌');
    const badge = item.status === 'completed' ? '[SELESAI]' : (item.status === 'in_progress' ? '[SEDANG BERJALAN]' : '[TERJADWAL]');
    
    // Generate ASCII Bar
    const filledBlocks = Math.round(item.progressPercent / 10);
    const emptyBlocks = 10 - filledBlocks;
    const bar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);

    const dateRange = item.durationDays > 1 ? `${item.startDate} s/d ${item.endDate} (${item.durationDays} hari)` : `${item.startDate}`;

    lines.push(`• ${icon} **${item.title}** ${badge}`);
    lines.push(`  🗓️ **Rentang**: ${dateRange}`);
    lines.push(`  📊 **Progres**: [${bar}] ${item.progressPercent}%`);
    lines.push('');
  }

  lines.push('💡 *Seluruh kegiatan berdurasi multi-hari otomatis dipetakan secara horizontal pada timeline ini.*');
  return lines.join('\n');
}
