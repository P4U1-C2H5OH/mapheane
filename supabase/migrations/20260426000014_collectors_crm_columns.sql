-- Align the live collectors table with the admin Collector CRM contract.
alter table collectors
  add column if not exists location text,
  add column if not exists medium_pref jsonb default '[]'::jsonb,
  add column if not exists total_spend numeric default 0,
  add column if not exists purchase_count int default 0,
  add column if not exists last_contact text,
  add column if not exists source text,
  add column if not exists wishlist_count int default 0;

update collectors
set
  location = coalesce(location, country, '—'),
  medium_pref = coalesce(medium_pref, '[]'::jsonb),
  total_spend = coalesce(total_spend, ltv_zar, 0),
  purchase_count = coalesce(purchase_count, 0),
  last_contact = coalesce(last_contact, 'Never'),
  source = coalesce(source, 'Direct'),
  wishlist_count = coalesce(wishlist_count, 0);
