-- PathToCPA — database schema for cloud sync.
-- Run this once in the Supabase dashboard: SQL Editor → New query → paste → Run.
--
-- It stores each user's entire app state (profile, courses, expenses) as one JSON
-- document keyed by their auth user id, and locks it down with Row-Level Security
-- so every user can only ever read/write their own row.

create table if not exists public.user_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Belt-and-suspenders: ensure RLS is on (your project may already do this).
alter table public.user_data enable row level security;

-- A user may read only their own row.
drop policy if exists "Users read own data" on public.user_data;
create policy "Users read own data"
  on public.user_data for select
  using (auth.uid() = user_id);

-- A user may insert only a row for themselves.
drop policy if exists "Users insert own data" on public.user_data;
create policy "Users insert own data"
  on public.user_data for insert
  with check (auth.uid() = user_id);

-- A user may update only their own row.
drop policy if exists "Users update own data" on public.user_data;
create policy "Users update own data"
  on public.user_data for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
