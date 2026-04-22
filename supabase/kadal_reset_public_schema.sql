-- Kadal Thunai: full public app schema reset
-- Run this only when you want to rebuild the app schema from scratch.
-- This intentionally preserves Supabase managed schemas like auth/storage.

BEGIN;

DROP TABLE IF EXISTS public.user_notifications CASCADE;
DROP TABLE IF EXISTS public.user_settings CASCADE;
DROP TABLE IF EXISTS public.support_tickets CASCADE;
DROP TABLE IF EXISTS public.auth_login_attempts CASCADE;
DROP TABLE IF EXISTS public.loyalty_claimed_coupons CASCADE;
DROP TABLE IF EXISTS public.loyalty_activities CASCADE;
DROP TABLE IF EXISTS public.order_events CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.payment_methods CASCADE;
DROP TABLE IF EXISTS public.addresses CASCADE;
DROP TABLE IF EXISTS public.otp_codes CASCADE;
DROP TABLE IF EXISTS public.premium_collections CASCADE;
DROP TABLE IF EXISTS public.catalog_inventory CASCADE;
DROP TABLE IF EXISTS public.catalog_products CASCADE;
DROP TABLE IF EXISTS public.coupons CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP FUNCTION IF EXISTS public.handle_new_auth_user() CASCADE;
DROP FUNCTION IF EXISTS public.sync_auth_verification_to_profile() CASCADE;
DROP FUNCTION IF EXISTS public.issue_phone_otp(TEXT, TEXT, INTEGER, INTEGER, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.verify_phone_otp(TEXT, TEXT, TEXT, INTEGER, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.hash_phone_otp(TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.normalize_phone(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at_timestamp() CASCADE;
DROP FUNCTION IF EXISTS public.upsert_profile_from_clerk(TEXT, TEXT, TEXT, TEXT) CASCADE;

COMMIT;
