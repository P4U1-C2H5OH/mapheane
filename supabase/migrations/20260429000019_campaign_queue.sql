-- Make MarketingHub durable enough to prepare campaigns before Resend sending is enabled.
alter table campaigns
  add column if not exists preview_text text,
  add column if not exists recipient_count int default 0,
  add column if not exists queued_at timestamptz,
  add column if not exists send_provider text,
  add column if not exists send_error text,
  add column if not exists metadata jsonb default '{}'::jsonb;

create table if not exists campaign_recipients (
  id uuid primary key default gen_random_uuid(),
  campaign_id text not null references campaigns(id) on delete cascade,
  email text not null,
  name text,
  source text,
  status text default 'queued',
  subscriber_id uuid references newsletter_subscribers(id) on delete set null,
  collector_id uuid references collectors(id) on delete set null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  sent_at timestamptz,
  error text,
  unique (campaign_id, email)
);

alter table campaign_recipients enable row level security;

create policy "Admin reads campaign recipients" on campaign_recipients
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admin manages campaign recipients" on campaign_recipients
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create index if not exists campaign_recipients_campaign_idx
  on campaign_recipients (campaign_id);

create index if not exists campaign_recipients_status_idx
  on campaign_recipients (status);

create index if not exists campaign_recipients_email_idx
  on campaign_recipients (lower(email));
