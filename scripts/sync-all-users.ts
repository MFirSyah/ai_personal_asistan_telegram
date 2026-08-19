import fs from 'fs';
import path from 'path';

// Parse .env.local natively
try {
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
} catch (e) {
  console.error('Error reading .env.local:', e);
}

async function main() {
  const { supabaseAdmin } = await import('../lib/supabase/client');
  const { syncFullUserDataToGoogleSheet } = await import('../lib/google-sheets/sync');

  console.log('=== MEMULAI SINKRONISASI DATA SELURUH USER KE GOOGLE SPREADSHEET ===');

  const { data: users, error } = await supabaseAdmin.from('users').select('id, name, telegram_id');
  if (error || !users || users.length === 0) {
    console.error('Tidak ada user ditemukan:', error);
    return;
  }

  console.log(`Ditemukan ${users.length} user di Supabase.`);

  for (const user of users) {
    console.log(`\n⏳ Menyinkronkan data untuk user: ${user.name || 'User'} (ID: ${user.id})...`);
    const res = await syncFullUserDataToGoogleSheet(user.id);
    if (res.ok) {
      console.log(`✅ Berhasil! Spreadsheet ID: ${res.fileId}`);
      console.log(`🔗 Link: https://docs.google.com/spreadsheets/d/${res.fileId}`);
    } else {
      console.error(`❌ Gagal menyinkronkan user ${user.name}:`, res.error);
    }
  }

  console.log('\n🎉 Selesai! Semua spreadsheet user telah dibuat & diisi 100% di folder Google Drive kamu.');
}

main().catch(console.error);
