-- Kadal Thunai: legacy Supabase OTP/auth migration placeholder
-- Clerk is the active auth provider. This file is intentionally a no-op.
-- OTP table creation now comes from schema.sql only; do not restore auth.users triggers here.

DO $$
BEGIN
  RAISE NOTICE 'Skipped legacy migration kadal_auth_signup_signin_otp_schema.sql. Clerk-based schema is active.';
END
$$;
