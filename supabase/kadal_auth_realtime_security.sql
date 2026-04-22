-- Kadal Thunai: legacy Supabase-auth migration placeholder
-- This project now uses Clerk identity with text auth_user_id values.
-- Do not recreate the old auth.users UUID/FK + RLS stack from this file.
-- Keep this file as a safe no-op so old rerun instructions do not break the schema.

DO $$
BEGIN
  RAISE NOTICE 'Skipped legacy migration kadal_auth_realtime_security.sql. Use schema.sql + kadal_clerk_auth_schema.sql instead.';
END
$$;
