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
  const sheets = getSheetsClient();
  if (!sheets) return;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '1J0qBW90QLuEcCiKNrP34QGjdHr8xf20Tvh7J_mczbpE',
    range: 'transactions!A1:E10',
  });

  console.log('✅ Verifikasi Data Spreadsheet_Khofita:');
  console.log(res.data.values);
}

run();
