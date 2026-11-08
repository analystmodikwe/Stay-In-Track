-- 0001_tables.sql: all tables, constraints and indexes (Section 8.1 and 8.4)

create extension if not exists "pgcrypto";

-- Table: gyms
create table public.gyms (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 2 and 60),
  grace_days integer not null default 3 check (grace_days between 0 and 14),
  created_at timestamptz not null default now()
);

-- Table: profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique check (email = lower(email) and length(email) <= 100),
  full_name text not null check (length(full_name) between 2 and 60),
  role text not null check (role in ('admin', 'member')),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  is_18_or_older boolean not null check (is_18_or_older = true),
  reminders_on boolean not null default true,
  created_at timestamptz not null default now()
);

-- Table: plans
create table public.plans (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  name text not null check (length(name) between 2 and 30),
  price numeric(12,2) not null check (price between 1.00 and 5000.00),
  benefits text check (benefits is null or length(benefits) <= 300),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  constraint plans_gym_name_lower_key unique (gym_id, name)
);

-- Note: Case-insensitive uniqueness for plan name within gym:
create unique index plans_gym_id_lower_name_idx on public.plans (gym_id, lower(name));

-- Table: members
create table public.members (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  user_id uuid unique references public.profiles(id) on delete set null,
  full_name text not null check (length(full_name) between 2 and 60),
  email text not null check (email = lower(email) and length(email) <= 100),
  phone text check (phone is null or phone ~ '^\+27[0-9]{9}$'),
  plan_id uuid not null references public.plans(id) on delete no action,
  paid_until date,
  is_18_or_older boolean not null check (is_18_or_older = true),
  created_at timestamptz not null default now(),
  constraint members_gym_email_key unique (gym_id, email)
);

-- Table: payments
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  amount numeric(12,2) not null check (amount between 1.00 and 50000.00),
  method text not null check (method in ('Cash', 'EFT', 'Card')),
  months integer not null default 1 check (months between 1 and 12),
  payment_date date not null default (now() at time zone 'Africa/Johannesburg')::date,
  previous_paid_until date,
  recorded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Section 8.4 Indexes
create index members_gym_name_idx on public.members (gym_id, lower(full_name), id);
create index members_gym_email_idx on public.members (gym_id, lower(email));
create index members_plan_id_idx on public.members (plan_id);
create index payments_member_created_idx on public.payments (member_id, created_at desc);
create index payments_gym_date_idx on public.payments (gym_id, payment_date);
create index plans_gym_id_idx on public.plans (gym_id);
create index profiles_gym_id_idx on public.profiles (gym_id);
