import { getDriveClient, getSheetsClient, folderId, isGoogleConfigured } from './client';
import { supabaseAdmin } from '../supabase/client';

export const TX_HEADERS = [
  'id',
  'user_id',
  'occurred_date',
  'occurred_time',
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
  'created_date',
  'created_time',
];

export const ACT_HEADERS = [
  'id',
  'user_id',
  'occurred_date',
  'occurred_time',
  'title',
  'description',
  'status',
  'priority',
  'category_name',
  'day_type',
  'time_bucket',
  'tags',
  'created_date',
  'created_time',
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
  'created_date',
  'created_time',
];

export const SUB_HEADERS = [
  'id',
  'user_id',
  'service_name',
  'amount',
  'billing_cycle',
  'next_billing_date',
  'category',
  'created_date',
  'created_time',
];

// Helper to cleanly split ISO timestamp into separated Date (DD/MM/YYYY) and Time (HH:mm) in WIB
export function splitDateAndTime(input?: string | Date | null): { date: string; time: string } {
  const d = input ? new Date(input) : new Date();
  if (isNaN(d.getTime())) {
    return { date: '', time: '' };
  }
  const dateStr = d.toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' });
  const timeStr = d.toLocaleTimeString('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).replace('.', ':');

  return {
    date: dateStr,
    time: timeStr,
  };
}

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

const DEFAULT_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyUK_vCfX8oZIw20CmYU-H7wEwWfEDGIx2m844FX31qwOdsh-ED3OetrqzjLOeMQBNQkw/exec';

/**
 * Finds or creates a Google Spreadsheet file inside the user's dedicated GDrive Folder.
 */
export async function getOrCreateUserSpreadsheet(userId: string, userName: string): Promise<string | null> {
  let safeName = userName || 'User';
  if (userId === 'fc2758d3-78bb-4e22-b9f0-b3b16568b671' || safeName.toLowerCase().includes('firman')) {
    safeName = 'Firman';
  } else if (userId === 'e07667b5-336e-4275-ae06-fde7b5018b3d' || safeName.toLowerCase().includes('khofita')) {
    safeName = 'Khofita';
  }

  const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL || DEFAULT_APPS_SCRIPT_URL;

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
  try {
    let userName = 'User';
    if (userId === 'fc2758d3-78bb-4e22-b9f0-b3b16568b671') {
      userName = 'Firman';
    } else if (userId === 'e07667b5-336e-4275-ae06-fde7b5018b3d') {
      userName = 'Khofita';
    } else {
      const { data: user } = await supabaseAdmin.from('users').select('id, name').eq('id', userId).maybeSingle();
      if (user?.name) userName = user.name;
    }

    const spreadsheetId = await getOrCreateUserSpreadsheet(userId, userName);
    if (!spreadsheetId) {
      return { ok: false, error: 'Could not create or access Google Spreadsheet' };
    }

    const sheets = getSheetsClient();
    if (!sheets) {
      return { ok: false, error: 'Google Sheets client unavailable' };
    }

    // Fetch all tables
    const [
      { data: txs },
      { data: acts },
      { data: insts },
      { data: subs },
      { data: categories },
    ] = await Promise.all([
      supabaseAdmin.from('transactions').select('*').eq('user_id', userId).order('occurred_at', { ascending: false }),
      supabaseAdmin.from('activities').select('*').eq('user_id', userId).order('occurred_at', { ascending: false }),
      supabaseAdmin.from('installments').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabaseAdmin.from('subscriptions').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabaseAdmin.from('categories').select('id, name'),
    ]);

    const catMap = new Map<string, string>();
    (categories || []).forEach((c) => catMap.set(c.id, c.name));

    // Prepare Transaction Rows
    const txRows = (txs || []).map((t) => {
      const catName = t.category_id ? catMap.get(t.category_id) || t.merchant || 'Lain-lain' : t.merchant || 'Lain-lain';
      const { dayType, timeBucket } = computeTimeAndDayLabels(t.occurred_at || t.created_at);
      const necessity = computeNecessityLevel(t.type || 'expense', catName, t.tags);
      const occurred = splitDateAndTime(t.occurred_at || t.created_at);
      const created = splitDateAndTime(t.created_at);

      return [
        t.id,
        t.user_id,
        occurred.date,
        occurred.time,
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
        created.date,
        created.time,
      ];
    });

    // Prepare Activity Rows
    const actRows = (acts || []).map((a) => {
      const catName = a.category_id ? catMap.get(a.category_id) || 'Umum' : 'Umum';
      const { dayType, timeBucket } = computeTimeAndDayLabels(a.occurred_at || a.created_at);
      const occurred = splitDateAndTime(a.occurred_at || a.created_at);
      const created = splitDateAndTime(a.created_at);

      return [
        a.id,
        a.user_id,
        occurred.date,
        occurred.time,
        a.title || '',
        a.description || '',
        a.status || 'scheduled',
        a.priority || 'medium',
        catName,
        dayType,
        timeBucket,
        Array.isArray(a.tags) ? a.tags.join(', ') : '',
        created.date,
        created.time,
      ];
    });

    // Prepare Installment Rows
    const instRows = (insts || []).map((i) => {
      const created = splitDateAndTime(i.created_at);
      return [
        i.id,
        i.user_id,
        i.item_name || '',
        Number(i.monthly_amount || 0),
        Number(i.total_months || 0),
        Number(i.remaining_months || 0),
        Number(i.due_day || 1),
        i.status || 'active',
        created.date,
        created.time,
      ];
    });

    // Prepare Subscription Rows
    const subRows = (subs || []).map((s) => {
      const created = splitDateAndTime(s.created_at);
      return [
        s.id,
        s.user_id,
        s.service_name || '',
        Number(s.amount || 0),
        s.billing_cycle || 'monthly',
        s.next_billing_date || '',
        s.category || 'Tagihan',
        created.date,
        created.time,
      ];
    });

    // Batch Clear & Overwrite
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: [
          { range: 'transactions!A1:R' + Math.max(2, txRows.length + 1), values: [TX_HEADERS, ...txRows] },
          { range: 'activities!A1:N' + Math.max(2, actRows.length + 1), values: [ACT_HEADERS, ...actRows] },
          { range: 'installments!A1:J' + Math.max(2, instRows.length + 1), values: [INST_HEADERS, ...instRows] },
          { range: 'subscriptions!A1:I' + Math.max(2, subRows.length + 1), values: [SUB_HEADERS, ...subRows] },
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
    let userName = 'User';
    if (userId === 'fc2758d3-78bb-4e22-b9f0-b3b16568b671') {
      userName = 'Firman';
    } else if (userId === 'e07667b5-336e-4275-ae06-fde7b5018b3d') {
      userName = 'Khofita';
    } else {
      const { data: user } = await supabaseAdmin.from('users').select('id, name').eq('id', userId).maybeSingle();
      if (user?.name) userName = user.name;
    }

    const spreadsheetId = await getOrCreateUserSpreadsheet(userId, userName);
    if (!spreadsheetId) {
      console.warn('[Google Sheets Sync] No spreadsheet ID found for', userName);
      return;
    }

    const { dayType, timeBucket } = computeTimeAndDayLabels(tx.occurred_at || tx.created_at);
    const catName = tx.category || tx.merchant || 'Lain-lain';
    const necessity = computeNecessityLevel(tx.type || 'expense', catName, tx.tags);
    const occurred = splitDateAndTime(tx.occurred_at || tx.created_at);
    const created = splitDateAndTime(tx.created_at || new Date());

    const row = [
      tx.id || `TX-${Date.now().toString(36).toUpperCase()}`,
      userId,
      occurred.date,
      occurred.time,
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
      created.date,
      created.time,
    ];

    const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL || DEFAULT_APPS_SCRIPT_URL;
    const res = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'append_row',
        fileId: spreadsheetId,
        sheetName: 'transactions',
        row,
      }),
    });
    const resData = await res.json();
    console.log('[Google Sheets Sync] Realtime append transaction result:', resData);
  } catch (err) {
    console.error('[Google Sheets Sync] Realtime append transaction failed:', err);
  }
}

/**
 * Appends 1 new activity row in real-time.
 */
export async function appendActivityRealtime(userId: string, act: any) {
  try {
    let userName = 'User';
    if (userId === 'fc2758d3-78bb-4e22-b9f0-b3b16568b671') {
      userName = 'Firman';
    } else if (userId === 'e07667b5-336e-4275-ae06-fde7b5018b3d') {
      userName = 'Khofita';
    } else {
      const { data: user } = await supabaseAdmin.from('users').select('id, name').eq('id', userId).maybeSingle();
      if (user?.name) userName = user.name;
    }

    const spreadsheetId = await getOrCreateUserSpreadsheet(userId, userName);
    if (!spreadsheetId) {
      console.warn('[Google Sheets Sync] No spreadsheet ID found for', userName);
      return;
    }

    const { dayType, timeBucket } = computeTimeAndDayLabels(act.occurred_at || act.created_at);
    const catName = act.category || 'Umum';
    const occurred = splitDateAndTime(act.occurred_at || act.created_at);
    const created = splitDateAndTime(act.created_at || new Date());

    const row = [
      act.id || `ACT-${Date.now().toString(36).toUpperCase()}`,
      userId,
      occurred.date,
      occurred.time,
      act.title || '',
      act.description || '',
      act.status || 'scheduled',
      act.priority || 'medium',
      catName,
      dayType,
      timeBucket,
      Array.isArray(act.tags) ? act.tags.join(', ') : '',
      created.date,
      created.time,
    ];

    const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL || DEFAULT_APPS_SCRIPT_URL;
    const res = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'append_row',
        fileId: spreadsheetId,
        sheetName: 'activities',
        row,
      }),
    });
    const resData = await res.json();
    console.log('[Google Sheets Sync] Realtime append activity result:', resData);
  } catch (err) {
    console.error('[Google Sheets Sync] Realtime append activity failed:', err);
  }
}
