-- =============================================
-- Innermark Database Schema
-- =============================================
-- Run this in your Supabase SQL Editor to set up the database.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- PROFILES
-- Extended user data linked to auth.users
-- =============================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  subscription_status text default 'inactive' check (subscription_status in ('inactive', 'active', 'trialing', 'canceled', 'past_due')),
  subscription_id text, -- Stripe subscription ID
  customer_id text,     -- Stripe customer ID
  plan text default 'free' check (plan in ('free', 'premium')),
  onboarding_complete boolean default false,
  reminder_time time,   -- e.g. '20:00'
  celebrations_enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================
-- TOPICS
-- Life areas users track
-- =============================================
create table if not exists public.topics (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  emoji text not null default '⭐',
  position integer not null default 0,
  archived boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Max 25 topics per user (enforced in app, also via trigger for safety)
create or replace function public.check_topic_limit()
returns trigger as $$
declare
  topic_count integer;
  is_premium boolean;
begin
  select count(*) into topic_count
  from public.topics
  where user_id = new.user_id and archived = false;

  select (plan = 'premium' or subscription_status = 'active') into is_premium
  from public.profiles
  where id = new.user_id;

  if is_premium and topic_count >= 25 then
    raise exception 'Premium plan allows a maximum of 25 topics';
  elsif not is_premium and topic_count >= 8 then
    raise exception 'Free plan allows a maximum of 8 topics. Upgrade to Premium for more.';
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger before_topic_insert
  before insert on public.topics
  for each row execute function public.check_topic_limit();

-- =============================================
-- CHECK-INS
-- One entry per user per day
-- =============================================
create table if not exists public.checkins (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  day_note text check (char_length(day_note) <= 500),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, date)
);

-- =============================================
-- TOPIC ENTRIES
-- Per-topic status within a check-in
-- =============================================
create table if not exists public.topic_entries (
  id uuid primary key default uuid_generate_v4(),
  checkin_id uuid not null references public.checkins(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  status text not null check (status in ('red', 'yellow', 'green')),
  note text check (char_length(note) <= 300),
  created_at timestamptz default now(),
  unique (checkin_id, topic_id)
);

-- =============================================
-- STRIPE WEBHOOKS LOG (optional, for debugging)
-- =============================================
create table if not exists public.stripe_events (
  id text primary key, -- Stripe event ID
  type text not null,
  data jsonb,
  processed boolean default false,
  created_at timestamptz default now()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Profiles: users can only see/edit their own
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Topics: users can only see/edit their own
alter table public.topics enable row level security;
create policy "Users can view own topics" on public.topics for select using (auth.uid() = user_id);
create policy "Users can insert own topics" on public.topics for insert with check (auth.uid() = user_id);
create policy "Users can update own topics" on public.topics for update using (auth.uid() = user_id);
create policy "Users can delete own topics" on public.topics for delete using (auth.uid() = user_id);

-- Check-ins: users can only see/edit their own
alter table public.checkins enable row level security;
create policy "Users can view own checkins" on public.checkins for select using (auth.uid() = user_id);
create policy "Users can insert own checkins" on public.checkins for insert with check (auth.uid() = user_id);
create policy "Users can update own checkins" on public.checkins for update using (auth.uid() = user_id);
create policy "Users can delete own checkins" on public.checkins for delete using (auth.uid() = user_id);

-- Topic entries: accessible if parent checkin belongs to user
alter table public.topic_entries enable row level security;
create policy "Users can view own topic entries" on public.topic_entries
  for select using (
    exists (
      select 1 from public.checkins
      where checkins.id = topic_entries.checkin_id
      and checkins.user_id = auth.uid()
    )
  );
create policy "Users can insert own topic entries" on public.topic_entries
  for insert with check (
    exists (
      select 1 from public.checkins
      where checkins.id = topic_entries.checkin_id
      and checkins.user_id = auth.uid()
    )
  );
create policy "Users can update own topic entries" on public.topic_entries
  for update using (
    exists (
      select 1 from public.checkins
      where checkins.id = topic_entries.checkin_id
      and checkins.user_id = auth.uid()
    )
  );
create policy "Users can delete own topic entries" on public.topic_entries
  for delete using (
    exists (
      select 1 from public.checkins
      where checkins.id = topic_entries.checkin_id
      and checkins.user_id = auth.uid()
    )
  );

-- =============================================
-- INDEXES (performance)
-- =============================================
create index if not exists topics_user_id_idx on public.topics(user_id);
create index if not exists topics_user_archived_idx on public.topics(user_id, archived);
create index if not exists checkins_user_date_idx on public.checkins(user_id, date desc);
create index if not exists topic_entries_checkin_idx on public.topic_entries(checkin_id);
create index if not exists topic_entries_topic_idx on public.topic_entries(topic_id);

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_topics_updated_at before update on public.topics
  for each row execute function public.set_updated_at();
create trigger set_checkins_updated_at before update on public.checkins
  for each row execute function public.set_updated_at();
