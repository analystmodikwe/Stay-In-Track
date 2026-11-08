begin;
select plan(2);

-- T-BR12-1: Isolation helpers exist
select has_function('public', 'current_gym_id', 'current_gym_id exists for isolation');
select has_function('public', 'is_admin', 'is_admin exists for isolation');

select * from finish();
rollback;
