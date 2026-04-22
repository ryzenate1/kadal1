-- Kadal Thunai: Clerk auth alignment for Supabase public schema
-- Run after schema.sql.
-- Safe to rerun.

BEGIN;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS auth_user_id TEXT;

DO $$
DECLARE
  current_type TEXT;
BEGIN
  SELECT data_type
    INTO current_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'auth_user_id';

  IF current_type = 'uuid' THEN
    ALTER TABLE public.profiles
      ALTER COLUMN auth_user_id TYPE TEXT USING auth_user_id::TEXT;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_auth_user_id_fkey'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      DROP CONSTRAINT profiles_auth_user_id_fkey;
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS ux_profiles_auth_user_id
ON public.profiles(auth_user_id)
WHERE auth_user_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.normalize_phone(p_phone TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  digits TEXT;
BEGIN
  digits := regexp_replace(COALESCE(p_phone, ''), '[^0-9]', '', 'g');

  IF length(digits) = 12 AND left(digits, 2) = '91' THEN
    digits := right(digits, 10);
  END IF;

  IF length(digits) = 10 THEN
    RETURN digits;
  END IF;

  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_profile_from_clerk(
  p_auth_user_id TEXT,
  p_name TEXT,
  p_email TEXT,
  p_phone_number TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id UUID;
  v_email TEXT;
  v_phone TEXT;
BEGIN
  IF p_auth_user_id IS NULL OR btrim(p_auth_user_id) = '' THEN
    RAISE EXCEPTION 'p_auth_user_id is required';
  END IF;

  v_email := NULLIF(lower(trim(COALESCE(p_email, ''))), '');
  v_phone := public.normalize_phone(p_phone_number);

  SELECT id
    INTO v_profile_id
  FROM public.profiles
  WHERE auth_user_id = p_auth_user_id
  LIMIT 1;

  IF v_profile_id IS NULL AND v_email IS NOT NULL THEN
    SELECT id
      INTO v_profile_id
    FROM public.profiles
    WHERE lower(email) = v_email
    ORDER BY updated_at DESC NULLS LAST, created_at DESC
    LIMIT 1;
  END IF;

  IF v_profile_id IS NULL AND v_phone IS NOT NULL THEN
    SELECT id
      INTO v_profile_id
    FROM public.profiles
    WHERE public.normalize_phone(phone_number) = v_phone
    ORDER BY updated_at DESC NULLS LAST, created_at DESC
    LIMIT 1;
  END IF;

  IF v_profile_id IS NULL THEN
    INSERT INTO public.profiles (auth_user_id, name, email, phone_number)
    VALUES (
      p_auth_user_id,
      COALESCE(NULLIF(trim(COALESCE(p_name, '')), ''), 'Kadal Customer'),
      v_email,
      v_phone
    )
    RETURNING id INTO v_profile_id;
  ELSE
    UPDATE public.profiles
    SET auth_user_id = COALESCE(auth_user_id, p_auth_user_id),
        name = COALESCE(NULLIF(trim(COALESCE(p_name, '')), ''), name),
        email = COALESCE(v_email, email),
        phone_number = COALESCE(v_phone, phone_number),
        updated_at = NOW()
    WHERE id = v_profile_id;
  END IF;

  RETURN v_profile_id;
END;
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
DROP POLICY IF EXISTS profiles_delete_own ON public.profiles;
DROP POLICY IF EXISTS addresses_all_own ON public.addresses;
DROP POLICY IF EXISTS orders_all_own ON public.orders;
DROP POLICY IF EXISTS order_items_all_own ON public.order_items;
DROP POLICY IF EXISTS order_events_all_own ON public.order_events;
DROP POLICY IF EXISTS loyalty_activities_all_own ON public.loyalty_activities;

CREATE POLICY profiles_select_own
ON public.profiles
FOR SELECT
TO authenticated
USING (auth_user_id = COALESCE(auth.jwt() ->> 'sub', auth.uid()::text));

CREATE POLICY profiles_insert_own
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth_user_id = COALESCE(auth.jwt() ->> 'sub', auth.uid()::text));

CREATE POLICY profiles_update_own
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth_user_id = COALESCE(auth.jwt() ->> 'sub', auth.uid()::text))
WITH CHECK (auth_user_id = COALESCE(auth.jwt() ->> 'sub', auth.uid()::text));

CREATE POLICY profiles_delete_own
ON public.profiles
FOR DELETE
TO authenticated
USING (auth_user_id = COALESCE(auth.jwt() ->> 'sub', auth.uid()::text));

CREATE POLICY addresses_all_own
ON public.addresses
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = addresses.profile_id
      AND p.auth_user_id = COALESCE(auth.jwt() ->> 'sub', auth.uid()::text)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = addresses.profile_id
      AND p.auth_user_id = COALESCE(auth.jwt() ->> 'sub', auth.uid()::text)
  )
);

CREATE POLICY orders_all_own
ON public.orders
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = orders.profile_id
      AND p.auth_user_id = COALESCE(auth.jwt() ->> 'sub', auth.uid()::text)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = orders.profile_id
      AND p.auth_user_id = COALESCE(auth.jwt() ->> 'sub', auth.uid()::text)
  )
);

CREATE POLICY order_items_all_own
ON public.order_items
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.orders o
    JOIN public.profiles p ON p.id = o.profile_id
    WHERE o.id = order_items.order_id
      AND p.auth_user_id = COALESCE(auth.jwt() ->> 'sub', auth.uid()::text)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.orders o
    JOIN public.profiles p ON p.id = o.profile_id
    WHERE o.id = order_items.order_id
      AND p.auth_user_id = COALESCE(auth.jwt() ->> 'sub', auth.uid()::text)
  )
);

CREATE POLICY order_events_all_own
ON public.order_events
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.orders o
    JOIN public.profiles p ON p.id = o.profile_id
    WHERE o.id = order_events.order_id
      AND p.auth_user_id = COALESCE(auth.jwt() ->> 'sub', auth.uid()::text)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.orders o
    JOIN public.profiles p ON p.id = o.profile_id
    WHERE o.id = order_events.order_id
      AND p.auth_user_id = COALESCE(auth.jwt() ->> 'sub', auth.uid()::text)
  )
);

CREATE POLICY loyalty_activities_all_own
ON public.loyalty_activities
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = loyalty_activities.profile_id
      AND p.auth_user_id = COALESCE(auth.jwt() ->> 'sub', auth.uid()::text)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = loyalty_activities.profile_id
      AND p.auth_user_id = COALESCE(auth.jwt() ->> 'sub', auth.uid()::text)
  )
);

COMMIT;
