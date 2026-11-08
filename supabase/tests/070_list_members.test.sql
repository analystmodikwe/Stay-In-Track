begin;
select plan(1);

-- T-BR9-1, T-BR9-2: list_members function
select has_function('public', 'list_members', 'list_members function exists');

select * from finish();
rollback;

