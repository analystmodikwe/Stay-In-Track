begin;
select plan(18);

-- T-DB-1: Check tables exist
select has_table('public', 'gyms', 'Table gyms exists');
select has_table('public', 'profiles', 'Table profiles exists');
select has_table('public', 'plans', 'Table plans exists');
select has_table('public', 'members', 'Table members exists');
select has_table('public', 'payments', 'Table payments exists');

-- Check columns in gyms
select has_column('public', 'gyms', 'id', 'gyms.id exists');
select has_column('public', 'gyms', 'name', 'gyms.name exists');
select has_column('public', 'gyms', 'grace_days', 'gyms.grace_days exists');
select has_column('public', 'gyms', 'created_at', 'gyms.created_at exists');

-- Check columns in profiles
select has_column('public', 'profiles', 'id', 'profiles.id exists');
select has_column('public', 'profiles', 'email', 'profiles.email exists');
select has_column('public', 'profiles', 'role', 'profiles.role exists');
select has_column('public', 'profiles', 'gym_id', 'profiles.gym_id exists');

-- Check columns in plans
select has_column('public', 'plans', 'price', 'plans.price exists');
select has_column('public', 'plans', 'status', 'plans.status exists');

-- Check columns in members
select has_column('public', 'members', 'paid_until', 'members.paid_until exists');
select has_column('public', 'members', 'plan_id', 'members.plan_id exists');

-- Check columns in payments
select has_column('public', 'payments', 'previous_paid_until', 'payments.previous_paid_until exists');

select * from finish();
rollback;
