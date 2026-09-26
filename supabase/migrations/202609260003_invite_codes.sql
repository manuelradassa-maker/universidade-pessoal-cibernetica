-- Access codes let an admin hand out a reusable invite instead of creating
-- the account. The code carries the intended role and, for students, the
-- company they belong to; the recipient picks their own username/password.
--
-- Codes are deliberately reusable (no consumption counter): an admin may
-- reissue the same code for every new intern. `revoked_at` is the kill
-- switch, so a leaked code can be neutralised without deleting its history.
create table if not exists public.invite_codes (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  code text not null unique,
  role public.app_role not null check (role in ('partner', 'student')),
  company_id uuid references public.companies(id) on delete cascade,
  label text,
  created_by uuid not null references public.users(id) on delete cascade,
  use_count integer not null default 0,
  revoked_at pg_catalog.timestamptz,
  created_at pg_catalog.timestamptz not null default pg_catalog.now(),
  constraint invite_codes_student_needs_company check (role <> 'student' or company_id is not null)
);

create index if not exists invite_codes_code_idx on public.invite_codes(code);
create index if not exists invite_codes_created_by_idx on public.invite_codes(created_by);

-- An approved company is required for student codes: a student must land in
-- an approved company, and a code is created before the person signs up.
create or replace function public.invite_codes_company_is_approved()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.role = 'student' then
    if not exists (select 1 from public.companies where id = new.company_id and status = 'approved') then
      raise exception 'A empresa do codigo de estudante tem de existir e estar aprovada.';
    end if;
  end if;
  return new;
end
$$;

drop trigger if exists invite_codes_company_approved on public.invite_codes;
create trigger invite_codes_company_approved
  before insert or update of company_id, role on public.invite_codes
  for each row execute function public.invite_codes_company_is_approved();

-- Code redemption is a service-role-only operation: the Edge Function is the
-- only thing that may read a code, so no policy exposes it to the browser.
alter table public.invite_codes enable row level security;
revoke all on public.invite_codes from anon, authenticated;
grant select, insert, update, delete on public.invite_codes to service_role;
