begin;
select plan(8);

-- T-BR1-1: Plan constraints
select col_not_null('public', 'plans', 'name', 'Plan name is not null');
select col_not_null('public', 'plans', 'price', 'Plan price is not null');

-- T-BR2-1: Member constraints
select col_not_null('public', 'members', 'full_name', 'Member full_name is not null');
select col_not_null('public', 'members', 'email', 'Member email is not null');
select col_not_null('public', 'members', 'is_18_or_older', 'Member is_18_or_older is not null');

-- Trigger functions exist
select has_function('public', 'lock_linked_member_email', 'Trigger lock_linked_member_email exists');
select has_function('public', 'limit_members', 'Trigger limit_members exists');
select has_function('public', 'member_plan_active', 'Trigger member_plan_active exists');

select * from finish();
rollback;

