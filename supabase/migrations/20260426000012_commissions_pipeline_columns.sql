-- Align commissions with the admin CommissionPipeline UI.
-- Existing legacy fields are preserved for compatibility.

alter table commissions
  add column if not exists client text,
  add column if not exists email text,
  add column if not exists medium text default 'Painting',
  add column if not exists value_zar numeric default 0,
  add column if not exists priority text default 'normal',
  add column if not exists due_date text,
  add column if not exists progress int,
  add column if not exists notes text;

update commissions
set
  client = coalesce(client, client_name),
  email = coalesce(email, client_email),
  value_zar = case
    when value_zar is null or value_zar = 0 then coalesce(price_eur * 18, value_zar, 0)
    else value_zar
  end
where client is null
   or email is null
   or value_zar is null
   or value_zar = 0;
