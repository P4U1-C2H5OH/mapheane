create table if not exists availability_requests (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid references artworks(id) on delete set null,
  artwork_title text,
  email text not null,
  name text,
  phone text,
  source text,
  status text default 'new',
  collector_id uuid references collectors(id) on delete set null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table availability_requests enable row level security;

create policy "Admin reads availability requests" on availability_requests
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admin manages availability requests" on availability_requests
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create index if not exists availability_requests_artwork_idx
  on availability_requests (artwork_id);

create index if not exists availability_requests_status_idx
  on availability_requests (status);

create index if not exists availability_requests_email_idx
  on availability_requests (lower(email));

create unique index if not exists availability_requests_artwork_email_unique
  on availability_requests (artwork_id, email)
  where artwork_id is not null;
