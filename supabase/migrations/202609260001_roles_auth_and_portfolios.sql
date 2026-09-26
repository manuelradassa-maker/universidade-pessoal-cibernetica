create extension if not exists pgcrypto;

do $$ begin
  create type public.app_role as enum ('admin', 'partner', 'student');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.account_status as enum ('active', 'pending', 'rejected');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.company_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null;
end $$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null check (username ~ '^[a-zA-Z0-9_.-]{3,32}$'),
  role public.app_role not null,
  created_by uuid references public.users(id) on delete set null,
  status public.account_status not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 2 and 120),
  owner_id uuid not null references public.users(id) on delete cascade,
  owner_role public.app_role not null check (owner_role in ('admin', 'partner')),
  approved_by uuid references public.users(id) on delete set null,
  status public.company_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) between 1 and 200),
  url text not null check (url ~ '^https?://'),
  published_by uuid not null references public.users(id) on delete restrict,
  company_id uuid references public.companies(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.students (
  user_id uuid primary key references public.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  added_by uuid not null references public.users(id) on delete restrict
);

create table if not exists public.admin_portfolios (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null unique references public.users(id) on delete cascade,
  updated_at timestamptz not null default now(),
  content jsonb not null default '[]'::jsonb check (jsonb_typeof(content) = 'array')
);

create table if not exists public.login_attempts (
  key_hash text primary key,
  failed_count integer not null default 0 check (failed_count >= 0),
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.bootstrap_state (
  singleton boolean primary key default true check (singleton),
  initialized boolean not null default false
);

create index if not exists users_created_by_idx on public.users(created_by);
create unique index if not exists users_username_lower_idx on public.users(lower(username));
create index if not exists companies_owner_idx on public.companies(owner_id, status);
create index if not exists students_company_idx on public.students(company_id);
create index if not exists videos_company_idx on public.videos(company_id);

create or replace function public.current_app_role()
returns public.app_role language sql stable security definer
set search_path = '' as $$
  select role from public.users where id = (select auth.uid()) and status = 'active'
$$;

create or replace function public.admin_manages_user(target_id uuid)
returns boolean language sql stable security definer
set search_path = '' as $$
  select exists (
    select 1 from public.users target
    where target.id = target_id and (
      (target.role = 'partner' and target.created_by = (select auth.uid()))
      or (target.role = 'student' and (
        target.created_by = (select auth.uid())
        or exists (
          select 1 from public.students s
          join public.companies c on c.id = s.company_id
          join public.users partner on partner.id = c.owner_id
          where s.user_id = target.id and partner.role = 'partner'
            and partner.created_by = (select auth.uid())
        )
      ))
    )
  ) and public.current_app_role() = 'admin'
$$;

create or replace function public.admin_manages_company(target_company_id uuid)
returns boolean language sql stable security definer
set search_path = '' as $$
  select public.current_app_role() = 'admin' and exists (
    select 1 from public.companies c
    left join public.users owner_user on owner_user.id = c.owner_id
    where c.id = target_company_id and (
      c.owner_id = (select auth.uid())
      or (owner_user.role = 'partner' and owner_user.created_by = (select auth.uid()))
    )
  )
$$;

create or replace function public.user_in_company(target_company_id uuid, target_user_id uuid)
returns boolean language sql stable security definer
set search_path = '' as $$
  select exists (
    select 1 from public.students s
    join public.companies c on c.id = s.company_id
    where s.company_id = target_company_id and s.user_id = target_user_id and c.status = 'approved'
  )
$$;

create or replace function public.enforce_company_write()
returns trigger language plpgsql security definer
set search_path = '' as $$
declare actor_role public.app_role;
begin
  actor_role := public.current_app_role();
  if tg_op = 'INSERT' then
    if new.owner_id <> (select auth.uid()) or new.owner_role <> actor_role or actor_role not in ('admin', 'partner') then
      raise exception 'Not authorized to create this company';
    end if;
    if actor_role = 'partner' then
      new.status := 'pending';
      new.approved_by := null;
    else
      new.status := 'approved';
      new.approved_by := (select auth.uid());
    end if;
    return new;
  end if;

  if new.owner_id <> old.owner_id or new.owner_role <> old.owner_role then
    raise exception 'Company ownership cannot be changed';
  end if;
  if new.status is distinct from old.status or new.approved_by is distinct from old.approved_by then
    if actor_role <> 'admin' or old.owner_role <> 'partner'
       or not public.admin_manages_company(old.id) then
      raise exception 'Only the creating admin can review this partner company';
    end if;
    if new.status not in ('approved', 'rejected') then
      raise exception 'Invalid company review status';
    end if;
    new.approved_by := (select auth.uid());
  end if;
  return new;
end
$$;

drop trigger if exists companies_write_guard on public.companies;
create trigger companies_write_guard before insert or update on public.companies
for each row execute function public.enforce_company_write();

create or replace function public.enforce_student_link()
returns trigger language plpgsql security definer
set search_path = '' as $$
declare
  actor_role public.app_role;
  company_row public.companies%rowtype;
begin
  actor_role := public.current_app_role();
  select * into company_row from public.companies where id = new.company_id;
  if not found or company_row.status <> 'approved' then
    raise exception 'Students can only join an approved company';
  end if;
  if actor_role = 'admin' then
    if company_row.owner_id <> (select auth.uid()) then
      raise exception 'Admin can only add students to its own companies';
    end if;
  elsif actor_role = 'partner' then
    if company_row.owner_id <> (select auth.uid()) or new.added_by <> (select auth.uid()) then
      raise exception 'Partner can only add students to its own companies';
    end if;
  else
    raise exception 'Not authorized to add students';
  end if;
  if not exists (select 1 from public.users u where u.id = new.user_id and u.role = 'student' and u.status = 'active') then
    raise exception 'Linked account must be an active student';
  end if;
  return new;
end
$$;

drop trigger if exists students_link_guard on public.students;
create trigger students_link_guard before insert or update on public.students
for each row execute function public.enforce_student_link();

create or replace function public.enforce_video_write()
returns trigger language plpgsql security definer
set search_path = '' as $$
begin
  if public.current_app_role() <> 'admin' or new.published_by <> (select auth.uid()) then
    raise exception 'Only an admin can publish videos';
  end if;
  if new.company_id is not null and not public.admin_manages_company(new.company_id) then
    raise exception 'Admin can only publish for a company it manages';
  end if;
  return new;
end
$$;

drop trigger if exists videos_write_guard on public.videos;
create trigger videos_write_guard before insert or update on public.videos
for each row execute function public.enforce_video_write();

alter table public.users enable row level security;
alter table public.companies enable row level security;
alter table public.videos enable row level security;
alter table public.students enable row level security;
alter table public.admin_portfolios enable row level security;
alter table public.login_attempts enable row level security;
alter table public.bootstrap_state enable row level security;

create policy users_read_scoped on public.users for select to authenticated
using (id = (select auth.uid()) or public.admin_manages_user(id)
  or (public.current_app_role() = 'partner' and created_by = (select auth.uid()) and role = 'student')
  or (public.current_app_role() = 'partner' and exists (
    select 1 from public.students s where s.user_id = users.id and s.added_by = (select auth.uid())
  )));

create policy companies_read_scoped on public.companies for select to authenticated
using (owner_id = (select auth.uid()) or public.admin_manages_company(id)
  or public.user_in_company(id, (select auth.uid())));
create policy companies_insert_owner on public.companies for insert to authenticated
with check (owner_id = (select auth.uid()) and owner_role = public.current_app_role() and owner_role in ('admin', 'partner'));
create policy companies_update_managed on public.companies for update to authenticated
using (public.admin_manages_company(id) or owner_id = (select auth.uid()))
with check (public.admin_manages_company(id) or owner_id = (select auth.uid()));
create policy companies_delete_managed on public.companies for delete to authenticated
using (public.current_app_role() = 'admin' and public.admin_manages_company(id));

create policy videos_read_available on public.videos for select to authenticated
using ((company_id is null and public.current_app_role() is not null) or exists (
  select 1 from public.companies c where c.id = videos.company_id and c.status = 'approved'
    and (c.owner_id = (select auth.uid()) or public.admin_manages_company(c.id)
      or public.user_in_company(c.id, (select auth.uid())))
));
create policy videos_admin_manage on public.videos for all to authenticated
using (public.current_app_role() = 'admin' and (company_id is null or public.admin_manages_company(company_id)))
with check (public.current_app_role() = 'admin' and published_by = (select auth.uid())
  and (company_id is null or public.admin_manages_company(company_id)));

create policy students_read_scoped on public.students for select to authenticated
using (user_id = (select auth.uid()) or added_by = (select auth.uid())
  or (public.current_app_role() = 'admin' and exists (
    select 1 from public.companies c where c.id = students.company_id and public.admin_manages_company(c.id)
  )));
create policy students_insert_scoped on public.students for insert to authenticated
with check (added_by = (select auth.uid()) and user_id <> (select auth.uid())
  and exists (select 1 from public.companies c where c.id = students.company_id
    and c.status = 'approved' and c.owner_id = (select auth.uid())
    and public.current_app_role() in ('admin', 'partner')));

create policy portfolio_public_read on public.admin_portfolios for select to anon, authenticated using (true);
create policy portfolio_admin_insert on public.admin_portfolios for insert to authenticated
with check (admin_id = (select auth.uid()) and public.current_app_role() = 'admin');
create policy portfolio_admin_update on public.admin_portfolios for update to authenticated
using (admin_id = (select auth.uid()) and public.current_app_role() = 'admin')
with check (admin_id = (select auth.uid()) and public.current_app_role() = 'admin');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('admin-portfolio', 'admin-portfolio', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update set public = true, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
create policy portfolio_image_read on storage.objects for select to anon, authenticated
using (bucket_id = 'admin-portfolio');
create policy portfolio_image_insert on storage.objects for insert to authenticated
with check (bucket_id = 'admin-portfolio' and (storage.foldername(name))[1] = (select auth.uid())::text
  and public.current_app_role() = 'admin');
create policy portfolio_image_update on storage.objects for update to authenticated
using (bucket_id = 'admin-portfolio' and (storage.foldername(name))[1] = (select auth.uid())::text
  and public.current_app_role() = 'admin')
with check (bucket_id = 'admin-portfolio' and (storage.foldername(name))[1] = (select auth.uid())::text
  and public.current_app_role() = 'admin');
create policy portfolio_image_delete on storage.objects for delete to authenticated
using (bucket_id = 'admin-portfolio' and (storage.foldername(name))[1] = (select auth.uid())::text
  and public.current_app_role() = 'admin');

revoke all on public.login_attempts from public, anon, authenticated;
revoke all on public.bootstrap_state from public, anon, authenticated;
revoke all on public.users, public.companies, public.videos, public.students, public.admin_portfolios from anon;
revoke all on public.users, public.companies, public.videos, public.students, public.admin_portfolios from authenticated;
grant select on public.users, public.companies, public.videos, public.students to authenticated;
grant select, insert, update, delete on public.companies to authenticated;
grant select, insert, update, delete on public.videos to authenticated;
grant insert on public.students to authenticated;
grant select on public.admin_portfolios to anon, authenticated;
grant insert, update on public.admin_portfolios to authenticated;

create or replace function public.check_login_rate_limit(p_key_hash text)
returns boolean language plpgsql security definer
set search_path = '' as $$
declare attempt public.login_attempts%rowtype;
begin
  if auth.role() <> 'service_role' then raise exception 'Forbidden'; end if;
  select * into attempt from public.login_attempts where key_hash = p_key_hash;
  return not found or attempt.locked_until is null or attempt.locked_until <= now();
end
$$;

create or replace function public.record_login_attempt(p_key_hash text, p_success boolean)
returns void language plpgsql security definer
set search_path = '' as $$
begin
  if auth.role() <> 'service_role' then raise exception 'Forbidden'; end if;
  if p_success then
    delete from public.login_attempts where key_hash = p_key_hash;
  else
    insert into public.login_attempts(key_hash, failed_count, locked_until, updated_at)
    values (p_key_hash, 1, null, now())
    on conflict (key_hash) do update set
      failed_count = case when public.login_attempts.locked_until is not null and public.login_attempts.locked_until <= now() then 1 else public.login_attempts.failed_count + 1 end,
      locked_until = case when (case when public.login_attempts.locked_until is not null and public.login_attempts.locked_until <= now() then 1 else public.login_attempts.failed_count + 1 end) >= 5 then now() + interval '15 minutes' else null end,
      updated_at = now();
  end if;
end
$$;

create or replace function public.claim_initial_admin_bootstrap()
returns boolean language plpgsql security definer
set search_path = '' as $$
declare
  was_initialized boolean;
begin
  if auth.role() <> 'service_role' then raise exception 'Forbidden'; end if;
  perform pg_advisory_xact_lock(hashtext('initial-admin-bootstrap'));
  insert into public.bootstrap_state(singleton, initialized) values (true, false) on conflict (singleton) do nothing;
  select initialized into was_initialized from public.bootstrap_state where singleton = true for update;
  if was_initialized or exists (select 1 from public.users where role = 'admin') then
    update public.bootstrap_state set initialized = true where singleton = true;
    return false;
  end if;
  update public.bootstrap_state set initialized = true where singleton = true;
  return true;
end
$$;

create or replace function public.release_initial_admin_bootstrap()
returns void language plpgsql security definer
set search_path = '' as $$
begin
  if auth.role() <> 'service_role' then raise exception 'Forbidden'; end if;
  if not exists (select 1 from public.users where role = 'admin') then
    update public.bootstrap_state set initialized = false where singleton = true;
  end if;
end
$$;

revoke all on function public.check_login_rate_limit(text) from public, anon, authenticated;
revoke all on function public.record_login_attempt(text, boolean) from public, anon, authenticated;
revoke all on function public.claim_initial_admin_bootstrap() from public, anon, authenticated;
revoke all on function public.release_initial_admin_bootstrap() from public, anon, authenticated;
grant execute on function public.check_login_rate_limit(text) to service_role;
grant execute on function public.record_login_attempt(text, boolean) to service_role;
grant execute on function public.claim_initial_admin_bootstrap() to service_role;
grant execute on function public.release_initial_admin_bootstrap() to service_role;
revoke all on function public.current_app_role() from public, anon;
revoke all on function public.admin_manages_user(uuid) from public, anon;
revoke all on function public.admin_manages_company(uuid) from public, anon;
revoke all on function public.user_in_company(uuid, uuid) from public, anon;
grant execute on function public.current_app_role() to authenticated;
grant execute on function public.admin_manages_user(uuid) to authenticated;
grant execute on function public.admin_manages_company(uuid) to authenticated;
grant execute on function public.user_in_company(uuid, uuid) to authenticated;

create or replace function public.get_public_admin_portfolio(p_username text)
returns jsonb language sql stable security definer
set search_path = '' as $$
  select jsonb_build_object('username', u.username, 'content', p.content, 'updated_at', p.updated_at)
  from public.users u join public.admin_portfolios p on p.admin_id = u.id
  where lower(u.username) = lower(p_username) and u.role = 'admin' and u.status = 'active'
$$;
revoke all on function public.get_public_admin_portfolio(text) from public;
grant execute on function public.get_public_admin_portfolio(text) to anon, authenticated;
