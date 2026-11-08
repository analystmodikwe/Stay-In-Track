begin;
select plan(1);

-- T-SETUP-2: check public schema exists
select has_schema('public', 'public schema exists');

select * from finish();
rollback;

