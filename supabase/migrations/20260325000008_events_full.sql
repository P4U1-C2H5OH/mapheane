-- Add columns used by EventsManager that were missing from initial schema
alter table events
  add column if not exists subtitle      text,
  add column if not exists status        text    default 'upcoming',
  add column if not exists theme         text,
  add column if not exists featured      boolean default false,
  add column if not exists images        jsonb   default '[]',
  add column if not exists tags          jsonb   default '[]',
  add column if not exists artworks      jsonb   default '[]',
  add column if not exists location_data jsonb,
  add column if not exists schedule_data jsonb,
  add column if not exists contact_data  jsonb;
-- ticket_info already exists in initial schema
