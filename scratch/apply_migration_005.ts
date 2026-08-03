import { supabaseAdmin } from '../lib/supabase/client';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
  console.log('Testing column access for Migration 005...');
  const { data, error } = await supabaseAdmin.from('users').select('id, partner_user_id').limit(1);
  if (error) {
    console.log('Columns do not exist yet in DB. Note: Execute 005_waves_1_to_5.sql in Supabase SQL Editor if needed:', error.message);
  } else {
    console.log('Migration 005 column access verified in Supabase!');
  }
}

runMigration();
