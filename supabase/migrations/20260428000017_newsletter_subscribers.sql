create table if not exists newsletter_subscribers (
  id              uuid primary key default gen_random_uuid(),
  email           text unique not null,
  name            text,
  source          text,
  status          text default 'subscribed',
  segments        text[] default array['newsletter'],
  metadata        jsonb default '{}'::jsonb,
  subscribed_at   timestamptz default now(),
  unsubscribed_at timestamptz,
  updated_at      timestamptz default now()
);

alter table newsletter_subscribers enable row level security;

create policy "Admin reads newsletter subscribers" on newsletter_subscribers
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admin manages newsletter subscribers" on newsletter_subscribers
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create index if not exists newsletter_subscribers_status_idx
  on newsletter_subscribers (status);

create index if not exists newsletter_subscribers_subscribed_at_idx
  on newsletter_subscribers (subscribed_at desc);
