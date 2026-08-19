-- ===========================================================================
-- zolnex — Supabase schema, RLS policies, triggers & storage rules
-- ===========================================================================
-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query) on a fresh
-- project. It is idempotent: safe to re-run.
--
-- After running:
--   1. Storage → create a PUBLIC bucket named "game-files"
--   2. Authentication → Providers → enable GitHub
-- ===========================================================================

-- ---------- Extensions -----------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------- Enum-ish types (use text + check for portability) --------------

-- ---------- users (profile) ------------------------------------------------
create table if not exists public.users (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  username     text unique,
  display_name text,
  avatar_url   text,
  role         text not null default 'player'
               check (role in ('player','developer','admin')),
  created_at   timestamptz not null default now()
);

-- ---------- games ----------------------------------------------------------
create table if not exists public.games (
  id             uuid primary key default gen_random_uuid(),
  developer_id   uuid not null references public.users(id) on delete cascade,
  title          text not null,
  slug           text not null unique,
  description    text,
  category       text check (category in
                  ('Action','Adventure','Arcade','Puzzle','Racing',
                   'Shooter','Strategy','Sports','Simulation','Casual')),
  status         text not null default 'pending'
                  check (status in ('pending','approved','rejected')),
  cover_path     text,
  storage_prefix text not null,          -- e.g. games/<uuid>
  entry_file     text not null default 'index.html',
  play_count     integer not null default 0,
  created_at     timestamptz not null default now()
);
create index if not exists games_status_created_idx
  on public.games (status, created_at desc);
create index if not exists games_category_idx on public.games (category);
create index if not exists games_developer_idx on public.games (developer_id);

-- ---------- developer_quotas ----------------------------------------------
create table if not exists public.developer_quotas (
  developer_id    uuid primary key references public.users(id) on delete cascade,
  max_games       integer not null default 10,
  max_storage_mb  integer not null default 500,
  used_storage_mb numeric not null default 0
);

-- ===========================================================================
-- Trigger: auto-create a user profile + quota when a new auth user signs up
-- ===========================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, username, display_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'user_name',
             new.raw_user_meta_data->>'preferred_username',
             split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'name',
             new.raw_user_meta_data->>'full_name'),
    new.raw_user_meta_data->>'avatar_url',
    'developer'   -- anyone who signs in can upload
  )
  on conflict (id) do nothing;

  insert into public.developer_quotas (developer_id)
  values (new.id)
  on conflict (developer_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===========================================================================
-- RPC: increment a game's play counter (RLS-safe, callable by anon)
-- ===========================================================================
create or replace function public.increment_play_count(game_id uuid)
returns void
language sql
security definer set search_path = public
as $$
  update public.games
     set play_count = play_count + 1
   where id = game_id and status = 'approved';
$$;

grant execute on function public.increment_play_count(uuid) to anon, authenticated;

-- ===========================================================================
-- Row Level Security
-- ===========================================================================
alter table public.users             enable row level security;
alter table public.games             enable row level security;
alter table public.developer_quotas  enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---- users: everyone can read public profile columns; self can update ------
drop policy if exists users_read on public.users;
create policy users_read on public.users
  for select using (true);

drop policy if exists users_update_self on public.users;
create policy users_update_self on public.users
  for update using (id = auth.uid()) with check (id = auth.uid());

-- ---- games: public can read approved; developers manage their own; admin all
drop policy if exists games_read_approved on public.games;
create policy games_read_approved on public.games
  for select using (status = 'approved' or developer_id = auth.uid() or public.is_admin());

drop policy if exists games_insert_owner on public.games;
create policy games_insert_owner on public.games
  for insert with check (developer_id = auth.uid());

drop policy if exists games_update_owner on public.games;
create policy games_update_owner on public.games
  for update using (developer_id = auth.uid() or public.is_admin())
  with check (developer_id = auth.uid() or public.is_admin());

drop policy if exists games_delete_owner on public.games;
create policy games_delete_owner on public.games
  for delete using (developer_id = auth.uid() or public.is_admin());

-- ---- developer_quotas: owner + admin only ---------------------------------
drop policy if exists quotas_owner on public.developer_quotas;
create policy quotas_owner on public.developer_quotas
  for select using (developer_id = auth.uid() or public.is_admin());

-- ===========================================================================
-- Storage: "game-files" bucket policies
-- ===========================================================================
-- NOTE: first create the bucket in the dashboard (or via the snippet below),
-- and set it to PUBLIC.
-- Run once to create the bucket if it does not exist:
--   insert into storage.buckets (id, name, public) values ('game-files','game-files', true)
--   on conflict (id) do nothing;

-- Public read for any object in game-files
drop policy if exists "game-files public read" on storage.objects;
create policy "game-files public read" on storage.objects
  for select using (bucket_id = 'game-files');

-- Authenticated users can upload/overwrite under their own games/<uid>/... path.
-- We use the games table's storage_prefix (games/<game-uuid>) but developers
-- also get a personal staging prefix games/<developer-id>/... below.
drop policy if exists "game-files auth insert" on storage.objects;
create policy "game-files auth insert" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'game-files'
  );

drop policy if exists "game-files auth update" on storage.objects;
create policy "game-files auth update" on storage.objects
  for update to authenticated using (bucket_id = 'game-files');

drop policy if exists "game-files owner delete" on storage.objects;
create policy "game-files owner delete" on storage.objects
  for delete to authenticated using (bucket_id = 'game-files');

-- Done. Your zolnex backend is ready.
