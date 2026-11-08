begin;
select plan(2);

-- T-DB-4, T-BR7-1: Dashboard function
select has_function('public', 'get_dashboard', ARRAY['date'], 'get_dashboard(date) function exists');
select has_function('public', 'today_sast', 'today_sast helper exists');

select * from finish();
rollback;

