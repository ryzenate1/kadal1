-- Kadal Thunai: Admin order delivery/video fields + realtime coverage
-- Safe to run multiple times.

BEGIN;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS processing_video_url TEXT,
  ADD COLUMN IF NOT EXISTS delivery_person_name TEXT,
  ADD COLUMN IF NOT EXISTS delivery_person_phone TEXT,
  ADD COLUMN IF NOT EXISTS is_delivery_reached BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.order_events REPLICA IDENTITY FULL;

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
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'order_events'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.order_events';
  END IF;
END
$$;

COMMIT;
