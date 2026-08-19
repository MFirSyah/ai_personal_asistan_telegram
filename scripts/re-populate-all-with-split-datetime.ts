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

async function run() {
  const { getSheetsClient } = await import('../lib/google-sheets/client');
  const { TX_HEADERS, ACT_HEADERS, INST_HEADERS, SUB_HEADERS, computeTimeAndDayLabels, computeNecessityLevel, splitDateAndTime } = await import('../lib/google-sheets/sync');
  
  const sheets = getSheetsClient();
  if (!sheets) {
    console.error('Sheets client not configured');
    return;
  }

  const users = [
    { userId: 'fc2758d3-78bb-4e22-b9f0-b3b16568b671', userName: 'Firman', fileId: '1QL8Pd1uGaDkJaFxV-1cg1u7r_CMHQZLRAIbcH7UHs3I' },
    { userId: 'e07667b5-336e-4275-ae06-fde7b5018b3d', userName: 'Khofita', fileId: '1J0qBW90QLuEcCiKNrP34QGjdHr8xf20Tvh7J_mczbpE' },
  ];

  console.log('=== MEMPERBARUI SELURUH SPREADSHEET DENGAN KOLOM TANGGAL & WAKTU TERPISAH ===\n');

  for (const u of users) {
    console.log(`⏳ Memproses ${u.userName}...`);
    // 1. Fetch data
    const url = `https://ai-personal-asistan-telegram.vercel.app/api/data/records?userId=${u.userId}&recordType=all&limit=1000`;
    const res = await fetch(url, { headers: { 'x-user-id': u.userId } });
    const data = await res.json();

    const txs = data.transactions || [];
    const acts = data.activities || [];
    const insts = data.installments || [];
    const subs = data.subscriptions || [];
    const categories = data.categories || [];
    const catMap = new Map<string, string>();
    categories.forEach((c: any) => catMap.set(c.id, c.name));

    // 2. Prepare Formatted Rows with separate Date and Time
    const txRows = (txs || []).map((t: any) => {
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

    const actRows = (acts || []).map((a: any) => {
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

    const instRows = (insts || []).map((i: any) => {
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

    const subRows = (subs || []).map((s: any) => {
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

    // Clear old range and write new clean columns
    await sheets.spreadsheets.values.clear({ spreadsheetId: u.fileId, range: 'transactions!A:Z' });
    await sheets.spreadsheets.values.clear({ spreadsheetId: u.fileId, range: 'activities!A:Z' });
    await sheets.spreadsheets.values.clear({ spreadsheetId: u.fileId, range: 'installments!A:Z' });
    await sheets.spreadsheets.values.clear({ spreadsheetId: u.fileId, range: 'subscriptions!A:Z' });

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: u.fileId,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: [
          { range: 'transactions!A1:R' + (txRows.length + 1), values: [TX_HEADERS, ...txRows] },
          { range: 'activities!A1:N' + (actRows.length + 1), values: [ACT_HEADERS, ...actRows] },
          { range: 'installments!A1:J' + Math.max(1, instRows.length + 1), values: [INST_HEADERS, ...instRows] },
          { range: 'subscriptions!A1:I' + Math.max(1, subRows.length + 1), values: [SUB_HEADERS, ...subRows] },
        ],
      },
    });

    console.log(`✅ Sukses update ${u.userName}! Transaksi: ${txRows.length}, Agenda: ${actRows.length}`);
  }

  console.log('\n🎉 SELURUH SPREADSHEET BERHASIL DIPERBARUI DENGAN FORMAT TANGGAL & WAKTU TERPISAH!');
}

run().catch(console.error);
