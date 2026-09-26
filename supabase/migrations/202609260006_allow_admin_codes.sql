-- Allow admin access codes.
--
-- An admin code is deliberately not enough on its own: redeeming it also
-- requires ADMIN_SHARED_PASSWORD, so whoever mints the code must hand over
-- both. The recipient still picks their own username.
alter table public.invite_codes drop constraint if exists invite_codes_role_check;
alter table public.invite_codes
  add constraint invite_codes_role_check check (role in ('partner', 'student', 'admin'));
