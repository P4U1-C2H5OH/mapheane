alter table artworks
  add column if not exists crop_position text default '50% 50%',
  add column if not exists offset_class  text default 'mt-0';
