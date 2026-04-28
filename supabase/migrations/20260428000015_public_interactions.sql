create table if not exists public_interactions (
  id           uuid primary key default gen_random_uuid(),
  action       text not null,
  target_type  text not null,
  target_id    text,
  target_title text,
  source       text,
  visitor_id   text,
  page         text,
  metadata     jsonb default '{}'::jsonb,
  user_agent   text,
  created_at   timestamptz default now()
);

alter table public_interactions enable row level security;

create policy "Admin reads public interactions" on public_interactions
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create index if not exists public_interactions_created_at_idx
  on public_interactions (created_at desc);

create index if not exists public_interactions_target_idx
  on public_interactions (target_type, target_id);

create index if not exists public_interactions_action_idx
  on public_interactions (action);
