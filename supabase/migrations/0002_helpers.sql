-- 0002_helpers.sql: current_gym_id(), is_admin(), today_sast(), member_status()

-- Return today's date in SAST
create or replace function public.today_sast()
returns date
language sql
stable
set search_path = ''
as $$
  select (now() at time zone 'Africa/Johannesburg')::date;
$$;

-- Return the caller's gym_id (security definer so RLS policies can use it safely)
create or replace function public.current_gym_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select gym_id from public.profiles where id = auth.uid();
$$;

-- Return true if the caller is an admin (security definer so RLS policies can use it safely)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Calculate member status based on paid_until date, grace_days, and today's date (BR3)
create or replace function public.member_status(
  paid_until date,
  grace_days integer,
  today date
)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when paid_until is null then 'overdue'
    when paid_until >= today then 'active'
    when today <= (paid_until + (grace_days || ' days')::interval)::date then 'grace'
    else 'overdue'
  end;
$$;

-- Check if a payment is the latest payment for a member (security definer to avoid RLS recursion)
create or replace function public.is_latest_payment(
  p_payment_id uuid,
  p_member_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_payment_id = (
    select id from public.payments
    where member_id = p_member_id
    order by created_at desc
    limit 1
  );
$$;

