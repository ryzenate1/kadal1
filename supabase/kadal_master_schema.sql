-- ============================================================
-- KADAL THUNAI — MASTER SCHEMA
-- Single file. Safe to run multiple times on a fresh or
-- existing Supabase database. Run this INSTEAD of running
-- each individual file separately.
--
-- Order:
--   1. Extensions
--   2. Core tables (profiles → child tables)
--   3. ADD COLUMN guards (idempotent migrations)
--   4. Catalog tables
--   5. Constraints & indexes
--   6. Triggers / functions
--   7. Realtime publication
--   8. Row-Level Security (Clerk JWT aligned)
--   9. Razorpay / payment columns
-- ============================================================

BEGIN;

-- ============================================================
-- 1. EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 2. CORE TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id            TEXT        UNIQUE,
  name                    TEXT        NOT NULL DEFAULT 'Kadal Customer',
  email                   TEXT        UNIQUE,
  phone_number            TEXT,
  profile_image           TEXT,
  loyalty_points          INTEGER     NOT NULL DEFAULT 0,
  notifications_enabled   BOOLEAN     NOT NULL DEFAULT TRUE,
  notif_order_updates     BOOLEAN     NOT NULL DEFAULT TRUE,
  notif_promotions        BOOLEAN     NOT NULL DEFAULT TRUE,
  notif_loyalty_updates   BOOLEAN     NOT NULL DEFAULT TRUE,
  notif_newsletter        BOOLEAN     NOT NULL DEFAULT FALSE,
  notif_sms               BOOLEAN     NOT NULL DEFAULT TRUE,
  notif_email             BOOLEAN     NOT NULL DEFAULT TRUE,
  notif_push              BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.addresses (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id   UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  phone_number TEXT,
  address      TEXT        NOT NULL,
  city         TEXT,
  state        TEXT,
  pincode      TEXT,
  type         TEXT        NOT NULL DEFAULT 'home',
  is_default   BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payment_methods (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id       UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type             TEXT        NOT NULL,
  nickname         TEXT        NOT NULL,
  provider         TEXT,
  masked_value     TEXT,
  card_holder_name TEXT,
  expiry_date      TEXT,
  upi_id           TEXT,
  bank_name        TEXT,
  account_last4    TEXT,
  is_default       BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id                    UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number          TEXT           UNIQUE NOT NULL,
  profile_id            UUID           NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status                TEXT           NOT NULL DEFAULT 'confirmed',
  total_amount          NUMERIC(12,2)  NOT NULL,
  payment_status        TEXT           NOT NULL DEFAULT 'pending',
  payment_method        TEXT           NOT NULL,
  tracking_number       TEXT           UNIQUE,
  estimated_delivery    TIMESTAMPTZ,
  shipping_name         TEXT           NOT NULL,
  shipping_phone        TEXT,
  shipping_address      TEXT           NOT NULL,
  shipping_city         TEXT,
  shipping_state        TEXT,
  shipping_pincode      TEXT,
  delivery_slot         TEXT,
  points_earned         INTEGER        NOT NULL DEFAULT 0,
  processing_video_url  TEXT,
  delivery_person_name  TEXT,
  delivery_person_phone TEXT,
  is_delivery_reached   BOOLEAN        NOT NULL DEFAULT FALSE,
  -- Razorpay columns
  razorpay_order_id     TEXT,
  razorpay_payment_id   TEXT,
  razorpay_signature    TEXT,
  payment_verified_at   TIMESTAMPTZ,
  created_at            TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id            UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID           NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id    TEXT,
  product_name  TEXT           NOT NULL,
  product_image TEXT,
  quantity      INTEGER        NOT NULL,
  price         NUMERIC(12,2)  NOT NULL,
  weight        TEXT,
  created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_events (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID        NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status      TEXT        NOT NULL,
  description TEXT        NOT NULL,
  location    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.loyalty_activities (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        TEXT        NOT NULL,
  points      INTEGER     NOT NULL,
  description TEXT        NOT NULL,
  order_id    UUID        REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.loyalty_claimed_coupons (
  id               UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id       UUID           NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  code             TEXT           UNIQUE NOT NULL,
  points_redeemed  INTEGER        NOT NULL,
  discount_amount  NUMERIC(12,2)  NOT NULL,
  expires_at       TIMESTAMPTZ    NOT NULL,
  is_used          BOOLEAN        NOT NULL DEFAULT FALSE,
  used_at          TIMESTAMPTZ,
  used_order_id    UUID           REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.otp_codes (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT        NOT NULL,
  code         TEXT        NOT NULL,
  expires_at   TIMESTAMPTZ NOT NULL,
  verified     BOOLEAN     NOT NULL DEFAULT FALSE,
  attempts     INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.auth_login_attempts (
  identity_key   TEXT        PRIMARY KEY,
  failed_count   INTEGER     NOT NULL DEFAULT 0,
  blocked_until  TIMESTAMPTZ,
  last_failed_at TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number  TEXT        UNIQUE NOT NULL,
  user_id        UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name      TEXT,
  user_email     TEXT,
  user_phone     TEXT,
  subject        TEXT        NOT NULL,
  category       TEXT        NOT NULL DEFAULT 'general',
  message        TEXT        NOT NULL,
  priority       TEXT        NOT NULL DEFAULT 'normal',
  status         TEXT        NOT NULL DEFAULT 'open',
  admin_response TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.coupons (
  id             UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  code           TEXT           UNIQUE NOT NULL,
  title          TEXT           NOT NULL,
  description    TEXT           NOT NULL DEFAULT '',
  type           TEXT           NOT NULL DEFAULT 'percentage',
  discount_value NUMERIC(12,2),
  discount_label TEXT,
  min_order      NUMERIC(12,2)  NOT NULL DEFAULT 0,
  valid_until    TIMESTAMPTZ,
  usage_limit    INTEGER,
  used_count     INTEGER        NOT NULL DEFAULT 0,
  is_active      BOOLEAN        NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_settings (
  profile_id        UUID    PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  theme             TEXT    NOT NULL DEFAULT 'system',
  language          TEXT    NOT NULL DEFAULT 'en',
  currency          TEXT    NOT NULL DEFAULT 'INR',
  profile_visibility TEXT   NOT NULL DEFAULT 'private',
  search_history    BOOLEAN NOT NULL DEFAULT TRUE,
  analytics         BOOLEAN NOT NULL DEFAULT TRUE,
  cookies           BOOLEAN NOT NULL DEFAULT TRUE,
  high_contrast     BOOLEAN NOT NULL DEFAULT FALSE,
  large_text        BOOLEAN NOT NULL DEFAULT FALSE,
  reduced_motion    BOOLEAN NOT NULL DEFAULT FALSE,
  screen_reader     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_notifications (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id   UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source_type  TEXT        NOT NULL,
  source_id    TEXT        NOT NULL,
  title        TEXT        NOT NULL,
  message      TEXT        NOT NULL,
  is_read      BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, source_type, source_id)
);

-- ============================================================
-- 3. CATALOG TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.catalog_products (
  id               TEXT           PRIMARY KEY,
  slug             TEXT           UNIQUE NOT NULL,
  name             TEXT           NOT NULL,
  tanglish_name    TEXT,
  category         TEXT           NOT NULL,
  type             TEXT           NOT NULL,
  description      TEXT           NOT NULL,
  image_url        TEXT           NOT NULL,
  base_price       NUMERIC(12,2)  NOT NULL,
  rating           NUMERIC(4,2)   NOT NULL DEFAULT 0,
  omega3           TEXT,
  protein          TEXT,
  calories         TEXT,
  origin           TEXT,
  tags             TEXT[]         NOT NULL DEFAULT '{}',
  available_weights JSONB         NOT NULL DEFAULT '[]'::jsonb,
  is_featured      BOOLEAN        NOT NULL DEFAULT FALSE,
  is_popular       BOOLEAN        NOT NULL DEFAULT FALSE,
  is_premium       BOOLEAN        NOT NULL DEFAULT FALSE,
  is_active        BOOLEAN        NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.catalog_inventory (
  product_id          TEXT    PRIMARY KEY REFERENCES public.catalog_products(id) ON DELETE CASCADE,
  stock_quantity      INTEGER NOT NULL DEFAULT 25,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  allow_backorder     BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.premium_collections (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     TEXT        NOT NULL REFERENCES public.catalog_products(id) ON DELETE CASCADE,
  tag            TEXT,
  discount_percent INTEGER   NOT NULL DEFAULT 0,
  default_weight TEXT        NOT NULL DEFAULT '500g',
  display_order  INTEGER     NOT NULL DEFAULT 0,
  is_active      BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id)
);

-- ============================================================
-- 4. ADD COLUMN GUARDS (idempotent — safe to re-run)
-- ============================================================

-- profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS auth_user_id         TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number          TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_image         TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notif_order_updates   BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notif_promotions      BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notif_loyalty_updates BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notif_newsletter      BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notif_sms             BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notif_email           BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notif_push            BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at            TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at            TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ALTER COLUMN name SET DEFAULT 'Kadal Customer';

-- Fix auth_user_id type if it was accidentally created as UUID
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles'
      AND column_name = 'auth_user_id' AND data_type <> 'text'
  ) THEN
    ALTER TABLE public.profiles ALTER COLUMN auth_user_id TYPE TEXT USING auth_user_id::text;
  END IF;
END $$;

-- Drop legacy auth.users FK on auth_user_id if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_auth_user_id_fkey'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles DROP CONSTRAINT profiles_auth_user_id_fkey;
  END IF;
END $$;

-- addresses
ALTER TABLE public.addresses ADD COLUMN IF NOT EXISTS type       TEXT    NOT NULL DEFAULT 'home';
ALTER TABLE public.addresses ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.addresses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- orders — Razorpay columns
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS processing_video_url  TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_person_name  TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_person_phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS is_delivery_reached   BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS razorpay_order_id     TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS razorpay_payment_id   TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS razorpay_signature    TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_verified_at   TIMESTAMPTZ;

-- ============================================================
-- 5. CHECK CONSTRAINTS
-- ============================================================

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

-- ============================================================
-- 6. INDEXES
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS ux_profiles_auth_user_id
  ON public.profiles(auth_user_id) WHERE auth_user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_addresses_default_per_profile
  ON public.addresses(profile_id) WHERE is_default = TRUE;

CREATE UNIQUE INDEX IF NOT EXISTS ux_orders_razorpay_payment_id
  ON public.orders(razorpay_payment_id) WHERE razorpay_payment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_addresses_profile_id         ON public.addresses(profile_id);
CREATE INDEX IF NOT EXISTS idx_addresses_profile_default    ON public.addresses(profile_id, is_default);
CREATE INDEX IF NOT EXISTS idx_payment_methods_profile_id   ON public.payment_methods(profile_id);
CREATE INDEX IF NOT EXISTS idx_orders_profile_id            ON public.orders(profile_id);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number       ON public.orders(tracking_number);
CREATE INDEX IF NOT EXISTS idx_orders_order_number          ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at            ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id         ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_events_order_id        ON public.order_events(order_id);
CREATE INDEX IF NOT EXISTS idx_order_events_created_at      ON public.order_events(order_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_loyalty_activities_profile_id ON public.loyalty_activities(profile_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_activities_created_at ON public.loyalty_activities(profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_loyalty_claimed_coupons_profile_id ON public.loyalty_claimed_coupons(profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_loyalty_claimed_coupons_active     ON public.loyalty_claimed_coupons(profile_id, is_used, expires_at);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id      ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status       ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_coupons_active               ON public.coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_user_notifications_profile   ON public.user_notifications(profile_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_catalog_products_slug        ON public.catalog_products(slug);
CREATE INDEX IF NOT EXISTS idx_catalog_products_category    ON public.catalog_products(category);
CREATE INDEX IF NOT EXISTS idx_catalog_products_featured    ON public.catalog_products(is_featured, is_active);
CREATE INDEX IF NOT EXISTS idx_premium_collections_active_order ON public.premium_collections(is_active, display_order, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_login_attempts_blocked  ON public.auth_login_attempts(blocked_until);

-- ============================================================
-- 7. FUNCTIONS & TRIGGERS
-- ============================================================

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply to all tables that have updated_at
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'profiles', 'addresses', 'orders', 'payment_methods',
    'loyalty_claimed_coupons', 'user_settings', 'user_notifications',
    'catalog_products', 'catalog_inventory', 'premium_collections'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_updated_at ON public.%I', tbl, tbl);
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON public.%I
       FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp()',
      tbl, tbl
    );
  END LOOP;
END $$;

-- Phone normalizer (used by upsert_profile_from_clerk)
CREATE OR REPLACE FUNCTION public.normalize_phone(p_phone TEXT)
RETURNS TEXT LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE digits TEXT;
BEGIN
  digits := regexp_replace(COALESCE(p_phone, ''), '[^0-9]', '', 'g');
  IF length(digits) = 12 AND left(digits, 2) = '91' THEN
    digits := right(digits, 10);
  END IF;
  RETURN CASE WHEN length(digits) = 10 THEN digits ELSE NULL END;
END;
$$;

-- Clerk profile upsert helper
CREATE OR REPLACE FUNCTION public.upsert_profile_from_clerk(
  p_auth_user_id  TEXT,
  p_name          TEXT,
  p_email         TEXT,
  p_phone_number  TEXT DEFAULT NULL
)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_profile_id UUID;
  v_email      TEXT;
  v_phone      TEXT;
BEGIN
  IF p_auth_user_id IS NULL OR btrim(p_auth_user_id) = '' THEN
    RAISE EXCEPTION 'p_auth_user_id is required';
  END IF;
  v_email := NULLIF(lower(trim(COALESCE(p_email, ''))), '');
  v_phone := public.normalize_phone(p_phone_number);

  SELECT id INTO v_profile_id FROM public.profiles WHERE auth_user_id = p_auth_user_id LIMIT 1;
  IF v_profile_id IS NULL AND v_email IS NOT NULL THEN
    SELECT id INTO v_profile_id FROM public.profiles
    WHERE lower(email) = v_email ORDER BY updated_at DESC NULLS LAST, created_at DESC LIMIT 1;
  END IF;
  IF v_profile_id IS NULL AND v_phone IS NOT NULL THEN
    SELECT id INTO v_profile_id FROM public.profiles
    WHERE public.normalize_phone(phone_number) = v_phone ORDER BY updated_at DESC NULLS LAST, created_at DESC LIMIT 1;
  END IF;

  IF v_profile_id IS NULL THEN
    INSERT INTO public.profiles (auth_user_id, name, email, phone_number)
    VALUES (p_auth_user_id,
            COALESCE(NULLIF(trim(COALESCE(p_name, '')), ''), 'Kadal Customer'),
            v_email, v_phone)
    RETURNING id INTO v_profile_id;
  ELSE
    UPDATE public.profiles SET
      auth_user_id  = COALESCE(auth_user_id, p_auth_user_id),
      name          = COALESCE(NULLIF(trim(COALESCE(p_name, '')), ''), name),
      email         = COALESCE(v_email, email),
      phone_number  = COALESCE(v_phone, phone_number),
      updated_at    = NOW()
    WHERE id = v_profile_id;
  END IF;
  RETURN v_profile_id;
END;
$$;

-- ============================================================
-- 8. REALTIME PUBLICATION
-- ============================================================

-- Enable REPLICA IDENTITY FULL so realtime sends full row diffs
ALTER TABLE public.orders             REPLICA IDENTITY FULL;
ALTER TABLE public.order_items        REPLICA IDENTITY FULL;
ALTER TABLE public.order_events       REPLICA IDENTITY FULL;
ALTER TABLE public.addresses          REPLICA IDENTITY FULL;
ALTER TABLE public.loyalty_activities REPLICA IDENTITY FULL;
ALTER TABLE public.profiles           REPLICA IDENTITY FULL;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'orders', 'order_items', 'order_events',
    'addresses', 'loyalty_activities', 'profiles'
  ] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;

-- ============================================================
-- 9. ROW-LEVEL SECURITY  (Clerk JWT — sub claim = auth_user_id)
-- ============================================================

ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_events       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- Drop old policies before recreating (idempotent)
DO $$
DECLARE pol TEXT; tbl TEXT;
BEGIN
  FOR pol, tbl IN
    SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol, tbl);
  END LOOP;
END $$;

-- profiles
CREATE POLICY profiles_select_own ON public.profiles FOR SELECT TO authenticated
  USING (auth_user_id = COALESCE(auth.jwt() ->> 'sub', auth.uid()::text));
CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth_user_id = COALESCE(auth.jwt() ->> 'sub', auth.uid()::text));
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated
  USING (auth_user_id = COALESCE(auth.jwt() ->> 'sub', auth.uid()::text))
  WITH CHECK (auth_user_id = COALESCE(auth.jwt() ->> 'sub', auth.uid()::text));
CREATE POLICY profiles_delete_own ON public.profiles FOR DELETE TO authenticated
  USING (auth_user_id = COALESCE(auth.jwt() ->> 'sub', auth.uid()::text));

-- Service role bypass (needed because Next.js API routes use service role)
CREATE POLICY profiles_service_all ON public.profiles FOR ALL TO service_role USING (true) WITH CHECK (true);

-- addresses
CREATE POLICY addresses_own ON public.addresses FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = addresses.profile_id
    AND p.auth_user_id = COALESCE(auth.jwt() ->> 'sub', auth.uid()::text)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = addresses.profile_id
    AND p.auth_user_id = COALESCE(auth.jwt() ->> 'sub', auth.uid()::text)));
CREATE POLICY addresses_service_all ON public.addresses FOR ALL TO service_role USING (true) WITH CHECK (true);

-- orders
CREATE POLICY orders_own ON public.orders FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = orders.profile_id
    AND p.auth_user_id = COALESCE(auth.jwt() ->> 'sub', auth.uid()::text)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = orders.profile_id
    AND p.auth_user_id = COALESCE(auth.jwt() ->> 'sub', auth.uid()::text)));
CREATE POLICY orders_service_all ON public.orders FOR ALL TO service_role USING (true) WITH CHECK (true);

-- order_items
CREATE POLICY order_items_own ON public.order_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o JOIN public.profiles p ON p.id = o.profile_id
    WHERE o.id = order_items.order_id
    AND p.auth_user_id = COALESCE(auth.jwt() ->> 'sub', auth.uid()::text)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o JOIN public.profiles p ON p.id = o.profile_id
    WHERE o.id = order_items.order_id
    AND p.auth_user_id = COALESCE(auth.jwt() ->> 'sub', auth.uid()::text)));
CREATE POLICY order_items_service_all ON public.order_items FOR ALL TO service_role USING (true) WITH CHECK (true);

-- order_events
CREATE POLICY order_events_own ON public.order_events FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o JOIN public.profiles p ON p.id = o.profile_id
    WHERE o.id = order_events.order_id
    AND p.auth_user_id = COALESCE(auth.jwt() ->> 'sub', auth.uid()::text)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o JOIN public.profiles p ON p.id = o.profile_id
    WHERE o.id = order_events.order_id
    AND p.auth_user_id = COALESCE(auth.jwt() ->> 'sub', auth.uid()::text)));
CREATE POLICY order_events_service_all ON public.order_events FOR ALL TO service_role USING (true) WITH CHECK (true);

-- loyalty_activities
CREATE POLICY loyalty_activities_own ON public.loyalty_activities FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = loyalty_activities.profile_id
    AND p.auth_user_id = COALESCE(auth.jwt() ->> 'sub', auth.uid()::text)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = loyalty_activities.profile_id
    AND p.auth_user_id = COALESCE(auth.jwt() ->> 'sub', auth.uid()::text)));
CREATE POLICY loyalty_activities_service_all ON public.loyalty_activities FOR ALL TO service_role USING (true) WITH CHECK (true);

-- payment_methods
CREATE POLICY payment_methods_own ON public.payment_methods FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = payment_methods.profile_id
    AND p.auth_user_id = COALESCE(auth.jwt() ->> 'sub', auth.uid()::text)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = payment_methods.profile_id
    AND p.auth_user_id = COALESCE(auth.jwt() ->> 'sub', auth.uid()::text)));
CREATE POLICY payment_methods_service_all ON public.payment_methods FOR ALL TO service_role USING (true) WITH CHECK (true);

-- user_settings
CREATE POLICY user_settings_own ON public.user_settings FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = user_settings.profile_id
    AND p.auth_user_id = COALESCE(auth.jwt() ->> 'sub', auth.uid()::text)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = user_settings.profile_id
    AND p.auth_user_id = COALESCE(auth.jwt() ->> 'sub', auth.uid()::text)));
CREATE POLICY user_settings_service_all ON public.user_settings FOR ALL TO service_role USING (true) WITH CHECK (true);

-- user_notifications
CREATE POLICY user_notifications_own ON public.user_notifications FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = user_notifications.profile_id
    AND p.auth_user_id = COALESCE(auth.jwt() ->> 'sub', auth.uid()::text)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = user_notifications.profile_id
    AND p.auth_user_id = COALESCE(auth.jwt() ->> 'sub', auth.uid()::text)));
CREATE POLICY user_notifications_service_all ON public.user_notifications FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Public read-only tables (no RLS needed — everyone can read catalog)
ALTER TABLE public.catalog_products   DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_inventory  DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_collections DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons            DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_codes          DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_login_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets    DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_claimed_coupons DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- DONE
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE 'kadal_master_schema.sql applied successfully.';
END $$;

COMMIT;
