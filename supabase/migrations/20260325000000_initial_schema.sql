-- ── Mapheane Studio — initial schema ─────────────────────────────────────────

-- Profiles (extends auth.users)
create table profiles (
  id uuid references auth.users primary key,
  name text,
  role text default 'user'
);
alter table profiles enable row level security;
create policy "Users read own profile" on profiles for select using (auth.uid() = id);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);

-- Orders
create table orders (
  id            uuid primary key default gen_random_uuid(),
  ref           text unique not null,
  status        text default 'pending',
  payment_method text,
  fulfilment    text,
  customer      jsonb,
  address       jsonb,
  delivery_zone text,
  pickup_point  text,
  cart_items    jsonb,
  total_zar     numeric,
  shipping_zar  numeric,
  proof_url     text,
  tracking      text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
alter table orders enable row level security;
create policy "Admin reads all orders" on orders for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Anyone can insert order" on orders for insert with check (true);
create policy "Admin can update orders" on orders for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Artworks
create table artworks (
  id uuid primary key default gen_random_uuid(),
  title text, medium text, technique text,
  dimensions text, price_eur numeric, status text default 'Available',
  description text, statement text, video text, images jsonb, year int,
  created_at timestamptz default now()
);
alter table artworks enable row level security;
create policy "Public reads artworks" on artworks for select using (true);
create policy "Admin manages artworks" on artworks for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Collectors
create table collectors (
  id uuid primary key default gen_random_uuid(),
  name text, email text, phone text, country text,
  tier text default 'prospect', ltv_zar numeric default 0,
  notes text, tags jsonb, created_at timestamptz default now()
);
alter table collectors enable row level security;
create policy "Admin manages collectors" on collectors for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Commissions
create table commissions (
  id uuid primary key default gen_random_uuid(),
  stage text default 'inquiry',
  client_name text, client_email text, description text, price_eur numeric,
  deposit_paid boolean default false,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
alter table commissions enable row level security;
create policy "Admin manages commissions" on commissions for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Moments
create table moments (
  id uuid primary key default gen_random_uuid(),
  title text, date text, type text, excerpt text, content text, media jsonb,
  created_at timestamptz default now()
);
alter table moments enable row level security;
create policy "Public reads moments" on moments for select using (true);
create policy "Admin manages moments" on moments for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Events
create table events (
  id uuid primary key default gen_random_uuid(),
  title text, type text, venue text, description text,
  schedule jsonb, highlights jsonb, ticket_info jsonb, contact jsonb,
  created_at timestamptz default now()
);
alter table events enable row level security;
create policy "Public reads events" on events for select using (true);
create policy "Admin manages events" on events for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Workshops
create table workshops (
  id uuid primary key default gen_random_uuid(),
  title text, type text, description text,
  price_zar numeric, capacity int, enrolled int default 0,
  date date, location text, created_at timestamptz default now()
);
alter table workshops enable row level security;
create policy "Public reads workshops" on workshops for select using (true);
create policy "Admin manages workshops" on workshops for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Workshop bookings
create table workshop_bookings (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid references workshops(id),
  name text, email text, phone text, message text,
  status text default 'pending', created_at timestamptz default now()
);
alter table workshop_bookings enable row level security;
create policy "Anyone can insert booking" on workshop_bookings for insert with check (true);
create policy "Admin manages bookings" on workshop_bookings for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Messages (contact form submissions)
create table messages (
  id uuid primary key default gen_random_uuid(),
  name text, email text, type text, message text,
  status text default 'unread', created_at timestamptz default now()
);
alter table messages enable row level security;
create policy "Anyone can insert message" on messages for insert with check (true);
create policy "Admin manages messages" on messages for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Memberships
create table memberships (
  id uuid primary key default gen_random_uuid(),
  collector_id uuid references collectors(id),
  tier text, status text default 'interest', billing text,
  created_at timestamptz default now()
);
alter table memberships enable row level security;
create policy "Admin manages memberships" on memberships for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Studio settings (key-value store for admin config)
create table studio_settings (
  key text primary key, value jsonb, updated_at timestamptz default now()
);
alter table studio_settings enable row level security;
create policy "Admin manages settings" on studio_settings for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
