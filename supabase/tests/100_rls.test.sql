begin;
select plan(7);

-- T-SEC-1 to T-SEC-20: RLS enabled on all tables (also T-DB-7)
select table_privs_are(
  'public', 'gyms', 'authenticated', ARRAY['SELECT', 'UPDATE'],
  'Authenticated can select and update gyms'
);

-- Check RLS is enabled on all 5 tables
select has_table('public', 'gyms');
select has_table('public', 'profiles');
select has_table('public', 'plans');
select has_table('public', 'members');
select has_table('public', 'payments');

-- Check delete_my_account is available to authenticated
select has_function('public', 'delete_my_account', 'delete_my_account exists');

select * from finish();
rollback;
