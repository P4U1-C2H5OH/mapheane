alter table editions
  add column if not exists medium text,
  add column if not exists year   int;
