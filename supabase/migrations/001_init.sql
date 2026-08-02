-- Extension untuk semantic matching kategori
create extension if not exists vector;

create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  telegram_id bigint unique,
  name text,
  created_at timestamptz default now()
);

create table user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  last_active timestamptz default now(),
  expires_at timestamptz not null, -- last_active + 3 hari, di-refresh tiap interaksi
  created_at timestamptz default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  embedding vector(768),           -- dari Gemini text-embedding-004
  usage_count int default 0,
  created_at timestamptz default now(),
  unique(user_id, name)
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  category_id uuid references categories(id),
  amount numeric not null,
  type text check (type in ('expense', 'income')) not null,
  merchant text,
  description text,
  source text check (source in ('receipt_ocr', 'chat_manual')) not null,
  raw_ai_response jsonb,            -- simpan output mentah Gemini untuk audit/debug
  occurred_at timestamptz not null,
  deleted_at timestamptz,
  created_at timestamptz default now()
);

create table activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  category_id uuid references categories(id),
  title text not null,
  description text,
  occurred_at timestamptz not null,
  deleted_at timestamptz,
  created_at timestamptz default now()
);

create table plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  title text not null,
  description text,
  target_date date,
  status text check (status in ('planned', 'in_progress', 'done', 'cancelled')) default 'planned',
  created_at timestamptz default now()
);

create table chat_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  role text check (role in ('user', 'assistant')) not null,
  content text not null,
  created_at timestamptz default now()
);

create table user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  key text not null,               -- misal: "kategori_preference", "gaya_bahasa", "koreksi_kategori"
  value text not null,
  learned_from text,                -- ringkasan konteks kapan preference ini muncul
  updated_at timestamptz default now()
);

create table rate_limits (
  user_id uuid primary key references users(id) on delete cascade,
  minute_count int default 0,
  minute_window_start timestamptz default now(),
  day_count int default 0,
  day_window_start timestamptz default now()
);

create table daily_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  insight_date date not null,
  payload jsonb not null,           -- 20 analisis tersimpan di sini, hasil generate 1x/hari
  created_at timestamptz default now(),
  unique(user_id, insight_date)
);

create table user_settings (
  user_id uuid primary key references users(id) on delete cascade,
  briefing_enabled boolean default false,
  briefing_time time,                -- validasi backend: harus 00:01 - 08:00
  timezone text default 'Asia/Jakarta',
  updated_at timestamptz default now()
);

create table batch_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  type text check (type in ('delete_all', 'generate_data', 'reprocess_receipts')) not null,
  status text check (status in ('pending', 'processing', 'done', 'failed', 'cancelled')) default 'pending',
  total_items int default 0,
  processed_items int default 0,
  batch_size int default 5,          -- berapa item diproses tiap kali cron jalan
  payload jsonb,                     -- detail job & parameter spesifik per type
  error_message text,
  confirmed_at timestamptz,          -- diisi setelah user tap konfirmasi, null = masih menunggu
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Cosine similarity helper function for category matching via pgvector
create or replace function match_categories (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  p_user_id uuid
)
returns table (
  id uuid,
  name text,
  similarity float
)
language sql stable
as $$
  select
    categories.id,
    categories.name,
    1 - (categories.embedding <=> query_embedding) as similarity
  from categories
  where categories.user_id = p_user_id
    and 1 - (categories.embedding <=> query_embedding) > match_threshold
  order by categories.embedding <=> query_embedding
  limit match_count;
$$;
