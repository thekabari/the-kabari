-- ============================================================
-- theKabari — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. PROFILES table (extends Supabase auth.users)
create table public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  name        text not null,
  phone       text,
  city        text,
  role        text not null default 'user',   -- 'user' | 'admin'
  status      text not null default 'pending', -- 'pending' | 'approved' | 'rejected'
  xp          integer not null default 0,
  total_kg    numeric(10,2) not null default 0,
  total_cash  integer not null default 0,
  created_at  timestamptz default now()
);

-- 2. PICKUPS table
create table public.pickups (
  id          bigserial primary key,
  user_id     uuid references public.profiles(id) on delete cascade,
  user_name   text,
  user_city   text,
  type        text not null,   -- Paper | Plastic | Metal | Electronics | Glass | Cardboard
  kg          numeric(10,2) not null,
  cash        integer not null default 0,
  xp          integer not null default 0,
  note        text,
  created_at  timestamptz default now()
);

-- 3. Row Level Security
alter table public.profiles enable row level security;
alter table public.pickups  enable row level security;

-- Profiles: users can read their own, admins can read all
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can update all profiles"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Pickups: users see their own, admins see all
create policy "Users can view own pickups"
  on public.pickups for select
  using (user_id = auth.uid());

create policy "Admins can view all pickups"
  on public.pickups for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can insert pickups"
  on public.pickups for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Leaderboard: approved users can see all approved users (for ranking)
create policy "Approved users can view leaderboard"
  on public.profiles for select
  using (
    status = 'approved' and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and status = 'approved'
    )
  );

-- 4. Auto-create profile on signup trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, phone, city, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'New User'),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'city',
    coalesce(new.raw_user_meta_data->>'role', 'user'),
    case when new.raw_user_meta_data->>'role' = 'admin' then 'approved' else 'pending' end
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. ORDERS table (user-created pickup requests)
create table public.orders (
  id             bigserial primary key,
  user_id        uuid references public.profiles(id) on delete cascade not null,
  user_name      text not null,
  user_city      text,
  trash_types    text[] not null,             -- e.g. ['Metal','Plastic','Other']
  address        text,
  notes          text,
  status         text not null default 'pending',  -- pending | dispatched | completed | cancelled
  weight_kg      numeric(10,2),               -- filled by admin on completion
  cash_paid      integer,                     -- filled by admin
  xp_awarded     integer,                     -- filled by admin
  scheduled_date date,
  created_at     timestamptz default now()
);

alter table public.orders enable row level security;

create policy "Users can insert own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can cancel own pending orders"
  on public.orders for update
  using (auth.uid() = user_id);

create policy "Admins can view all orders"
  on public.orders for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update all orders"
  on public.orders for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 6. Seed admin user (run AFTER creating admin account via signup)
-- UPDATE public.profiles SET role = 'admin', status = 'approved'
-- WHERE id = 'your-admin-user-uuid-here';
