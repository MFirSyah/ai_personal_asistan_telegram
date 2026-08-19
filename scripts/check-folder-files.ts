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

async function check() {
  const { getDriveClient, folderId } = await import('../lib/google-sheets/client');
  const drive = getDriveClient();
  if (!drive) return;

  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType, owners)',
    spaces: 'drive',
  });

  console.log(`Ditemukan ${res.data.files?.length || 0} file di folder Google Drive:`);
  (res.data.files || []).forEach((f) => {
    console.log(`- 📄 "${f.name}" (ID: ${f.id}, Tipe: ${f.mimeType})`);
  });
}

check().catch(console.error);
