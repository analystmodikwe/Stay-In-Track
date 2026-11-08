-- 0005_functions.sql: business functions and RPCs with permissions (SEC18)

-- 1. can_sign_up_as_member: callable by anon before member sign-up (BR8)
create or replace function public.can_sign_up_as_member(email text)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.members
    where lower(email) = lower($1)
      and user_id is null
  );
$$;

-- 2. record_payment: records a payment, updates paid_until in one transaction (BR5)
create or replace function public.record_payment(
  p_member_id uuid,
  p_months integer,
  p_amount numeric,
  p_method text,
  p_payment_date date default (now() at time zone 'Africa/Johannesburg')::date
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_gym_id uuid;
  v_old_paid_until date;
  v_base_date date;
  v_new_paid_until date;
  v_payment_id uuid;
  v_today date;
begin
  v_today := (now() at time zone 'Africa/Johannesburg')::date;

  -- Validate inputs
  if p_payment_date > v_today then
    raise exception 'future_date: Payment date cannot be in the future.';
  end if;

  if p_months < 1 or p_months > 12 then
    raise exception 'invalid_months: Choose the number of months between 1 and 12.';
  end if;

  if p_amount < 1.00 or p_amount > 50000.00 then
    raise exception 'invalid_amount: Amount must be between R1.00 and R50,000.00.';
  end if;

  if p_method not in ('Cash', 'EFT', 'Card') then
    raise exception 'invalid_method: Choose a valid payment method.';
  end if;

  -- Read member
  select gym_id, paid_until into v_gym_id, v_old_paid_until
  from public.members
  where id = p_member_id;

  if v_gym_id is null then
    raise exception 'member_not_found: Member not found.';
  end if;

  -- Calculate new paid_until (BR5: later of old paid_until and payment_date, plus months)
  v_base_date := greatest(coalesce(v_old_paid_until, p_payment_date), p_payment_date);
  v_new_paid_until := (v_base_date + (p_months || ' months')::interval)::date;

  -- Insert payment
  insert into public.payments (
    gym_id,
    member_id,
    amount,
    method,
    months,
    payment_date,
    previous_paid_until,
    recorded_by
  )
  values (
    v_gym_id,
    p_member_id,
    p_amount,
    p_method,
    p_months,
    p_payment_date,
    v_old_paid_until,
    auth.uid()
  )
  returning id into v_payment_id;

  -- Update member's paid_until
  update public.members
  set paid_until = v_new_paid_until
  where id = p_member_id;

  return v_payment_id;
end;
$$;

-- 3. undo_payment: undoes the latest payment if under 24 hours old (BR6)
create or replace function public.undo_payment(p_payment_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_member_id uuid;
  v_prev_paid_until date;
  v_created_at timestamptz;
  v_latest_id uuid;
begin
  select member_id, previous_paid_until, created_at
  into v_member_id, v_prev_paid_until, v_created_at
  from public.payments
  where id = p_payment_id;

  if v_member_id is null then
    raise exception 'payment_not_found: Payment not found.';
  end if;

  -- Verify it is within 24 hours
  if v_created_at < (now() - interval '24 hours') then
    raise exception 'payment_too_old: Payment can only be undone within 24 hours.';
  end if;

  -- Verify it is the latest payment for this member
  select id into v_latest_id
  from public.payments
  where member_id = v_member_id
  order by created_at desc
  limit 1;

  if v_latest_id <> p_payment_id then
    raise exception 'not_latest_payment: Only the latest Payment can be undone.';
  end if;

  -- Delete payment
  delete from public.payments where id = p_payment_id;

  -- Restore member's paid_until
  update public.members
  set paid_until = v_prev_paid_until
  where id = v_member_id;
end;
$$;

-- 4. list_members: 20 at a time, A-Z, with status and optional search/filter (BR9)
create or replace function public.list_members(
  p_search text default null,
  p_status text default null,
  p_cursor text default null,
  p_today date default (now() at time zone 'Africa/Johannesburg')::date
)
returns table (
  id uuid,
  full_name text,
  email text,
  phone text,
  plan_id uuid,
  plan_name text,
  paid_until date,
  status text,
  created_at timestamptz
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_gym_id uuid;
  v_grace_days integer;
begin
  select gym_id into v_gym_id from public.profiles where id = auth.uid();
  select grace_days into v_grace_days from public.gyms where id = v_gym_id;

  return query
  select
    m.id,
    m.full_name,
    m.email,
    m.phone,
    m.plan_id,
    p.name as plan_name,
    m.paid_until,
    public.member_status(m.paid_until, v_grace_days, p_today) as status,
    m.created_at
  from public.members m
  join public.plans p on p.id = m.plan_id
  where m.gym_id = v_gym_id
    and (
      p_search is null
      or length(trim(p_search)) < 2
      or m.full_name ilike '%' || trim(p_search) || '%'
      or m.email ilike '%' || trim(p_search) || '%'
    )
    and (
      p_status is null
      or p_status = 'all'
      or public.member_status(m.paid_until, v_grace_days, p_today) = p_status
    )
    and (
      p_cursor is null
      or lower(m.full_name) > lower(p_cursor)
    )
  order by lower(m.full_name) asc, m.id asc
  limit 20;
end;
$$;

-- 5. get_dashboard: summary stats for Admin dashboard (BR3, BR7, BR9)
create or replace function public.get_dashboard(
  p_today date default (now() at time zone 'Africa/Johannesburg')::date
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_gym_id uuid;
  v_grace_days integer;
  v_total integer := 0;
  v_active integer := 0;
  v_grace integer := 0;
  v_overdue integer := 0;
  v_revenue numeric(12,2) := 0.00;
  v_plans jsonb;
  v_overdue_list jsonb;
begin
  select gym_id into v_gym_id from public.profiles where id = auth.uid();
  select grace_days into v_grace_days from public.gyms where id = v_gym_id;

  -- Member status counts
  select
    count(*),
    count(*) filter (where public.member_status(paid_until, v_grace_days, p_today) = 'active'),
    count(*) filter (where public.member_status(paid_until, v_grace_days, p_today) = 'grace'),
    count(*) filter (where public.member_status(paid_until, v_grace_days, p_today) = 'overdue')
  into v_total, v_active, v_grace, v_overdue
  from public.members
  where gym_id = v_gym_id;

  -- Revenue this calendar month (BR7)
  select coalesce(sum(amount), 0.00)
  into v_revenue
  from public.payments
  where gym_id = v_gym_id
    and date_trunc('month', payment_date) = date_trunc('month', p_today);

  -- Members per Plan
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'plan_id', p.id,
        'plan_name', p.name,
        'member_count', count(m.id)
      ) order by p.name asc
    ),
    '[]'::jsonb
  )
  into v_plans
  from public.plans p
  left join public.members m on m.plan_id = p.id
  where p.gym_id = v_gym_id
  group by p.id, p.name;

  -- First 5 overdue members
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', m.id,
        'full_name', m.full_name,
        'plan_name', p.name,
        'paid_until', m.paid_until
      )
    ),
    '[]'::jsonb
  )
  into v_overdue_list
  from (
    select m.id, m.full_name, m.plan_id, m.paid_until
    from public.members m
    where m.gym_id = v_gym_id
      and public.member_status(m.paid_until, v_grace_days, p_today) = 'overdue'
    order by lower(m.full_name) asc
    limit 5
  ) m
  join public.plans p on p.id = m.plan_id;

  return jsonb_build_object(
    'total_members', v_total,
    'active_members', v_active,
    'grace_members', v_grace,
    'overdue_members', v_overdue,
    'revenue_this_month', v_revenue,
    'members_per_plan', v_plans,
    'overdue_members', v_overdue_list
  );
end;
$$;

-- 6. delete_my_account: deletes own account (definer, SEC19, BR11, BR12)
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role text;
  v_gym_id uuid;
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'not_authenticated: Must be logged in to delete account.';
  end if;

  select role, gym_id into v_role, v_gym_id
  from public.profiles
  where id = v_user_id;

  if v_role = 'admin' then
    -- Admin deletes the Auth users of the whole gym, then the gym (cascade)
    delete from auth.users
    where id in (select id from public.profiles where gym_id = v_gym_id);

    delete from public.gyms where id = v_gym_id;

  elsif v_role = 'member' then
    -- Member deletes only their Auth user (profile cascades, member record kept)
    update public.members
    set user_id = null
    where user_id = v_user_id;

    delete from auth.users where id = v_user_id;
  end if;
end;
$$;

-- ----------------------------------------------------
-- EXECUTE PERMISSIONS (SEC18)
-- ----------------------------------------------------
revoke execute on all functions in schema public from public;

grant execute on function public.can_sign_up_as_member(text) to anon, authenticated;
grant execute on function public.record_payment(uuid, integer, numeric, text, date) to authenticated;
grant execute on function public.undo_payment(uuid) to authenticated;
grant execute on function public.list_members(text, text, text, date) to authenticated;
grant execute on function public.get_dashboard(date) to authenticated;
grant execute on function public.delete_my_account() to authenticated;
grant execute on function public.today_sast() to authenticated;
grant execute on function public.member_status(date, integer, date) to authenticated;

