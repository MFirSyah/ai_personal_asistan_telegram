import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Parse .env.local manually to avoid dependency issues
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};

envContent.split('\n').forEach((line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const parts = trimmed.split('=');
  const key = parts[0].trim();
  const val = parts.slice(1).join('=').trim();
  env[key] = val;
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'] || '';
const supabaseServiceKey = env['SUPABASE_SERVICE_ROLE_KEY'] || '';

console.log('Connecting to Supabase:', supabaseUrl);

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function viewTransactions() {
  console.log('--- FETCHING RECENT TRANSACTIONS ---');
  const { data: txs, error } = await supabaseAdmin
    .from('transactions')
    .select('id, amount, type, merchant, description, source, occurred_at, deleted_at, user_id')
    .order('occurred_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(JSON.stringify(txs, null, 2));
}

viewTransactions();
