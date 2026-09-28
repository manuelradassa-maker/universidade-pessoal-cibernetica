-- All members share the same signup code and platform permissions. Historical
-- role columns remain for compatibility with existing rows and old clients.
alter table public.invite_codes drop constraint if exists invite_codes_student_needs_company;
drop trigger if exists invite_codes_company_approved on public.invite_codes;
alter table public.companies drop constraint if exists companies_owner_role_check;
drop trigger if exists companies_write_guard on public.companies;
update public.companies set status = 'approved', approved_by = owner_id where status = 'pending';
do $$
declare shared_code_id uuid;
begin
  select id into shared_code_id from public.invite_codes
  where revoked_at is null and (role = 'admin' or company_id is null)
  order by created_at asc limit 1;
  update public.invite_codes set revoked_at = now()
  where revoked_at is null and id is distinct from shared_code_id;
  if shared_code_id is not null then
    update public.invite_codes set role = 'student', company_id = null,
      label = 'Código comum de acesso', revoked_at = null where id = shared_code_id;
  else
    insert into public.invite_codes(code, role, company_id, label, created_by)
    select 'UPC-' || upper(substr(encode(gen_random_bytes(10), 'hex'), 1, 16)), 'student', null,
      'Código comum de acesso', u.id
    from public.users u order by u.created_at limit 1;
  end if;
end $$;
create unique index if not exists invite_codes_single_shared_access_code
  on public.invite_codes(role) where role = 'student' and company_id is null and revoked_at is null;

alter table public.videos add column if not exists is_short boolean not null default false;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('public-videos', 'public-videos', true, 104857600, array['video/mp4','video/webm','video/quicktime','video/ogg'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists public_videos_read on storage.objects;
create policy public_videos_read on storage.objects for select to anon, authenticated
using (bucket_id = 'public-videos');
drop policy if exists public_videos_upload on storage.objects;
create policy public_videos_upload on storage.objects for insert to authenticated
with check (bucket_id = 'public-videos' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists public_videos_update on storage.objects;
create policy public_videos_update on storage.objects for update to authenticated
using (bucket_id = 'public-videos' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'public-videos' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists public_videos_delete on storage.objects;
create policy public_videos_delete on storage.objects for delete to authenticated
using (bucket_id = 'public-videos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 100),
  description text not null default '' check (char_length(description) <= 500),
  created_by uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  added_by uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (group_id, user_id)
);
create table if not exists public.group_companies (
  group_id uuid not null references public.groups(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  added_by uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (group_id, company_id)
);
create index if not exists group_members_user_idx on public.group_members(user_id);
create index if not exists group_companies_company_idx on public.group_companies(company_id);
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_companies enable row level security;

create or replace function public.is_group_member(target_group uuid, target_user uuid default auth.uid())
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.group_members gm
    where gm.group_id = target_group and gm.user_id = target_user)
$$;
drop policy if exists groups_member_read on public.groups;
create policy groups_member_read on public.groups for select to authenticated
using (created_by = (select auth.uid()) or public.is_group_member(id));
drop policy if exists groups_create on public.groups;
create policy groups_create on public.groups for insert to authenticated
with check (created_by = (select auth.uid()));
drop policy if exists groups_owner_update on public.groups;
create policy groups_owner_update on public.groups for update to authenticated
using (created_by = (select auth.uid())) with check (created_by = (select auth.uid()));
drop policy if exists groups_owner_delete on public.groups;
create policy groups_owner_delete on public.groups for delete to authenticated
using (created_by = (select auth.uid()));
drop policy if exists group_members_read on public.group_members;
create policy group_members_read on public.group_members for select to authenticated
using (public.is_group_member(group_id) or exists (select 1 from public.groups g where g.id = group_id and g.created_by = (select auth.uid())));
drop policy if exists group_members_add on public.group_members;
create policy group_members_add on public.group_members for insert to authenticated
with check (added_by = (select auth.uid()) and exists (select 1 from public.groups g where g.id = group_id and g.created_by = (select auth.uid())));
drop policy if exists group_members_remove on public.group_members;
create policy group_members_remove on public.group_members for delete to authenticated
using (exists (select 1 from public.groups g where g.id = group_id and g.created_by = (select auth.uid())) or user_id = (select auth.uid()));
drop policy if exists group_companies_read on public.group_companies;
create policy group_companies_read on public.group_companies for select to authenticated
using (public.is_group_member(group_id) or exists (select 1 from public.groups g where g.id = group_id and g.created_by = (select auth.uid())));
drop policy if exists group_companies_add on public.group_companies;
create policy group_companies_add on public.group_companies for insert to authenticated
with check (added_by = (select auth.uid()) and exists (select 1 from public.groups g where g.id = group_id and g.created_by = (select auth.uid())));
drop policy if exists group_companies_remove on public.group_companies;
create policy group_companies_remove on public.group_companies for delete to authenticated
using (exists (select 1 from public.groups g where g.id = group_id and g.created_by = (select auth.uid())));

grant select, insert, update, delete on public.groups, public.group_members, public.group_companies to authenticated;
grant execute on function public.is_group_member(uuid, uuid) to authenticated;

-- Equal access for every authenticated account: share feed, organizations and
-- videos, and let any member create content and organizations.
drop policy if exists users_read_scoped on public.users;
create policy users_read_scoped on public.users for select to authenticated using (true);
drop policy if exists companies_read_scoped on public.companies;
create policy companies_read_scoped on public.companies for select to authenticated using (true);
drop policy if exists companies_insert_owner on public.companies;
create policy companies_insert_owner on public.companies for insert to authenticated
with check (owner_id = (select auth.uid()));
drop policy if exists companies_update_managed on public.companies;
create policy companies_update_managed on public.companies for update to authenticated
using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
drop policy if exists companies_delete_managed on public.companies;
create policy companies_delete_managed on public.companies for delete to authenticated
using (owner_id = (select auth.uid()));
create or replace function public.enforce_company_write()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    if new.owner_id <> (select auth.uid()) then raise exception 'Not authorized'; end if;
    new.status := 'approved'; new.approved_by := (select auth.uid());
    return new;
  end if;
  if new.owner_id <> old.owner_id then raise exception 'Company ownership cannot be changed'; end if;
  new.status := old.status; new.approved_by := old.approved_by;
  return new;
end $$;
create trigger companies_write_guard before insert or update on public.companies
for each row execute function public.enforce_company_write();
drop policy if exists videos_read_available on public.videos;
create policy videos_read_available on public.videos for select to anon, authenticated using (true);
grant select on public.videos to anon;
drop policy if exists videos_admin_manage on public.videos;
create policy videos_member_manage on public.videos for all to authenticated
using (published_by = (select auth.uid()))
with check (published_by = (select auth.uid()) and (company_id is null or exists (select 1 from public.companies c where c.id = company_id)));
drop policy if exists students_read_scoped on public.students;
create policy students_read_scoped on public.students for select to authenticated using (true);
drop policy if exists students_insert_scoped on public.students;
create policy students_insert_scoped on public.students for insert to authenticated
with check (added_by = (select auth.uid()));

-- Account handles are unique without regard to capitalization.
create unique index if not exists users_username_lower_idx on public.users(lower(username));
alter table public.community_profiles drop constraint if exists community_profile_display_name_length;
alter table public.community_profiles add constraint community_profile_display_name_length
  check (char_length(btrim(display_name)) between 1 and 80);
with ranked_profiles as (
  select user_id, row_number() over (partition by lower(btrim(display_name)) order by created_at, user_id) as position
  from public.community_profiles
)
update public.community_profiles p
set display_name = u.username || ' · ' || p.user_id::text
from ranked_profiles ranked join public.users u on u.id = ranked.user_id
where p.user_id = ranked.user_id and ranked.position > 1;
create unique index if not exists community_profiles_display_name_lower_idx
  on public.community_profiles(lower(btrim(display_name)));
