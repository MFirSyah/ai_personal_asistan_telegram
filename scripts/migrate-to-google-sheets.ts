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

async function migrateUser(userId: string, userName: string) {
  const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  console.log(`\n=============================================================`);
  console.log(`⏳ Memproses Migrasi Data: ${userName} (ID: ${userId})`);

  // 1. Fetch data from live Supabase API
  const url = `https://ai-personal-asistan-telegram.vercel.app/api/data/records?userId=${userId}&recordType=all&limit=1000`;
  const res = await fetch(url, { headers: { 'x-user-id': userId } });
  const data = await res.json();

  if (!data.ok) {
    console.error(`❌ Gagal mengambil data untuk ${userName}:`, data.error);
    return;
  }

  const txs = data.transactions || [];
  const acts = data.activities || [];
  const insts = data.installments || [];
  const subs = data.subscriptions || [];
  const categories = data.categories || [];

  console.log(`📦 Data Ditemukan: ${txs.length} Transaksi, ${acts.length} Agenda, ${insts.length} Cicilan, ${subs.length} Langganan`);

  // 2. Create / Retrieve Spreadsheet via Apps Script Webhook
  const setupRes = await fetch(appsScriptUrl!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'create_user_sheet',
      userName,
      txHeaders: TX_HEADERS,
      actHeaders: ACT_HEADERS,
      instHeaders: INST_HEADERS,
      subHeaders: SUB_HEADERS,
    }),
  });

  const setupData = await setupRes.json();
  if (!setupData.ok || !setupData.fileId) {
    console.error(`❌ Gagal inisialisasi spreadsheet untuk ${userName}:`, setupData);
    return;
  }

  const fileId = setupData.fileId;
  console.log(`📑 Spreadsheet Terhubung: ID ${fileId}`);

  // 3. Prepare Formatted Rows with All DB Columns + Analytical Labels
  const catMap = new Map<string, string>();
  categories.forEach((c: any) => catMap.set(c.id, c.name));

  // A. Append Transactions
  console.log(`💳 Mengunggah ${txs.length} transaksi...`);
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
  console.log(`📅 Mengunggah ${acts.length} aktivitas/agenda...`);
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

  // C. Append Installments
  for (const i of insts) {
    const row = [
      i.id,
      i.user_id,
      i.item_name || '',
      Number(i.monthly_amount || 0),
      Number(i.total_months || 0),
      Number(i.remaining_months || 0),
      Number(i.due_day || 1),
      i.status || 'active',
      i.created_at ? new Date(i.created_at).toLocaleString('id-ID') : '',
    ];

    await fetch(appsScriptUrl!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'append_row',
        fileId,
        sheetName: 'installments',
        row,
      }),
    });
  }

  // D. Append Subscriptions
  for (const s of subs) {
    const row = [
      s.id,
      s.user_id,
      s.service_name || '',
      Number(s.amount || 0),
      s.billing_cycle || 'monthly',
      s.next_billing_date || '',
      s.category || 'Tagihan',
      s.created_at ? new Date(s.created_at).toLocaleString('id-ID') : '',
    ];

    await fetch(appsScriptUrl!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'append_row',
        fileId,
        sheetName: 'subscriptions',
        row,
      }),
    });
  }

  console.log(`✅ SUKSES! Seluruh data ${userName} berhasil dimasukkan ke Google Spreadsheet!`);
  console.log(`🔗 Link Spreadsheet: https://docs.google.com/spreadsheets/d/${fileId}`);
}

async function main() {
  console.log('🚀 MEMULAI MIGRASI DATA LENGKAP KE GOOGLE SPREADSHEET 🚀');
  await migrateUser('fc2758d3-78bb-4e22-b9f0-b3b16568b671', 'Firman');
  await migrateUser('e07667b5-336e-4275-ae06-fde7b5018b3d', 'Khofita');
  console.log('\n🎉 SELURUH DATA USER BERHASIL DI-MIGRASI KE GOOGLE DRIVE!');
}

main().catch(console.error);
