import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Warn at build-time instead of throwing — env vars may not be available during static page generation
if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
    console.error(
      'CRITICAL: Missing Supabase environment variables. NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.'
    );
  }
}

// Standard client for public/anon operations
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Admin client for backend server routes bypassing RLS
if (!supabaseServiceKey && typeof window === 'undefined') {
  console.warn('WARNING: SUPABASE_SERVICE_ROLE_KEY is not set. Admin client will use anon key (RLS will apply).');
}
export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
