begin;
select plan(7);

-- T-BR5-1 to T-BR5-5, T-BR6-1 to T-BR6-3: Payment and Undo functions
select has_function('public', 'record_payment', 'record_payment function exists');
select has_function('public', 'undo_payment', 'undo_payment function exists');
select has_function('public', 'payment_date_not_future', 'payment_date_not_future trigger exists');

-- Check payment column constraints
select col_not_null('public', 'payments', 'amount', 'payments.amount is not null');
select col_not_null('public', 'payments', 'method', 'payments.method is not null');
select col_not_null('public', 'payments', 'months', 'payments.months is not null');
select col_not_null('public', 'payments', 'payment_date', 'payments.payment_date is not null');

select * from finish();
rollback;

