-- Re-assert EXECUTE on the service-role-only helper functions.
--
-- The base migration grants EXECUTE to service_role after revoking it from
-- public/anon/authenticated. On this project the grant did not stick, so the
-- Edge Functions (which call these RPCs as service_role) failed with
-- `permission denied for function record_login_attempt`, breaking every login.
--
-- The functions are still `security definer` and still enforce
-- `auth.role() = 'service_role'` internally, so this grant widens nothing:
-- it only restores the intended privilege for the role that is meant to use it.
grant execute on function public.check_login_rate_limit(text) to service_role;
grant execute on function public.record_login_attempt(text, boolean) to service_role;
grant execute on function public.claim_initial_admin_bootstrap() to service_role;
grant execute on function public.release_initial_admin_bootstrap() to service_role;

-- The service-role helpers read and write these tables from inside
-- `security definer` functions. Grant the table privileges those functions
-- need, so the ownership of the underlying tables cannot break them again.
grant select, insert, update, delete on public.login_attempts to service_role;
grant select, insert, update on public.bootstrap_state to service_role;
grant select, insert, update, delete on public.users to service_role;
grant select, insert, update, delete on public.companies to service_role;
grant select, insert, update, delete on public.videos to service_role;
grant select, insert, update, delete on public.students to service_role;
grant select, insert, update on public.admin_portfolios to service_role;
