begin;
select plan(2);

-- T-DB-7: Every table in public has RLS enabled
select ok(
  (select count(*) from pg_tables where schemaname = 'public') >= 5,
  'Public schema has core application tables'
);

select ok(
  not exists (
    select 1
    from pg_tables
    where schemaname = 'public'
      and rowsecurity = false
  ),
  'Every table in public has RLS enabled'
);

select * from finish();
rollback;

