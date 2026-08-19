import { getDriveClient, getSheetsClient, folderId, isGoogleConfigured } from './client';
import { supabaseAdmin } from '../supabase/client';

export const TX_HEADERS = [
  'id',
  'user_id',
  'occurred_at',
  'type',
  'amount',
  'merchant',
  'description',
  'payment_method',
  'category_name',
  'subcategory_name',
  'necessity_level',
  'day_type',
  'time_bucket',
  'tags',
  'source',
  'created_at',
];

export const ACT_HEADERS = [
  'id',
  'user_id',
  'occurred_at',
  'title',
  'description',
  'status',
  'priority',
  'category_name',
  'day_type',
  'time_bucket',
  'tags',
  'created_at',
];

export const INST_HEADERS = [
  'id',
  'user_id',
  'item_name',
  'monthly_amount',
  'total_months',
  'remaining_months',
  'due_day',
  'status',
  'created_at',
];

export const SUB_HEADERS = [
  'id',
  'user_id',
  'service_name',
  'amount',
  'billing_cycle',
  'next_billing_date',
  'category',
  'created_at',
];

// Helper to determine time bucket & day type
export function computeTimeAndDayLabels(dateStr?: string | null) {
  const d = dateStr ? new Date(dateStr) : new Date();
  const wibHour = (d.getUTCHours() + 7) % 24; // WIB UTC+7
  const dayOfWeek = d.getDay(); // 0 = Sunday, 6 = Saturday

  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const dayType = isWeekend ? 'Weekend (Akhir Pekan)' : 'Weekday (Hari Kerja)';

  let timeBucket = 'Malam (19:00 - 04:59)';
  if (wibHour >= 5 && wibHour < 11) {
    timeBucket = 'Pagi (05:00 - 10:59)';
  } else if (wibHour >= 11 && wibHour < 15) {
    timeBucket = 'Siang (11:00 - 14:59)';
  } else if (wibHour >= 15 && wibHour < 19) {
    timeBucket = 'Sore (15:00 - 18:59)';
  }

  return { dayType, timeBucket };
}

// Helper to compute necessity level
export function computeNecessityLevel(type: string, categoryName: string = '', tags: string[] = []): string {
  if (type === 'income') return 'Income (Pemasukan)';
  const cat = (categoryName + ' ' + (tags || []).join(' ')).toLowerCase();

  if (
    cat.includes('makan') ||
    cat.includes('sembako') ||
    cat.includes('bensin') ||
    cat.includes('listrik') ||
    cat.includes('air') ||
    cat.includes('wifi') ||
    cat.includes('obat') ||
    cat.includes('kos') ||
    cat.includes('kontrakan') ||
    cat.includes('pulsa') ||
    cat.includes('kesehatan')
  ) {
    return 'Needs (Kebutuhan Pokok)';
  }

  if (cat.includes('investasi') || cat.includes('tabungan') || cat.includes('reksadana') || cat.includes('emas') || cat.includes('saham')) {
    return 'Savings / Investasi';
  }

  return 'Wants (Keinginan / Gaya Hidup)';
}

/**
 * Finds or creates a Google Spreadsheet file inside the user's dedicated GDrive Folder.
 */
export async function getOrCreateUserSpreadsheet(userId: string, userName: string): Promise<string | null> {
  const safeName = userName || 'User';
  const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

  // 1. If Google Apps Script Webhook is configured, use it for zero-quota restriction creation
  if (appsScriptUrl) {
    try {
      const res = await fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_user_sheet',
          userName: safeName,
          txHeaders: TX_HEADERS,
          actHeaders: ACT_HEADERS,
          instHeaders: INST_HEADERS,
          subHeaders: SUB_HEADERS,
        }),
      });
      const data = await res.json();
      if (data.ok && data.fileId) {
        return data.fileId;
      }
    } catch (webhookErr) {
      console.warn('[Google Sheets Sync] Webhook creation warning:', webhookErr);
    }
  }

  if (!isGoogleConfigured) {
    console.warn('[Google Sheets Sync] Google API credentials are not configured.');
    return null;
  }

  const drive = getDriveClient();
  const sheets = getSheetsClient();
  if (!drive || !sheets) return null;

  try {
    const spreadsheetTitle = `Spreadsheet_${safeName}`;

    // 2. Search if file already exists in folder
    const searchRes = await drive.files.list({
      q: `'${folderId}' in parents and name = '${spreadsheetTitle}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    if (searchRes.data.files && searchRes.data.files.length > 0) {
      return searchRes.data.files[0].id!;
    }

    return null;
  } catch (err: any) {
    console.error('[Google Sheets Sync] Error getting spreadsheet:', err?.message || err);
    return null;
  }
}

/**
 * Migrates & Syncs ALL existing data for a specific user to their Google Spreadsheet.
 */
export async function syncFullUserDataToGoogleSheet(userId: string): Promise<{ ok: boolean; fileId?: string; error?: string }> {
  if (!isGoogleConfigured) return { ok: false, error: 'Google credentials not configured' };

  try {
    const { data: user } = await supabaseAdmin.from('users').select('id, name').eq('id', userId).single();
    if (!user) return { ok: false, error: 'User not found in Supabase' };

    const spreadsheetId = await getOrCreateUserSpreadsheet(user.id, user.name || 'User');
    if (!spreadsheetId) return { ok: false, error: 'Failed to create or access Google Spreadsheet' };

    const sheets = getSheetsClient();
    if (!sheets) return { ok: false, error: 'Sheets client unavailable' };

    // Fetch all user records from Supabase
    const [
      { data: txs },
      { data: acts },
      { data: insts },
      { data: subs },
      { data: categories },
    ] = await Promise.all([
      supabaseAdmin.from('transactions').select('*').eq('user_id', userId).is('deleted_at', null).order('occurred_at', { ascending: true }),
      supabaseAdmin.from('activities').select('*').eq('user_id', userId).is('deleted_at', null).order('occurred_at', { ascending: true }),
      supabaseAdmin.from('installments').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
      supabaseAdmin.from('subscriptions').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
      supabaseAdmin.from('categories').select('id, name'),
    ]);

    const catMap = new Map<string, string>();
    (categories || []).forEach((c) => catMap.set(c.id, c.name));

    // Prepare Transaction Rows
    const txRows = (txs || []).map((t) => {
      const catName = t.category_id ? catMap.get(t.category_id) || t.merchant || 'Lain-lain' : t.merchant || 'Lain-lain';
      const { dayType, timeBucket } = computeTimeAndDayLabels(t.occurred_at || t.created_at);
      const necessity = computeNecessityLevel(t.type || 'expense', catName, t.tags);

      return [
        t.id,
        t.user_id,
        t.occurred_at ? new Date(t.occurred_at).toLocaleString('id-ID') : '',
        t.type || 'expense',
        Number(t.amount || 0),
        t.merchant || '',
        t.description || '',
        t.payment_method || 'Cash',
        catName,
        t.tags?.[0] || catName,
        necessity,
        dayType,
        timeBucket,
        Array.isArray(t.tags) ? t.tags.join(', ') : '',
        t.source || 'chat_manual',
        t.created_at ? new Date(t.created_at).toLocaleString('id-ID') : '',
      ];
    });

    // Prepare Activity Rows
    const actRows = (acts || []).map((a) => {
      const catName = a.category_id ? catMap.get(a.category_id) || 'Umum' : 'Umum';
      const { dayType, timeBucket } = computeTimeAndDayLabels(a.occurred_at || a.created_at);

      return [
        a.id,
        a.user_id,
        a.occurred_at ? new Date(a.occurred_at).toLocaleString('id-ID') : '',
        a.title || '',
        a.description || '',
        a.status || 'scheduled',
        a.priority || 'medium',
        catName,
        dayType,
        timeBucket,
        Array.isArray(a.tags) ? a.tags.join(', ') : '',
        a.created_at ? new Date(a.created_at).toLocaleString('id-ID') : '',
      ];
    });

    // Prepare Installment Rows
    const instRows = (insts || []).map((i) => [
      i.id,
      i.user_id,
      i.item_name || '',
      Number(i.monthly_amount || 0),
      Number(i.total_months || 0),
      Number(i.remaining_months || 0),
      Number(i.due_day || 1),
      i.status || 'active',
      i.created_at ? new Date(i.created_at).toLocaleString('id-ID') : '',
    ]);

    // Prepare Subscription Rows
    const subRows = (subs || []).map((s) => [
      s.id,
      s.user_id,
      s.service_name || '',
      Number(s.amount || 0),
      s.billing_cycle || 'monthly',
      s.next_billing_date || '',
      s.category || 'Tagihan',
      s.created_at ? new Date(s.created_at).toLocaleString('id-ID') : '',
    ]);

    // Batch Clear & Overwrite
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: [
          { range: 'transactions!A1:P' + Math.max(2, txRows.length + 1), values: [TX_HEADERS, ...txRows] },
          { range: 'activities!A1:L' + Math.max(2, actRows.length + 1), values: [ACT_HEADERS, ...actRows] },
          { range: 'installments!A1:I' + Math.max(2, instRows.length + 1), values: [INST_HEADERS, ...instRows] },
          { range: 'subscriptions!A1:H' + Math.max(2, subRows.length + 1), values: [SUB_HEADERS, ...subRows] },
        ],
      },
    });

    return { ok: true, fileId: spreadsheetId };
  } catch (err: any) {
    console.error(`[Google Sheets Sync] Sync error for user ${userId}:`, err?.message || err);
    return { ok: false, error: err?.message || 'Sync failed' };
  }
}

/**
 * Appends 1 new transaction row in real-time.
 */
export async function appendTransactionRealtime(userId: string, tx: any) {
  try {
    const { data: user } = await supabaseAdmin.from('users').select('id, name').eq('id', userId).maybeSingle();
    const userName = user?.name || 'User';

    const spreadsheetId = await getOrCreateUserSpreadsheet(userId, userName);
    if (!spreadsheetId) return;

    const { dayType, timeBucket } = computeTimeAndDayLabels(tx.occurred_at || tx.created_at);
    const catName = tx.category || tx.merchant || 'Lain-lain';
    const necessity = computeNecessityLevel(tx.type || 'expense', catName, tx.tags);

    const row = [
      tx.id || `TX-${Date.now().toString(36).toUpperCase()}`,
      userId,
      tx.occurred_at ? new Date(tx.occurred_at).toLocaleString('id-ID') : new Date().toLocaleString('id-ID'),
      tx.type || 'expense',
      Number(tx.amount || 0),
      tx.merchant || '',
      tx.description || '',
      tx.payment_method || 'Cash',
      catName,
      tx.tags?.[0] || catName,
      necessity,
      dayType,
      timeBucket,
      Array.isArray(tx.tags) ? tx.tags.join(', ') : '',
      tx.source || 'chat_manual',
      new Date().toLocaleString('id-ID'),
    ];

    const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
    if (appsScriptUrl) {
      await fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'append_row',
          fileId: spreadsheetId,
          sheetName: 'transactions',
          row,
        }),
      });
      return;
    }

    const sheets = getSheetsClient();
    if (sheets) {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'transactions!A:P',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [row] },
      });
    }
  } catch (err) {
    console.error('[Google Sheets Sync] Realtime append transaction failed:', err);
  }
}

/**
 * Appends 1 new activity row in real-time.
 */
export async function appendActivityRealtime(userId: string, act: any) {
  try {
    const { data: user } = await supabaseAdmin.from('users').select('id, name').eq('id', userId).maybeSingle();
    const userName = user?.name || 'User';

    const spreadsheetId = await getOrCreateUserSpreadsheet(userId, userName);
    if (!spreadsheetId) return;

    const { dayType, timeBucket } = computeTimeAndDayLabels(act.occurred_at || act.created_at);
    const catName = act.category || 'Umum';

    const row = [
      act.id || `ACT-${Date.now().toString(36).toUpperCase()}`,
      userId,
      act.occurred_at ? new Date(act.occurred_at).toLocaleString('id-ID') : new Date().toLocaleString('id-ID'),
      act.title || '',
      act.description || '',
      act.status || 'scheduled',
      act.priority || 'medium',
      catName,
      dayType,
      timeBucket,
      Array.isArray(act.tags) ? act.tags.join(', ') : '',
      new Date().toLocaleString('id-ID'),
    ];

    const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
    if (appsScriptUrl) {
      await fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'append_row',
          fileId: spreadsheetId,
          sheetName: 'activities',
          row,
        }),
      });
      return;
    }

    const sheets = getSheetsClient();
    if (sheets) {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'activities!A:L',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [row] },
      });
    }
  } catch (err) {
    console.error('[Google Sheets Sync] Realtime append activity failed:', err);
  }
}
