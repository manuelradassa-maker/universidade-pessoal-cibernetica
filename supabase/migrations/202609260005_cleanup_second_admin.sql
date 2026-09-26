-- Remove the second admin created while verifying the create-admin flow.
delete from auth.users
where email = 'segundo.admin@internal.local';
