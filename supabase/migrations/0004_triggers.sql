-- 0004_triggers.sql: all triggers and handle_new_user (Section 8.5)

-- 1. limit_members: max 500 members per gym (BR2)
create or replace function public.limit_members()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  member_count integer;
begin
  select count(*) into member_count
  from public.members
  where gym_id = new.gym_id;

  if member_count >= 500 then
    raise exception 'member_limit: You have reached the limit of 500 Members.';
  end if;

  return new;
end;
$$;

create trigger tr_limit_members
  before insert on public.members
  for each row
  execute function public.limit_members();

-- 2. member_plan_active: assigned plan must be active and in the same gym (BR1, BR2)
create or replace function public.member_plan_active()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  p_status text;
  p_gym_id uuid;
begin
  if tg_op = 'INSERT' or (tg_op = 'UPDATE' and new.plan_id <> old.plan_id) then
    select status, gym_id into p_status, p_gym_id
    from public.plans
    where id = new.plan_id;

    if p_status is null or p_gym_id is null or p_gym_id <> new.gym_id then
      raise exception 'invalid_plan: Plan does not belong to this gym.';
    end if;

    if p_status <> 'active' then
      raise exception 'plan_inactive: Assigned Plan must be active.';
    end if;
  end if;

  return new;
end;
$$;

create trigger tr_member_plan_active
  before insert or update on public.members
  for each row
  execute function public.member_plan_active();

-- 3. lock_linked_member_email: once linked to a user profile, email cannot change (BR8)
create or replace function public.lock_linked_member_email()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.user_id is not null and lower(new.email) <> lower(old.email) then
    raise exception 'email_locked: Email cannot be changed after the Member signs up.';
  end if;

  return new;
end;
$$;

create trigger tr_lock_linked_member_email
  before update on public.members
  for each row
  execute function public.lock_linked_member_email();

-- 4. payment_date_not_future: payment date cannot be in the future (BR5)
create or replace function public.payment_date_not_future()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  today_sast date;
begin
  today_sast := (now() at time zone 'Africa/Johannesburg')::date;
  if new.payment_date > today_sast then
    raise exception 'future_date: Payment date cannot be in the future.';
  end if;

  return new;
end;
$$;

create trigger tr_payment_date_not_future
  before insert on public.payments
  for each row
  execute function public.payment_date_not_future();

-- 5. handle_new_user: reads sign-up data and sets up gym/profile/link (BR8, BR12)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta_role text;
  meta_is_18 boolean;
  meta_full_name text;
  meta_gym_name text;
  new_gym_id uuid;
  found_member_id uuid;
  found_gym_id uuid;
begin
  meta_role := coalesce(new.raw_user_meta_data->>'role', 'member');
  meta_is_18 := coalesce((new.raw_user_meta_data->>'is_18_or_older')::boolean, false);
  meta_full_name := coalesce(new.raw_user_meta_data->>'full_name', '');

  if not meta_is_18 then
    raise exception 'under_18: Users must be 18 or older to sign up.';
  end if;

  if meta_role = 'admin' then
    meta_gym_name := coalesce(new.raw_user_meta_data->>'gym_name', 'My Gym');

    -- Create the gym
    insert into public.gyms (name, grace_days)
    values (meta_gym_name, 3)
    returning id into new_gym_id;

    -- Create the admin profile
    insert into public.profiles (id, email, full_name, role, gym_id, is_18_or_older, reminders_on)
    values (new.id, lower(new.email), meta_full_name, 'admin', new_gym_id, true, true);

  elsif meta_role = 'member' then
    -- Find the oldest unlinked Member record with this email (BR8)
    select id, gym_id into found_member_id, found_gym_id
    from public.members
    where lower(email) = lower(new.email)
      and user_id is null
    order by created_at asc
    limit 1;

    if found_member_id is null then
      raise exception 'member_not_found: We cannot find this email at any gym. Ask your gym Admin to add you first.';
    end if;

    -- Create the member profile in that gym
    insert into public.profiles (id, email, full_name, role, gym_id, is_18_or_older, reminders_on)
    values (new.id, lower(new.email), meta_full_name, 'member', found_gym_id, true, true);

    -- Link the member record to this user
    update public.members
    set user_id = new.id
    where id = found_member_id;

  else
    raise exception 'invalid_role: Invalid account role.';
  end if;

  return new;
end;
$$;

-- Attach trigger to auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

