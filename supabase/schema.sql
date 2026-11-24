create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  avatar_url text,
  role text not null default 'user'
    check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.is_allowed_email(p_email text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(lower(p_email), '') ~ '^[^@]+@hbplus\.fit$';
$$;

-- Kept outside the API-exposed public schema so it cannot be called over REST.
create schema if not exists private;
grant usage on schema private to authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and public.is_allowed_email(email)
  );
$$;

revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

drop function if exists public.is_admin();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_allowed_email(new.email) then
    insert into public.profiles (id, email, full_name, avatar_url)
    values (
      new.id,
      new.email,
      coalesce(
        new.raw_user_meta_data ->> 'full_name',
        new.raw_user_meta_data ->> 'name'
      ),
      coalesce(
        new.raw_user_meta_data ->> 'avatar_url',
        new.raw_user_meta_data ->> 'picture'
      )
    )
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

drop policy if exists "profiles_select_own_or_admin" on public.profiles;

create policy "profiles_select_own_or_admin"
on public.profiles
for select
to authenticated
using (
  public.is_allowed_email(email)
  and (id = (select auth.uid()) or private.is_admin())
);

insert into public.profiles (id, email, full_name, avatar_url)
select
  users.id,
  users.email,
  coalesce(
    users.raw_user_meta_data ->> 'full_name',
    users.raw_user_meta_data ->> 'name'
  ),
  coalesce(
    users.raw_user_meta_data ->> 'avatar_url',
    users.raw_user_meta_data ->> 'picture'
  )
from auth.users as users
where public.is_allowed_email(users.email)
on conflict (id) do nothing;
