begin;
select plan(9);

-- T-BR3-1: Test member_status function with today = 2026-10-28 and grace_days = 3
select is(
  public.member_status('2026-10-28'::date, 3, '2026-10-28'::date),
  'active',
  'T-BR3-1: paid_until today is active'
);

select is(
  public.member_status('2026-10-29'::date, 3, '2026-10-28'::date),
  'active',
  'T-BR3-1: paid_until tomorrow is active'
);

select is(
  public.member_status('2026-10-27'::date, 3, '2026-10-28'::date),
  'grace',
  'T-BR3-1: paid_until yesterday is grace'
);

select is(
  public.member_status('2026-10-26'::date, 3, '2026-10-28'::date),
  'grace',
  'T-BR3-1: Thando (26 Oct + 3 days = 29 Oct) is grace on 28 Oct'
);

select is(
  public.member_status('2026-10-25'::date, 3, '2026-10-28'::date),
  'grace',
  'T-BR3-1: 25 Oct + 3 days = 28 Oct (last grace day) is grace'
);

select is(
  public.member_status('2026-10-24'::date, 3, '2026-10-28'::date),
  'overdue',
  'T-BR3-1: 24 Oct + 3 days = 27 Oct is overdue on 28 Oct'
);

select is(
  public.member_status(null, 3, '2026-10-28'::date),
  'overdue',
  'T-BR3-1: empty paid_until is overdue'
);

-- T-BR4-2: with 0 grace days, yesterday is overdue
select is(
  public.member_status('2026-10-27'::date, 0, '2026-10-28'::date),
  'overdue',
  'T-BR4-2: with 0 grace days, yesterday is overdue immediately'
);

-- T-BR4-1: Check default grace_days on gyms is 3
select col_default_is('public', 'gyms', 'grace_days', '3', 'T-BR4-1: gyms.grace_days defaults to 3');

select * from finish();
rollback;
