begin;
select plan(6);

-- T-SEC-1 to T-SEC-20: RLS enabled on all 5 tables (checked via pg_class.relrowsecurity)
select is(
  (select relrowsecurity from pg_class where relnamespace = 'public'::regnamespace and relname = 'gyms'),
  true,
  'RLS is enabled on gyms'
);

select is(
  (select relrowsecurity from pg_class where relnamespace = 'public'::regnamespace and relname = 'profiles'),
  true,
  'RLS is enabled on profiles'
);

select is(
  (select relrowsecurity from pg_class where relnamespace = 'public'::regnamespace and relname = 'plans'),
  true,
  'RLS is enabled on plans'
);

select is(
  (select relrowsecurity from pg_class where relnamespace = 'public'::regnamespace and relname = 'members'),
  true,
  'RLS is enabled on members'
);

select is(
  (select relrowsecurity from pg_class where relnamespace = 'public'::regnamespace and relname = 'payments'),
  true,
  'RLS is enabled on payments'
);

-- Check delete_my_account is available
select has_function('public', 'delete_my_account', 'delete_my_account exists');

select * from finish();
rollback;
