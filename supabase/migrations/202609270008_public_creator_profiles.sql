-- Perfis de criador e comunidade pública. Apenas campos explicitamente
-- publicados ficam nesta tabela; o perfil privado de aprendizagem não é lido.

alter table public.learner_state
  add column if not exists phase_progress jsonb not null default '{"activeWeek":1,"completedTasks":{}}'::jsonb,
  add column if not exists mentor_messages jsonb not null default '[]'::jsonb;

create table if not exists public.community_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  username text not null unique,
  display_name text not null,
  bio text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint community_profile_display_name_length check (char_length(display_name) between 1 and 60),
  constraint community_profile_bio_length check (char_length(bio) <= 500)
);

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.users(id) on delete cascade,
  pillar text not null check (pillar in ('mente', 'intelecto', 'corpo_acao', 'proposito')),
  title text not null check (char_length(btrim(title)) between 8 and 120),
  content text not null check (char_length(btrim(content)) between 40 and 5000),
  evidence_type text not null check (evidence_type in ('resultado', 'projeto', 'habito', 'reflexao')),
  evidence_proof text not null check (char_length(btrim(evidence_proof)) between 8 and 1000),
  created_at timestamptz not null default now()
);

create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  author_id uuid not null references public.users(id) on delete cascade,
  text text not null check (char_length(btrim(text)) between 15 and 2000),
  created_at timestamptz not null default now()
);

create table if not exists public.community_likes (
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index if not exists community_posts_created_idx on public.community_posts(created_at desc);
create index if not exists community_posts_author_idx on public.community_posts(author_id, created_at desc);
create index if not exists community_comments_post_idx on public.community_comments(post_id, created_at);
create index if not exists community_likes_post_idx on public.community_likes(post_id);

create or replace function public.create_community_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.community_profiles(user_id, username, display_name)
  values (new.id, new.username, new.username)
  on conflict (user_id) do update set username = excluded.username;
  return new;
end;
$$;

drop trigger if exists users_create_community_profile on public.users;
create trigger users_create_community_profile
  after insert on public.users
  for each row execute function public.create_community_profile();

create or replace function public.protect_community_profile_identity()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.user_id is distinct from old.user_id or new.username is distinct from old.username then
    raise exception 'A identidade pública está ligada ao nome de utilizador da conta.';
  end if;
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists community_profile_identity_immutable on public.community_profiles;
create trigger community_profile_identity_immutable
  before update on public.community_profiles
  for each row execute function public.protect_community_profile_identity();
revoke all on function public.create_community_profile() from public, anon, authenticated;
revoke all on function public.protect_community_profile_identity() from public, anon, authenticated;

insert into public.community_profiles(user_id, username, display_name)
select id, username, username from public.users
on conflict (user_id) do nothing;

alter table public.community_profiles enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_comments enable row level security;
alter table public.community_likes enable row level security;

drop policy if exists community_profiles_public_read on public.community_profiles;
create policy community_profiles_public_read on public.community_profiles
  for select to anon, authenticated using (true);
drop policy if exists community_profiles_owner_update on public.community_profiles;
create policy community_profiles_owner_update on public.community_profiles
  for update to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists community_posts_public_read on public.community_posts;
create policy community_posts_public_read on public.community_posts
  for select to anon, authenticated using (true);
drop policy if exists community_posts_owner_insert on public.community_posts;
create policy community_posts_owner_insert on public.community_posts
  for insert to authenticated with check (author_id = (select auth.uid()));
drop policy if exists community_posts_owner_update on public.community_posts;
create policy community_posts_owner_update on public.community_posts
  for update to authenticated using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));
drop policy if exists community_posts_owner_delete on public.community_posts;
create policy community_posts_owner_delete on public.community_posts
  for delete to authenticated using (author_id = (select auth.uid()));

drop policy if exists community_comments_public_read on public.community_comments;
create policy community_comments_public_read on public.community_comments
  for select to anon, authenticated using (true);
drop policy if exists community_comments_owner_insert on public.community_comments;
create policy community_comments_owner_insert on public.community_comments
  for insert to authenticated with check (author_id = (select auth.uid()));
drop policy if exists community_comments_owner_delete on public.community_comments;
create policy community_comments_owner_delete on public.community_comments
  for delete to authenticated using (author_id = (select auth.uid()));

drop policy if exists community_likes_public_read on public.community_likes;
create policy community_likes_public_read on public.community_likes
  for select to anon, authenticated using (true);
drop policy if exists community_likes_owner_insert on public.community_likes;
create policy community_likes_owner_insert on public.community_likes
  for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists community_likes_owner_delete on public.community_likes;
create policy community_likes_owner_delete on public.community_likes
  for delete to authenticated using (user_id = (select auth.uid()));

revoke all on public.community_profiles, public.community_posts, public.community_comments, public.community_likes from public;
grant select on public.community_profiles, public.community_posts, public.community_comments, public.community_likes to anon, authenticated;
grant update on public.community_profiles to authenticated;
grant insert, update, delete on public.community_posts to authenticated;
grant insert, delete on public.community_comments, public.community_likes to authenticated;

-- Desativa a publicação antiga de portfólios administrativos, preservando os
-- dados existentes na tabela para não os apagar durante a migração.
drop function if exists public.get_public_admin_portfolio(text);
drop policy if exists portfolio_public_read on public.admin_portfolios;
drop policy if exists portfolio_admin_insert on public.admin_portfolios;
drop policy if exists portfolio_admin_update on public.admin_portfolios;
revoke all on public.admin_portfolios from anon, authenticated, service_role;
drop policy if exists portfolio_image_read on storage.objects;
drop policy if exists portfolio_image_insert on storage.objects;
drop policy if exists portfolio_image_update on storage.objects;
drop policy if exists portfolio_image_delete on storage.objects;
update storage.buckets set public = false where id = 'admin-portfolio';
