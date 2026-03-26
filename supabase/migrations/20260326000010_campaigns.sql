-- Marketing campaigns table
create table if not exists campaigns (
  id           text primary key,
  subject      text not null,
  type         text,
  status       text default 'draft',   -- draft | scheduled | sent
  audience     text,
  body         text,
  sent_to      int,
  open_rate    numeric,
  click_rate   numeric,
  scheduled_for text,
  sent_at      text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

alter table campaigns enable row level security;

create policy "Admin manages campaigns" on campaigns for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
