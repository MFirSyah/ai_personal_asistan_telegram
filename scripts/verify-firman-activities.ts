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
    spreadsheetId: '1QL8Pd1uGaDkJaFxV-1cg1u7r_CMHQZLRAIbcH7UHs3I',
    range: 'activities!A1:G10',
  });

  console.log('✅ Verifikasi Data Activities Spreadsheet_Firman:');
  console.log(res.data.values);
}

run();
