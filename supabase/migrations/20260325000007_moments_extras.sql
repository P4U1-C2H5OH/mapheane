-- Add columns used by MomentsManager that were missing from initial schema
alter table moments
  add column if not exists tags     jsonb   default '[]',
  add column if not exists featured boolean default false,
  add column if not exists location text,
  add column if not exists mood     text;
