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

async function test() {
  const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  console.log('Testing Google Apps Script Webhook:', appsScriptUrl);

  const { TX_HEADERS, ACT_HEADERS, INST_HEADERS, SUB_HEADERS } = await import('../lib/google-sheets/sync');

  // Test create / get sheet for Firman
  console.log('1. Menguji pembuatan/pengambilan spreadsheet untuk "Firman"...');
  const res1 = await fetch(appsScriptUrl!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'create_user_sheet',
      userName: 'Firman',
      txHeaders: TX_HEADERS,
      actHeaders: ACT_HEADERS,
      instHeaders: INST_HEADERS,
      subHeaders: SUB_HEADERS,
    }),
  });

  const data1 = await res1.json();
  console.log('Hasil Respon Firman:', data1);

  // Test create / get sheet for Pasangan
  console.log('2. Menguji pembuatan/pengambilan spreadsheet untuk "Pasangan"...');
  const res2 = await fetch(appsScriptUrl!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'create_user_sheet',
      userName: 'Pasangan',
      txHeaders: TX_HEADERS,
      actHeaders: ACT_HEADERS,
      instHeaders: INST_HEADERS,
      subHeaders: SUB_HEADERS,
    }),
  });

  const data2 = await res2.json();
  console.log('Hasil Respon Pasangan:', data2);
}

test().catch(console.error);
