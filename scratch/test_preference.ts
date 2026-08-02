import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

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

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function testPreference() {
  console.log('Testing saving preference...');
  try {
    // Get a user ID first
    const { data: users } = await supabaseAdmin.from('users').select('id').limit(1);
    if (!users || users.length === 0) {
      console.log('No users found in DB.');
      return;
    }
    const userId = users[0].id;
    console.log('Using userId:', userId);

    const { data, error } = await supabaseAdmin
      .from('user_preferences')
      .upsert(
        {
          user_id: userId,
          key: 'gaya_bahasa',
          value: 'Selalu gunakan format bullet point untuk daftar dan ringkasan',
          learned_from: 'user correction',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,key' }
      )
      .select()
      .single();

    if (error) {
      console.error('Database Error:', error);
    } else {
      console.log('Success:', data);
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

testPreference();
