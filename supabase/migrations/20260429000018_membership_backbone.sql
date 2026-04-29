alter table memberships
  add column if not exists tier_name text,
  add column if not exists amount_zar numeric default 0,
  add column if not exists payment_ref text,
  add column if not exists metadata jsonb default '{}'::jsonb,
  add column if not exists updated_at timestamptz default now();

create unique index if not exists memberships_payment_ref_idx
  on memberships (payment_ref)
  where payment_ref is not null;

create index if not exists memberships_collector_status_idx
  on memberships (collector_id, status);

create index if not exists memberships_created_at_idx
  on memberships (created_at desc);
