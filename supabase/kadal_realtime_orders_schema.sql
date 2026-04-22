-- Kadal Thunai: realtime/index/trigger supplement
-- Run after schema.sql and kadal_clerk_auth_schema.sql.
-- Safe to rerun.

BEGIN;

ALTER TABLE public.profiles ALTER COLUMN name SET DEFAULT 'Kadal Customer';

ALTER TABLE public.addresses
  DROP CONSTRAINT IF EXISTS addresses_type_check;

ALTER TABLE public.addresses
  ADD CONSTRAINT addresses_type_check
  CHECK (type IN ('home', 'work', 'other'));

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_status_check,
  DROP CONSTRAINT IF EXISTS orders_payment_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  ADD CONSTRAINT orders_payment_status_check
  CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));

ALTER TABLE public.loyalty_activities
  DROP CONSTRAINT IF EXISTS loyalty_activities_type_check;

ALTER TABLE public.loyalty_activities
  ADD CONSTRAINT loyalty_activities_type_check
  CHECK (type IN ('earned', 'redeemed', 'expired'));

CREATE UNIQUE INDEX IF NOT EXISTS ux_addresses_default_per_profile
ON public.addresses(profile_id)
WHERE is_default = TRUE;

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_events_created_at ON public.order_events(order_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_addresses_profile_default ON public.addresses(profile_id, is_default);
CREATE INDEX IF NOT EXISTS idx_loyalty_activities_created_at ON public.loyalty_activities(profile_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_addresses_updated_at ON public.addresses;
CREATE TRIGGER trg_addresses_updated_at
BEFORE UPDATE ON public.addresses
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_payment_methods_updated_at ON public.payment_methods;
CREATE TRIGGER trg_payment_methods_updated_at
BEFORE UPDATE ON public.payment_methods
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_loyalty_claimed_coupons_updated_at ON public.loyalty_claimed_coupons;
CREATE TRIGGER trg_loyalty_claimed_coupons_updated_at
BEFORE UPDATE ON public.loyalty_claimed_coupons
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER trg_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_user_notifications_updated_at ON public.user_notifications;
CREATE TRIGGER trg_user_notifications_updated_at
BEFORE UPDATE ON public.user_notifications
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.order_items REPLICA IDENTITY FULL;
ALTER TABLE public.order_events REPLICA IDENTITY FULL;
ALTER TABLE public.addresses REPLICA IDENTITY FULL;
ALTER TABLE public.loyalty_activities REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'orders'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.orders';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'order_items'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'order_events'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.order_events';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'addresses'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.addresses';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'loyalty_activities'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.loyalty_activities';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'profiles'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles';
  END IF;
END
$$;

COMMIT;
