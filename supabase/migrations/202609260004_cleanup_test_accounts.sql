-- Remove the throwaway accounts created while testing code redemption.
-- Deleting from auth.users cascades to public.users through the FK on
-- public.users.id, so no orphaned profile rows are left behind.
delete from auth.users
where email in ('teste.pessoa@internal.local', 'outra.pessoa@internal.local');
