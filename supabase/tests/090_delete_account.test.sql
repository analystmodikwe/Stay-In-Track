begin;
select plan(1);

-- T-DB-5, T-DB-6, T-SEC-19a/b: delete_my_account function
select has_function('public', 'delete_my_account', 'delete_my_account function exists');

select * from finish();
rollback;

