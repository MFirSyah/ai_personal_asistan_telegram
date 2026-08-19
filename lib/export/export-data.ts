import { supabaseAdmin } from '../supabase/client';

export interface ExportOptions {
  target?: 'transactions' | 'activities' | 'all' | 'categories' | 'preferences';
  format?: 'csv' | 'sql';
  startDate?: string;
  endDate?: string;
  merchant?: string;
  paymentMethod?: string;
  category?: string;
  sortByPriority?: boolean;
}

function escapeSqlString(str: any): string {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

export async function generateExportFile(userId: string, options: ExportOptions = {}): Promise<{
  buffer: Buffer;
  filename: string;
  caption: string;
  rowCount: number;
  format: 'csv' | 'sql';
}> {
  const target = options.target || 'all';
  const format = options.format || 'csv';

  // 1. Fetch user information for personalization and file naming
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('name, telegram_id, email')
    .eq('id', userId)
    .maybeSingle();

  const userName = user?.name || 'User';
  const safeUserName = userName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  const nowWibStr = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

  // -------------------------------------------------------------
  // SQL BACKUP FORMAT GENERATOR
  // -------------------------------------------------------------
  if (format === 'sql') {
    const [
      { data: txs },
      { data: acts },
      { data: prefs },
      { data: insts },
      { data: subs },
      { data: debts },
    ] = await Promise.all([
      supabaseAdmin.from('transactions').select('*').eq('user_id', userId).is('deleted_at', null).order('occurred_at', { ascending: true }),
      supabaseAdmin.from('activities').select('*').eq('user_id', userId).is('deleted_at', null).order('occurred_at', { ascending: true }),
      supabaseAdmin.from('user_preferences').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
      supabaseAdmin.from('installments').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
      supabaseAdmin.from('subscriptions').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
      supabaseAdmin.from('debts').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
    ]);

    const txList = txs || [];
    const actList = acts || [];
    const prefList = prefs || [];
    const instList = insts || [];
    const subList = subs || [];
    const debtList = debts || [];

    const sqlLines: string[] = [
      `-- =============================================================`,
      `-- SUPABASE DATABASE BACKUP EXPORT (PER-USER ISOLATION)`,
      `-- Pemilik Akun   : ${userName} (Telegram ID: ${user?.telegram_id || 'N/A'})`,
      `-- User UUID      : ${userId}`,
      `-- Tanggal Export : ${nowWibStr} WIB`,
      `-- Total Records  : ${txList.length} Transaksi, ${actList.length} Aktivitas, ${prefList.length} Preferensi`,
      `-- =============================================================`,
      ``,
      `BEGIN;`,
      ``,
    ];

    // Transactions Table SQL Inserts
    if (txList.length > 0) {
      sqlLines.push(`-- 1. TRANSAKSI KEUANGAN (${txList.length} baris)`);
      txList.forEach((t) => {
        const cols = ['id', 'user_id', 'amount', 'type', 'merchant', 'description', 'payment_method', 'source', 'occurred_at', 'created_at'];
        const vals = [
          escapeSqlString(t.id),
          escapeSqlString(userId),
          Number(t.amount || 0),
          escapeSqlString(t.type || 'expense'),
          escapeSqlString(t.merchant),
          escapeSqlString(t.description),
          escapeSqlString(t.payment_method),
          escapeSqlString(t.source || 'chat_manual'),
          escapeSqlString(t.occurred_at || t.created_at),
          escapeSqlString(t.created_at),
        ];
        sqlLines.push(`INSERT INTO public.transactions (${cols.join(', ')}) VALUES (${vals.join(', ')}) ON CONFLICT (id) DO NOTHING;`);
      });
      sqlLines.push(``);
    }

    // Activities Table SQL Inserts
    if (actList.length > 0) {
      sqlLines.push(`-- 2. AGENDA & AKTIVITAS (${actList.length} baris)`);
      actList.forEach((a) => {
        const cols = ['id', 'user_id', 'title', 'description', 'status', 'priority', 'occurred_at', 'created_at'];
        const vals = [
          escapeSqlString(a.id),
          escapeSqlString(userId),
          escapeSqlString(a.title),
          escapeSqlString(a.description),
          escapeSqlString(a.status || 'scheduled'),
          escapeSqlString(a.priority || 'medium'),
          escapeSqlString(a.occurred_at || a.created_at),
          escapeSqlString(a.created_at),
        ];
        sqlLines.push(`INSERT INTO public.activities (${cols.join(', ')}) VALUES (${vals.join(', ')}) ON CONFLICT (id) DO NOTHING;`);
      });
      sqlLines.push(``);
    }

    // Preferences Table SQL Inserts
    if (prefList.length > 0) {
      sqlLines.push(`-- 3. PREFERENSI & MEMORI AI (${prefList.length} baris)`);
      prefList.forEach((p) => {
        const cols = ['user_id', 'key', 'value', 'learned_from'];
        const vals = [
          escapeSqlString(userId),
          escapeSqlString(p.key),
          escapeSqlString(p.value),
          escapeSqlString(p.learned_from),
        ];
        sqlLines.push(`INSERT INTO public.user_preferences (${cols.join(', ')}) VALUES (${vals.join(', ')}) ON CONFLICT (user_id, key) DO UPDATE SET value = EXCLUDED.value;`);
      });
      sqlLines.push(``);
    }

    // Installments & Subscriptions
    if (instList.length > 0) {
      sqlLines.push(`-- 4. CICILAN BULANAN (${instList.length} baris)`);
      instList.forEach((i) => {
        sqlLines.push(`INSERT INTO public.installments (id, user_id, item_name, monthly_amount, total_months, remaining_months, due_day, status) VALUES (${escapeSqlString(i.id)}, ${escapeSqlString(userId)}, ${escapeSqlString(i.item_name)}, ${Number(i.monthly_amount)}, ${Number(i.total_months)}, ${Number(i.remaining_months)}, ${Number(i.due_day)}, ${escapeSqlString(i.status || 'active')}) ON CONFLICT (id) DO NOTHING;`);
      });
      sqlLines.push(``);
    }

    if (subList.length > 0) {
      sqlLines.push(`-- 5. LANGGANAN RUTIN (${subList.length} baris)`);
      subList.forEach((s) => {
        sqlLines.push(`INSERT INTO public.subscriptions (id, user_id, service_name, amount, billing_cycle, next_billing_date) VALUES (${escapeSqlString(s.id)}, ${escapeSqlString(userId)}, ${escapeSqlString(s.service_name)}, ${Number(s.amount)}, ${escapeSqlString(s.billing_cycle || 'monthly')}, ${escapeSqlString(s.next_billing_date)}) ON CONFLICT (id) DO NOTHING;`);
      });
      sqlLines.push(``);
    }

    sqlLines.push(`COMMIT;`);
    sqlLines.push(`-- Backup SQL selesai dibuat dengan aman.`);

    const sqlContent = sqlLines.join('\n');
    const buffer = Buffer.from(sqlContent, 'utf-8');
    const filename = `Backup_${safeUserName}_Database_${dateStr}.sql`;
    const totalRows = txList.length + actList.length + prefList.length;

    return {
      buffer,
      filename,
      caption: `💾 **BACKUP DATABASE SQL (${userName})**\n\n• **Pemilik**: ${userName}\n• **Total Data**: ${txList.length} transaksi + ${actList.length} agenda\n• **Format**: Skrip PostgreSQL (.sql) siap pakai.`,
      rowCount: totalRows,
      format: 'sql',
    };
  }

  // -------------------------------------------------------------
  // CSV FORMAT GENERATOR (WITH WATERMARK HEADER)
  // -------------------------------------------------------------
  const csvWatermark = [
    `# LAPORAN DATA EKSPOR PERSONAL`,
    `# Pemilik Akun   : ${userName} (Telegram ID: ${user?.telegram_id || 'N/A'})`,
    `# User UUID      : ${userId}`,
    `# Tanggal Ekspor : ${nowWibStr} WIB`,
    `# -------------------------------------------------------------`,
  ];

  if (target === 'activities') {
    let query = supabaseAdmin
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (options.startDate) query = query.gte('occurred_at', options.startDate);
    if (options.endDate) query = query.lte('occurred_at', options.endDate + 'T23:59:59Z');

    const { data: acts } = await query.order('occurred_at', { ascending: false });
    const activityList = acts || [];

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

    const csvContent = '\uFEFF' + [...csvWatermark, headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const buffer = Buffer.from(csvContent, 'utf-8');
    const filename = `Export_${safeUserName}_Aktivitas_${dateStr}.csv`;

    return {
      buffer,
      filename,
      caption: `📁 **EXPORT DATA AKTIVITAS (${userName})**\nSebanyak **${activityList.length} agenda** berhasil di-export ke CSV.`,
      rowCount: activityList.length,
      format: 'csv',
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

    const csvContent = '\uFEFF' + [...csvWatermark, headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const buffer = Buffer.from(csvContent, 'utf-8');
    const filename = `Export_${safeUserName}_Keuangan_${dateStr}.csv`;

    return {
      buffer,
      filename,
      caption: `📁 **EXPORT DATA KEUANGAN (${userName})**\nSebanyak **${txList.length} transaksi** berhasil di-export ke CSV.`,
      rowCount: txList.length,
      format: 'csv',
    };
  }

  // target === 'all' — Combined Export
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
    ...csvWatermark,
    '',
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
  const filename = `Export_${safeUserName}_Lengkap_${dateStr}.csv`;
  const totalRows = txList.length + actList.length;

  return {
    buffer,
    filename,
    caption: `📁 **EXPORT DATA LENGKAP (${userName})**\n\n• **Transaksi**: ${txList.length} item\n• **Agenda**: ${actList.length} item`,
    rowCount: totalRows,
    format: 'csv',
  };
}
