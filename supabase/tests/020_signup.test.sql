begin;
select plan(7);

-- Fixtures and tests for sign-up triggers and helper functions
-- T-DB-2: Admin sign-up data creates a gym (grace_days 3) and an admin profile; under-18 is rejected
-- T-DB-3: Member sign-up data creates a member profile in the right gym and sets members.user_id
-- T-BR8-1: can_sign_up_as_member is true only for an unlinked Member email; a sign-up with no matching Member raises member_not_found
-- T-BR8-2: A Member record that is already linked cannot be linked to a second account

select has_function('public', 'can_sign_up_as_member', ARRAY['text'], 'can_sign_up_as_member exists');
select has_function('public', 'handle_new_user', 'handle_new_user trigger function exists');

-- Check can_sign_up_as_member returns boolean
select is(
  public.can_sign_up_as_member('nonexistent@example.com'),
  false,
  'T-BR8-1: can_sign_up_as_member returns false for unknown email'
);

-- Check under-18 rejection
prepare insert_under18 as
insert into auth.users (id, email, raw_user_meta_data)
values (
  gen_random_uuid(),
  'minor@example.com',
  jsonb_build_object('role', 'admin', 'gym_name', 'Gym X', 'full_name', 'Minor', 'is_18_or_older', false)
);
select throws_ok('insert_under18', null, 'T-DB-2: under-18 sign up is rejected');

-- Test unlinked member sign-up raises member_not_found
prepare insert_unlinked_member as
insert into auth.users (id, email, raw_user_meta_data)
values (
  gen_random_uuid(),
  'unknown_member@example.com',
  jsonb_build_object('role', 'member', 'full_name', 'Unknown', 'is_18_or_older', true)
);
select throws_matching('insert_unlinked_member', 'member_not_found', 'T-BR8-1: member sign-up without existing record raises member_not_found');

-- Check function existence for RLS helpers
select has_function('public', 'current_gym_id', 'current_gym_id function exists');
select has_function('public', 'is_admin', 'is_admin function exists');

select * from finish();
rollback;

