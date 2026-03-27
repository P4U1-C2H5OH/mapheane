-- Auto-create a profiles row whenever a new auth user is created.
-- Uses security definer so it runs as the table owner, bypassing RLS.
-- hello@mapheane.art always gets admin role regardless of UUID.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)
    ),
    case
      when new.email = 'hello@mapheane.art' then 'admin'
      else 'user'
    end
  )
  on conflict (id) do update
    set name = coalesce(excluded.name, profiles.name),
        role = case
                 when new.email = 'hello@mapheane.art' then 'admin'
                 else profiles.role  -- preserve manually set roles on re-signup
               end;
  return new;
end;
$$;

-- Drop if exists to allow re-running this migration
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Also allow users to insert/update their own profile row from the app
-- (needed for the signup flow before the trigger fires within the same request)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'profiles' and policyname = 'Users insert own profile'
  ) then
    execute 'create policy "Users insert own profile" on profiles for insert with check (auth.uid() = id)';
  end if;
end $$;
