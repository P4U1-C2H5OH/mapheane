-- Store richer public inquiry metadata for the admin MessagesManager.

alter table messages
  add column if not exists subject text,
  add column if not exists starred boolean default false,
  add column if not exists crm_linked text,
  add column if not exists phone text,
  add column if not exists metadata jsonb default '{}';
