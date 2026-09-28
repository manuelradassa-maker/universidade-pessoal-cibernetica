-- Public registration uses a real email and the password chosen by its owner.
-- The auth.users trigger creates the internal learner/profile row atomically.
create or replace function public.create_email_signup_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  chosen_username text := lower(btrim(coalesce(new.raw_user_meta_data ->> 'username', '')));
begin
  if new.raw_user_meta_data ->> 'registration_method' is distinct from 'email' then
    return new;
  end if;

  if chosen_username !~ '^[a-zA-Z0-9_.-]{3,32}$' then
    raise exception 'A valid username is required for email signup.';
  end if;

  insert into public.users (id, username, role, status, created_by)
  values (new.id, chosen_username, 'student', 'active', null);
  return new;
exception
  when unique_violation then
    raise exception 'Username already taken.';
end;
$$;

drop trigger if exists auth_user_email_signup_profile on auth.users;
create trigger auth_user_email_signup_profile
  after insert on auth.users
  for each row execute function public.create_email_signup_profile();

revoke all on function public.create_email_signup_profile() from public, anon, authenticated;

-- Existing invitation codes are no longer needed for new accounts.
update public.invite_codes set revoked_at = now()
where revoked_at is null;
