-- 0003_rls.sql: RLS enabled on all tables, policies and privileges (Section 9)

-- Enable Row-Level Security on all public tables
alter table public.gyms enable row level security;
alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.members enable row level security;
alter table public.payments enable row level security;

-- ----------------------------------------------------
-- GYMS policies (SEC1 - SEC4)
-- ----------------------------------------------------
-- SEC1: Read: Admin and Members of that gym
create policy "gyms_select" on public.gyms
  for select
  to authenticated
  using (id = public.current_gym_id());

-- SEC2: Update: Admin of that gym
create policy "gyms_update" on public.gyms
  for update
  to authenticated
  using (id = public.current_gym_id() and public.is_admin())
  with check (id = public.current_gym_id() and public.is_admin());

-- SEC3 & SEC4: No insert or delete policies on gyms

-- ----------------------------------------------------
-- PROFILES policies (SEC5 - SEC7, SEC20)
-- ----------------------------------------------------
-- SEC5: Read: Owner only
create policy "profiles_select" on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

-- SEC6: Update: Owner only (reminders_on can change; role, gym, email, age locked)
create policy "profiles_update" on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- SEC7 & SEC20: No insert or delete policies on profiles

-- ----------------------------------------------------
-- PLANS policies (SEC8 - SEC10)
-- ----------------------------------------------------
-- SEC8: Read: Admin all plans of their gym; Member only their own assigned plan
create policy "plans_select_admin" on public.plans
  for select
  to authenticated
  using (
    gym_id = public.current_gym_id() and public.is_admin()
  );

create policy "plans_select_member" on public.plans
  for select
  to authenticated
  using (
    gym_id = public.current_gym_id()
    and not public.is_admin()
    and id in (
      select plan_id from public.members where user_id = auth.uid()
    )
  );

-- SEC9: Create / Update: Admin of that gym
create policy "plans_insert" on public.plans
  for insert
  to authenticated
  with check (
    gym_id = public.current_gym_id() and public.is_admin()
  );

create policy "plans_update" on public.plans
  for update
  to authenticated
  using (
    gym_id = public.current_gym_id() and public.is_admin()
  )
  with check (
    gym_id = public.current_gym_id() and public.is_admin()
  );

-- SEC10: No delete policy on plans (no plan delete in v1)

-- ----------------------------------------------------
-- MEMBERS policies (SEC11 - SEC12)
-- ----------------------------------------------------
-- SEC11: Read: Admin all members of their gym; Member only their own record
create policy "members_select_admin" on public.members
  for select
  to authenticated
  using (
    gym_id = public.current_gym_id() and public.is_admin()
  );

create policy "members_select_member" on public.members
  for select
  to authenticated
  using (
    gym_id = public.current_gym_id() and user_id = auth.uid()
  );

-- SEC12: Create / Update / Delete: Admin of that gym
create policy "members_insert" on public.members
  for insert
  to authenticated
  with check (
    gym_id = public.current_gym_id() and public.is_admin()
  );

create policy "members_update" on public.members
  for update
  to authenticated
  using (
    gym_id = public.current_gym_id() and public.is_admin()
  )
  with check (
    gym_id = public.current_gym_id() and public.is_admin()
  );

create policy "members_delete" on public.members
  for delete
  to authenticated
  using (
    gym_id = public.current_gym_id() and public.is_admin()
  );

-- ----------------------------------------------------
-- PAYMENTS policies (SEC13 - SEC16)
-- ----------------------------------------------------
-- SEC13: Read: Admin all payments of their gym; Member only their own
create policy "payments_select_admin" on public.payments
  for select
  to authenticated
  using (
    gym_id = public.current_gym_id() and public.is_admin()
  );

create policy "payments_select_member" on public.payments
  for select
  to authenticated
  using (
    gym_id = public.current_gym_id()
    and member_id in (
      select id from public.members where user_id = auth.uid()
    )
  );

-- SEC14: Create: Admin of that gym
create policy "payments_insert" on public.payments
  for insert
  to authenticated
  with check (
    gym_id = public.current_gym_id() and public.is_admin()
  );

-- SEC15: Delete: Admin of that gym (BR6 24h & latest payment rule)
create policy "payments_delete" on public.payments
  for delete
  to authenticated
  using (
    gym_id = public.current_gym_id()
    and public.is_admin()
    and created_at >= (now() - interval '24 hours')
    and public.is_latest_payment(id, member_id)
  );

-- SEC16: No update policy on payments (payments are never edited, BR6)

