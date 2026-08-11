import { supabaseAdmin } from '../supabase/client';

export interface ExportOptions {
  target?: 'transactions' | 'activities' | 'all' | 'categories' | 'preferences';
  startDate?: string;
  endDate?: string;
  merchant?: string;
  paymentMethod?: string;
  category?: string;
  sortByPriority?: boolean;
}

export async function generateExportFile(userId: string, options: ExportOptions = {}): Promise<{
  buffer: Buffer;
  filename: string;
  caption: string;
  rowCount: number;
}> {
  const target = options.target || 'all';

  if (target === 'activities') {
    let query = supabaseAdmin
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (options.startDate) query = query.gte('occurred_at', options.startDate);
    if (options.endDate) query = query.lte('occurred_at', options.endDate + 'T23:59:59Z');

    const { data: acts } = await query.order('occurred_at', { ascending: false });
    let activityList = acts || [];

    if (options.sortByPriority) {
      const priorityOrder: Record<string, number> = { urgent: 1, high: 2, medium: 3, low: 4 };
      activityList.sort((a, b) => (priorityOrder[a.priority || 'medium'] || 3) - (priorityOrder[b.priority || 'medium'] || 3));
    }

    const headers = ['ID', 'Judul Aktivitas', 'Kategori', 'Deskripsi', 'Status', 'Prioritas', 'Tag', 'Tanggal Execution'];
    const rows = activityList.map((a) => [
      a.id,
      `"${(a.title || '').replace(/"/g, '""')}"`,
      `"${(a.category_id || '-').replace(/"/g, '""')}"`,
      `"${(a.description || '').replace(/"/g, '""')}"`,
      a.status || 'scheduled',
      a.priority || 'medium',
      `"${(Array.isArray(a.tags) ? a.tags.join(', ') : '').replace(/"/g, '""')}"`,
      `"${(a.occurred_at ? new Date(a.occurred_at).toLocaleString('id-ID') : '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const buffer = Buffer.from(csvContent, 'utf-8');
    const filename = `Export_Aktivitas_${new Date().toISOString().split('T')[0]}.csv`;

    return {
      buffer,
      filename,
      caption: `📁 **EXPORT DATA AKTIVITAS** (${activityList.length} item berhasil di-export)`,
      rowCount: activityList.length,
    };
  }

  if (target === 'transactions') {
    let query = supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (options.startDate) query = query.gte('occurred_at', options.startDate);
    if (options.endDate) query = query.lte('occurred_at', options.endDate + 'T23:59:59Z');
    if (options.merchant) query = query.ilike('merchant', `%${options.merchant}%`);
    if (options.paymentMethod) query = query.ilike('payment_method', `%${options.paymentMethod}%`);

    const { data: txs } = await query.order('occurred_at', { ascending: false });
    const txList = txs || [];

    const headers = ['ID', 'Tanggal', 'Tipe', 'Nominal (Rp)', 'Merchant / Tempat', 'Metode Bayar', 'Deskripsi', 'Label / Tag', 'Sumber'];
    const rows = txList.map((t) => [
      t.id,
      `"${(t.occurred_at ? new Date(t.occurred_at).toLocaleString('id-ID') : '').replace(/"/g, '""')}"`,
      t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      t.amount || 0,
      `"${(t.merchant || '').replace(/"/g, '""')}"`,
      `"${(t.payment_method || '-').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${(Array.isArray(t.tags) ? t.tags.join(', ') : '').replace(/"/g, '""')}"`,
      t.source || 'chat_manual',
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const buffer = Buffer.from(csvContent, 'utf-8');
    const filename = `Export_Keuangan_${new Date().toISOString().split('T')[0]}.csv`;

    return {
      buffer,
      filename,
      caption: `📁 **EXPORT DATA KEUANGAN** (${txList.length} transaksi berhasil di-export)`,
      rowCount: txList.length,
    };
  }

  // target === 'all' — Combined Export of both Transactions and Activities
  let txQuery = supabaseAdmin.from('transactions').select('*').eq('user_id', userId).is('deleted_at', null);
  let actQuery = supabaseAdmin.from('activities').select('*').eq('user_id', userId).is('deleted_at', null);

  if (options.startDate) {
    txQuery = txQuery.gte('occurred_at', options.startDate);
    actQuery = actQuery.gte('occurred_at', options.startDate);
  }
  if (options.endDate) {
    txQuery = txQuery.lte('occurred_at', options.endDate + 'T23:59:59Z');
    actQuery = actQuery.lte('occurred_at', options.endDate + 'T23:59:59Z');
  }

  const [{ data: txs }, { data: acts }] = await Promise.all([
    txQuery.order('occurred_at', { ascending: false }),
    actQuery.order('occurred_at', { ascending: false }),
  ]);

  const txList = txs || [];
  const actList = acts || [];

  const txHeaders = ['ID Transaksi', 'Tanggal', 'Tipe', 'Nominal (Rp)', 'Merchant / Tempat', 'Metode Bayar', 'Deskripsi', 'Tag', 'Sumber'];
  const txRows = txList.map((t) => [
    t.id,
    `"${(t.occurred_at ? new Date(t.occurred_at).toLocaleString('id-ID') : '').replace(/"/g, '""')}"`,
    t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
    t.amount || 0,
    `"${(t.merchant || '').replace(/"/g, '""')}"`,
    `"${(t.payment_method || '-').replace(/"/g, '""')}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    `"${(Array.isArray(t.tags) ? t.tags.join(', ') : '').replace(/"/g, '""')}"`,
    t.source || 'chat_manual',
  ]);

  const actHeaders = ['ID Aktivitas', 'Judul Aktivitas', 'Deskripsi', 'Status', 'Prioritas', 'Tag', 'Tanggal Execution'];
  const actRows = actList.map((a) => [
    a.id,
    `"${(a.title || '').replace(/"/g, '""')}"`,
    `"${(a.description || '').replace(/"/g, '""')}"`,
    a.status || 'scheduled',
    a.priority || 'medium',
    `"${(Array.isArray(a.tags) ? a.tags.join(', ') : '').replace(/"/g, '""')}"`,
    `"${(a.occurred_at ? new Date(a.occurred_at).toLocaleString('id-ID') : '').replace(/"/g, '""')}"`,
  ]);

  const csvSections = [
    '--- SECTION: CATATAN TRANSAKSI KEUANGAN ---',
    txHeaders.join(','),
    ...txRows.map((r) => r.join(',')),
    '',
    '--- SECTION: CATATAN AGENDA & AKTIVITAS ---',
    actHeaders.join(','),
    ...actRows.map((r) => r.join(',')),
  ];

  const csvContent = '\uFEFF' + csvSections.join('\n');
  const buffer = Buffer.from(csvContent, 'utf-8');
  const filename = `Export_Lengkap_${new Date().toISOString().split('T')[0]}.csv`;
  const totalRows = txList.length + actList.length;

  return {
    buffer,
    filename,
    caption: `📁 **EXPORT DATA LENGKAP** (${txList.length} transaksi + ${actList.length} aktivitas berhasil di-export)`,
    rowCount: totalRows,
  };
}
