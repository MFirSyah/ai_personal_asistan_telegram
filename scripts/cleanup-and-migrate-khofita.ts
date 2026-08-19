import fs from 'fs';
import path from 'path';

// Parse .env.local natively
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.substring(0, eqIdx).trim();
      let val = trimmed.substring(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.substring(1, val.length - 1);
      }
      process.env[key] = val;
    }
  });
}

import { TX_HEADERS, ACT_HEADERS, INST_HEADERS, SUB_HEADERS, computeTimeAndDayLabels, computeNecessityLevel } from '../lib/google-sheets/sync';

async function main() {
  const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  console.log('=== MEMBERSIHKAN SPREADSHEET_PASANGAN & MIGRASI KE SPREADSHEET_KHOFITA ===');

  // 1. Get or Create Spreadsheet_Khofita via Webhook
  const setupRes = await fetch(appsScriptUrl!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'create_user_sheet',
      userName: 'Khofita',
      txHeaders: TX_HEADERS,
      actHeaders: ACT_HEADERS,
      instHeaders: INST_HEADERS,
      subHeaders: SUB_HEADERS,
    }),
  });

  const setupData = await setupRes.json();
  console.log('Setup Khofita Data:', setupData);
  const fileId = setupData.fileId;

  if (!fileId) {
    console.error('Gagal mendapatkan fileId untuk Spreadsheet_Khofita');
    return;
  }

  // 2. Fetch Khofita Data from Supabase
  const userId = 'e07667b5-336e-4275-ae06-fde7b5018b3d';
  const url = `https://ai-personal-asistan-telegram.vercel.app/api/data/records?userId=${userId}&recordType=all&limit=1000`;
  const res = await fetch(url, { headers: { 'x-user-id': userId } });
  const data = await res.json();

  const txs = data.transactions || [];
  const acts = data.activities || [];
  const categories = data.categories || [];
  const catMap = new Map<string, string>();
  categories.forEach((c: any) => catMap.set(c.id, c.name));

  console.log(`📦 Mengisi ${txs.length} transaksi & ${acts.length} agenda ke Spreadsheet_Khofita...`);

  // A. Append Transactions
  for (const t of txs) {
    const catName = t.category_id ? catMap.get(t.category_id) || t.merchant || 'Lain-lain' : t.merchant || 'Lain-lain';
    const { dayType, timeBucket } = computeTimeAndDayLabels(t.occurred_at || t.created_at);
    const necessity = computeNecessityLevel(t.type || 'expense', catName, t.tags);

    const row = [
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

    await fetch(appsScriptUrl!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'append_row',
        fileId,
        sheetName: 'transactions',
        row,
      }),
    });
  }

  // B. Append Activities
  for (const a of acts) {
    const catName = a.category_id ? catMap.get(a.category_id) || 'Umum' : 'Umum';
    const { dayType, timeBucket } = computeTimeAndDayLabels(a.occurred_at || a.created_at);

    const row = [
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

    await fetch(appsScriptUrl!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'append_row',
        fileId,
        sheetName: 'activities',
        row,
      }),
    });
  }

  // 3. Delete Spreadsheet_Pasangan
  const { getDriveClient, folderId } = await import('../lib/google-sheets/client');
  const drive = getDriveClient();
  if (drive) {
    const listRes = await drive.files.list({
      q: `'${folderId}' in parents and name = 'Spreadsheet_Pasangan' and trashed = false`,
      fields: 'files(id, name)',
    });
    const dupes = listRes.data.files || [];
    for (const f of dupes) {
      console.log(`🗑️ Menghapus file duplikat: ${f.name} (ID: ${f.id})...`);
      await drive.files.delete({ fileId: f.id! });
      console.log(`✅ File ${f.name} berhasil dihapus!`);
    }
  }

  console.log(`\n🎉 SELESAI! Seluruh data Khofita telah masuk ke Spreadsheet_Khofita dan file Spreadsheet_Pasangan telah dihapus!`);
}

main().catch(console.error);
