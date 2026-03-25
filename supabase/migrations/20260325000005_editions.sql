create table editions (
  id           uuid primary key default gen_random_uuid(),
  artwork_id   uuid references artworks(id) on delete cascade,
  title        text not null,
  type         text default 'Limited',
  size         text,
  paper        text,
  edition_size int,
  edition_sold int default 0,
  price_eur    numeric not null,
  price_zar    numeric,
  image_url    text,
  available    boolean default true,
  description  text,
  created_at   timestamptz default now()
);
alter table editions enable row level security;
create policy "Public reads editions" on editions for select using (true);
create policy "Admin manages editions" on editions for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
