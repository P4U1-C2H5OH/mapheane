-- Add columns used by WorkshopsManager that were missing from initial schema
alter table workshops
  add column if not exists medium      text,
  add column if not exists time        text,
  add column if not exists duration    text,
  add column if not exists price_local text,
  add column if not exists price_intl  text,
  add column if not exists bookings    jsonb   default '[]',
  add column if not exists waitlist    jsonb   default '[]',
  add column if not exists revenue     numeric default 0,
  add column if not exists materials   jsonb   default '[]',
  add column if not exists status      text    default 'upcoming';
