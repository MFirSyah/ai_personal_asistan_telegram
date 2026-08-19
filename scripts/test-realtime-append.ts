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
  const { appendActivityRealtime } = await import('../lib/google-sheets/sync');
  
  console.log('Testing appendActivityRealtime for Firman...');
  await appendActivityRealtime('fc2758d3-78bb-4e22-b9f0-b3b16568b671', {
    id: 'ACT-963F9E',
    title: 'Narik gojek',
    description: 'Narik gojek jam 7 pagi sampai jam 5 sore',
    status: 'scheduled',
    priority: 'medium',
    occurred_at: '2026-08-20T07:00:00+07:00',
    tags: ['ojol', 'gojek'],
  });

  console.log('✅ Selesai append test!');
}

test().catch(console.error);
