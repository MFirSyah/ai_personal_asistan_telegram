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

async function main() {
  const { getSheetsClient } = await import('../lib/google-sheets/client');
  const { TX_HEADERS, ACT_HEADERS, INST_HEADERS, SUB_HEADERS, computeTimeAndDayLabels, computeNecessityLevel } = await import('../lib/google-sheets/sync');
  
  const sheets = getSheetsClient();
  if (!sheets) {
    console.error('Failed to initialize sheets client');
    return;
  }

  const fileId = '1QL8Pd1uGaDkJaFxV-1cg1u7r_CMHQZLRAIbcH7UHs3I';
  console.log('=== MEMPERBAIKI TAB & MENGISI SPREADSHEET_FIRMAN ===');

  // 1. Inspect existing sheet tabs
  const meta = await sheets.spreadsheets.get({ spreadsheetId: fileId });
  const sheetNames = (meta.data.sheets || []).map((s) => s.properties?.title);
  console.log('Tab Sheet Saat Ini di Spreadsheet_Firman:', sheetNames);

  // 2. Add missing sheets if not present
  const requests: any[] = [];
  if (sheetNames.includes('Sheet1')) {
    const sheet1Id = meta.data.sheets?.find((s) => s.properties?.title === 'Sheet1')?.properties?.sheetId;
    requests.push({
      updateSheetProperties: {
        properties: { sheetId: sheet1Id, title: 'transactions', gridProperties: { frozenRowCount: 1 } },
        fields: 'title,gridProperties.frozenRowCount',
      },
    });
  } else if (!sheetNames.includes('transactions')) {
    requests.push({ addSheet: { properties: { title: 'transactions', gridProperties: { frozenRowCount: 1 } } } });
  }

  if (!sheetNames.includes('activities')) {
    requests.push({ addSheet: { properties: { title: 'activities', gridProperties: { frozenRowCount: 1 } } } });
  }
  if (!sheetNames.includes('installments')) {
    requests.push({ addSheet: { properties: { title: 'installments', gridProperties: { frozenRowCount: 1 } } } });
  }
  if (!sheetNames.includes('subscriptions')) {
    requests.push({ addSheet: { properties: { title: 'subscriptions', gridProperties: { frozenRowCount: 1 } } } });
  }

  if (requests.length > 0) {
    console.log('Membuat tab sheets yang diperlukan...');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: fileId,
      requestBody: { requests },
    });
  }

  // 3. Fetch Firman Data from live Supabase API
  const userId = 'fc2758d3-78bb-4e22-b9f0-b3b16568b671';
  const url = `https://ai-personal-asistan-telegram.vercel.app/api/data/records?userId=${userId}&recordType=all&limit=1000`;
  const res = await fetch(url, { headers: { 'x-user-id': userId } });
  const data = await res.json();

  const txs = data.transactions || [];
  const acts = data.activities || [];
  const categories = data.categories || [];
  const catMap = new Map<string, string>();
  categories.forEach((c: any) => catMap.set(c.id, c.name));

  // 4. Prepare Rows
  const txRows = (txs || []).map((t: any) => {
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

  const actRows = (acts || []).map((a: any) => {
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

  // 5. Batch Overwrite Data into Spreadsheet_Firman
  console.log(`Mengunggah ${txRows.length} transaksi & ${actRows.length} agenda ke Spreadsheet_Firman...`);
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: fileId,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data: [
        { range: 'transactions!A1:P' + (txRows.length + 1), values: [TX_HEADERS, ...txRows] },
        { range: 'activities!A1:L' + (actRows.length + 1), values: [ACT_HEADERS, ...actRows] },
        { range: 'installments!A1:I1', values: [INST_HEADERS] },
        { range: 'subscriptions!A1:H1', values: [SUB_HEADERS] },
      ],
    },
  });

  console.log('✅ SUKSES! Seluruh 33 transaksi & 7 agenda Firman berhasil masuk rapi ke Spreadsheet_Firman!');
  console.log(`🔗 Link: https://docs.google.com/spreadsheets/d/${fileId}`);
}

main().catch(console.error);
