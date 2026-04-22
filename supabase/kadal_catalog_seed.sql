-- ============================================================
-- Kadal Thunai: Catalog Products + Inventory Seed
-- Run in Supabase SQL Editor (safe to re-run — fully idempotent)
-- ============================================================

BEGIN;

-- ──────────────────────────────────────────────────────────
-- 1.  SCHEMA: catalog_products
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.catalog_products (
  id                  TEXT        PRIMARY KEY,
  slug                TEXT        NOT NULL UNIQUE,
  name                TEXT        NOT NULL,
  tanglish_name       TEXT,
  category            TEXT        NOT NULL DEFAULT 'Fresh Fish',
  type                TEXT        NOT NULL DEFAULT 'Marine Fish',
  description         TEXT        NOT NULL DEFAULT '',
  image_url           TEXT        NOT NULL DEFAULT '',
  base_price          NUMERIC(10,2) NOT NULL DEFAULT 0,
  rating              NUMERIC(3,1)  NOT NULL DEFAULT 4.0,
  omega3              TEXT,
  protein             TEXT,
  calories            TEXT,
  origin              TEXT,
  tags                TEXT[]      DEFAULT '{}',
  available_weights   JSONB       DEFAULT '[]',
  is_featured         BOOLEAN     NOT NULL DEFAULT FALSE,
  is_popular          BOOLEAN     NOT NULL DEFAULT FALSE,
  is_premium          BOOLEAN     NOT NULL DEFAULT FALSE,
  is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────
-- 2.  SCHEMA: catalog_inventory
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.catalog_inventory (
  product_id          TEXT        PRIMARY KEY
                        REFERENCES public.catalog_products(id) ON DELETE CASCADE,
  stock_quantity      INT         NOT NULL DEFAULT 20,
  low_stock_threshold INT         NOT NULL DEFAULT 5,
  allow_backorder     BOOLEAN     NOT NULL DEFAULT FALSE,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────
-- 3.  Helper: auto-update updated_at
-- ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_catalog_products_updated_at ON public.catalog_products;
CREATE TRIGGER trg_catalog_products_updated_at
  BEFORE UPDATE ON public.catalog_products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_catalog_inventory_updated_at ON public.catalog_inventory;
CREATE TRIGGER trg_catalog_inventory_updated_at
  BEFORE UPDATE ON public.catalog_inventory
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ──────────────────────────────────────────────────────────
-- 4.  SEED: Products
--     ON CONFLICT (id) DO UPDATE  →  fully idempotent
-- ──────────────────────────────────────────────────────────

-- ── Premium Large Fish ────────────────────────────────────

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('vanjaram-whole','vanjaram','Vanjaram (Seer Fish)','Vanjaram','Premium Fish','Premium Fish',
 'Premium seer fish known for its firm texture and rich flavor. Perfect for grilling, frying, or curry preparations.',
 '/images/fish/vangaram.jpg',899,4.8,'1.2g','22g','134 kcal','Chennai Coast',
 ARRAY['Premium','Popular','Good for Fry','Curry Special'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":2},{"value":"2kg","label":"2kg","multiplier":3.8}]',
 TRUE,TRUE,TRUE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('vanjaram-sliced','sliced-vanjaram','Vanjaram Slices (Seer Fish Slices)','Vanjaram Slices','Premium Fish','Premium Fish',
 'Pre-cut vanjaram slices, ready for cooking. Perfect for fish fry or quick curry preparations.',
 '/images/fish/sliced-vangaram.jpg',949,4.7,'1.2g','22g','134 kcal','Chennai Coast',
 ARRAY['Premium','Ready to Cook','Good for Fry','Boneless'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":2},{"value":"2kg","label":"2kg","multiplier":3.8}]',
 TRUE,TRUE,TRUE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('vanjaram-dried','dried-vanjaram','Vanjaram Karuvadu (Dried Seer Fish)','Vanjaram Karuvadu','Dried Fish','Dried Fish',
 'Traditional dried vanjaram fish. Rich in protein and authentic taste. Perfect for special occasions.',
 '/images/fish/dried-vangaram.webp',1299,4.5,'1.8g','35g','290 kcal','Tamil Nadu Coast',
 ARRAY['Traditional','Dried Fish','High Protein','Authentic'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":1.9},{"value":"2kg","label":"2kg","multiplier":3.6}]',
 TRUE,FALSE,TRUE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('tuna-whole','tuna','Soorai (Tuna Fish)','Soorai','Premium Fish','Premium Fish',
 'Fresh tuna with firm, meaty texture. Rich in protein and perfect for steaks.',
 '/images/fish/tuna-fish.jpg',1099,4.7,'1.6g','30g','144 kcal','Indian Ocean',
 ARRAY['High Protein','Meaty','Good for Steaks','Firm Texture'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":2},{"value":"2kg","label":"2kg","multiplier":3.8}]',
 TRUE,TRUE,TRUE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('tuna-slices','tuna-slices','Soorai Slices (Tuna Slices)','Soorai Slices','Premium Fish','Premium Fish',
 'Pre-cut tuna slices ready for cooking. Perfect for quick steak preparations.',
 '/images/fish/tuna-slices.jpg',1199,4.6,'1.6g','30g','144 kcal','Indian Ocean',
 ARRAY['Ready to Cook','High Protein','Quick Cooking','Boneless'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":2},{"value":"2kg","label":"2kg","multiplier":3.8}]',
 TRUE,TRUE,TRUE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('salmon','salmon','Kaala Meen (Salmon Fish)','Kaala Meen','Premium Fish','Premium Fish',
 'Premium salmon rich in omega-3 fatty acids. Perfect for healthy cooking and grilling.',
 '/images/fish/salmon.jpg',1299,4.9,'2.3g','25g','208 kcal','Atlantic Ocean',
 ARRAY['Premium','Healthy','High Omega-3','International'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":2},{"value":"2kg","label":"2kg","multiplier":3.8}]',
 TRUE,TRUE,TRUE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('red-snapper','red-snapper','Sevval Meen (Red Snapper)','Sevval Meen','Premium Fish','Reef Fish',
 'Beautiful red snapper with sweet, nutty flavor. Excellent for whole fish preparations.',
 '/images/fish/red-snapper.jpg',1199,4.8,'0.4g','22g','109 kcal','Gulf Waters',
 ARRAY['Colorful','Sweet','Good for Whole Fish','Beautiful'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":2},{"value":"2kg","label":"2kg","multiplier":3.8}]',
 TRUE,TRUE,TRUE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('hilsa','hilsa','Ilish Meen (Hilsa Fish)','Ilish Meen','Premium Fish','River Fish',
 'The king of fish with rich, distinctive flavor. Perfect for Bengali-style preparations.',
 '/images/fish/hilsa.jpg',1399,4.8,'2.5g','24g','310 kcal','River Ganges',
 ARRAY['King of Fish','Rich Flavor','Bengali Special','Premium'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":2},{"value":"2kg","label":"2kg","multiplier":3.8}]',
 TRUE,TRUE,TRUE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('sea-bass','sea-bass','Koduva Meen (Sea Bass)','Koduva Meen','Premium Fish','Premium Fish',
 'Premium sea bass with delicate flavor and firm texture. Perfect for fine dining preparations.',
 '/images/fish/sea-bass.jpg',1599,4.7,'0.8g','24g','125 kcal','Mediterranean Sea',
 ARRAY['Premium','Fine Dining','Delicate','White Fish'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":2},{"value":"2kg","label":"2kg","multiplier":3.8}]',
 TRUE,FALSE,TRUE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('branzino','branzino','Velai Meen (European Sea Bass)','Velai Meen','Premium Fish','Premium Fish',
 'Mediterranean branzino with mild, sweet flavor. Perfect for grilling and roasting.',
 '/images/fish/branzino.jpg',1799,4.6,'0.9g','20g','140 kcal','Mediterranean Sea',
 ARRAY['Mediterranean','Mild Flavor','Good for Grill','Premium'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":2},{"value":"2kg","label":"2kg","multiplier":3.8}]',
 TRUE,FALSE,TRUE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('swordfish','swordfish','Nilai Meen (Swordfish)','Nilai Meen','Premium Fish','Premium Fish',
 'Meaty swordfish with firm texture. Excellent for grilling and steak preparations.',
 '/images/fish/swordfish.jpg',1399,4.5,'1.0g','22g','155 kcal','Deep Ocean',
 ARRAY['Meaty','Firm Texture','Good for Steaks','Large Fish'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":2},{"value":"2kg","label":"2kg","multiplier":3.8}]',
 TRUE,FALSE,TRUE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('mahi-mahi','mahi-mahi','Avoli Meen (Mahi Mahi)','Avoli Meen','Premium Fish','Premium Fish',
 'Tropical mahi mahi with sweet, mild flavor. Perfect for grilling and pan-frying.',
 '/images/fish/mahi-mahi.jpg',1299,4.4,'0.2g','20g','110 kcal','Tropical Waters',
 ARRAY['Tropical','Sweet','Mild','Good for Pan-fry'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":2},{"value":"2kg","label":"2kg","multiplier":3.8}]',
 FALSE,FALSE,TRUE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('halibut','halibut','Vella Meen (Halibut)','Vella Meen','Premium Fish','Premium Fish',
 'Large flatfish with firm, white meat. Excellent for steaks and fine dining.',
 '/images/fish/halibut.jpg',1899,4.6,'0.6g','23g','119 kcal','North Pacific',
 ARRAY['Large Fish','White Meat','Fine Dining','Firm Texture'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":2},{"value":"2kg","label":"2kg","multiplier":3.8}]',
 TRUE,FALSE,TRUE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

-- ── White Fish ────────────────────────────────────────────

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('cod','cod','Koduva Meen (Cod Fish)','Koduva Meen','Fresh Fish','White Fish',
 'Classic white fish with mild flavor and flaky texture. Perfect for fish and chips.',
 '/images/fish/cod.jpg',999,4.3,'0.2g','18g','82 kcal','North Atlantic',
 ARRAY['Classic','Mild','Flaky','Good for Fry'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":2},{"value":"2kg","label":"2kg","multiplier":3.8}]',
 TRUE,TRUE,FALSE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('haddock','haddock','Sankara Meen (Haddock)','Sankara Meen','Fresh Fish','White Fish',
 'White fish with slightly sweet flavor. Popular for fish and chips and baking.',
 '/images/fish/haddock.jpg',899,4.2,'0.2g','20g','90 kcal','North Atlantic',
 ARRAY['White Fish','Sweet','Good for Baking','Classic'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":2},{"value":"2kg","label":"2kg","multiplier":3.8}]',
 TRUE,TRUE,FALSE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

-- ── Flatfish ──────────────────────────────────────────────

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('flounder','flounder','Naakai Meen (Flounder)','Naakai Meen','Fresh Fish','Flatfish',
 'Flatfish with delicate, mild flavor. Perfect for pan-frying and baking.',
 '/images/fish/flounder.jpg',799,4.1,'0.4g','20g','100 kcal','Coastal Waters',
 ARRAY['Flatfish','Mild','Delicate','Good for Pan-fry'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":2},{"value":"2kg","label":"2kg","multiplier":3.8}]',
 FALSE,FALSE,FALSE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('butter-sole','butter-sole','Naaval Meen (Butter Sole)','Naaval Meen','Premium Fish','Flatfish',
 'Delicate sole with buttery texture. Premium flatfish perfect for fine dining.',
 '/images/fish/butter-sole.jpg',1299,4.5,'0.4g','17g','104 kcal','European Coast',
 ARRAY['Delicate','Buttery','Fine Dining','Premium Flatfish'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":2},{"value":"2kg","label":"2kg","multiplier":3.8}]',
 TRUE,FALSE,TRUE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

-- ── Freshwater Fish ───────────────────────────────────────

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('tilapia','tilapia','Jilapi Meen (Tilapia)','Jilapi Meen','Freshwater Fish','Freshwater Fish',
 'Freshwater fish with mild flavor. Versatile and affordable for everyday cooking.',
 '/images/fish/tilapia.jpg',549,4.0,'0.1g','26g','128 kcal','Freshwater Farms',
 ARRAY['Freshwater','Mild','Affordable','Versatile'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":2},{"value":"2kg","label":"2kg","multiplier":3.8}]',
 TRUE,TRUE,FALSE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('trout','trout','Kalanji Meen (Trout)','Kalanji Meen','Freshwater Fish','Freshwater Fish',
 'Freshwater trout with delicate flavor. Perfect for pan-frying and grilling.',
 '/images/fish/trout.jpg',899,4.3,'1.0g','21g','140 kcal','Mountain Streams',
 ARRAY['Freshwater','Delicate','Good for Grill','Healthy'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":2},{"value":"2kg","label":"2kg","multiplier":3.8}]',
 FALSE,FALSE,FALSE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('katla','katla','Katla Meen (Katla Fish)','Katla Meen','Freshwater Fish','Freshwater Fish',
 'Popular freshwater fish with sweet taste. Great for curry and traditional preparations.',
 '/images/fish/katla.jpg',649,4.2,'0.4g','19g','97 kcal','River Systems',
 ARRAY['Freshwater','Sweet','Good for Curry','Traditional'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":2},{"value":"2kg","label":"2kg","multiplier":3.8}]',
 TRUE,TRUE,FALSE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

-- ── Marine / Trevally Family ──────────────────────────────

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('big-paarai','big-paarai-fish','Periya Paarai (Big Trevally)','Periya Paarai','Fresh Fish','Marine Fish',
 'Large trevally fish with firm, white meat. Excellent for grilling and traditional fish preparations.',
 '/images/fish/big-paarai-fish.jpg',749,4.6,'0.8g','24g','128 kcal','Bay of Bengal',
 ARRAY['Premium','Large Fish','Good for Grill','Firm Texture'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":2},{"value":"2kg","label":"2kg","multiplier":3.8}]',
 TRUE,TRUE,TRUE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('paarai-regular','paarai-fish','Paarai (Trevally)','Paarai','Fresh Fish','Marine Fish',
 'Regular sized trevally fish. Great for curry preparations and family meals.',
 '/images/fish/paarai-fish.jpg',649,4.4,'0.8g','24g','128 kcal','Bay of Bengal',
 ARRAY['Popular','Family Size','Good for Curry','Affordable'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":2},{"value":"2kg","label":"2kg","multiplier":3.8}]',
 TRUE,TRUE,FALSE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('yellow-paarai','yellow-paarai','Manjal Paarai (Yellow Trevally)','Manjal Paarai','Fresh Fish','Marine Fish',
 'Yellow variety of trevally fish. Known for its distinctive color and taste.',
 '/images/fish/yellow-parai.jpg',699,4.5,'0.9g','23g','135 kcal','South Indian Coast',
 ARRAY['Colorful','Unique','Good for Fry','Medium Size'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":2},{"value":"2kg","label":"2kg","multiplier":3.8}]',
 FALSE,FALSE,FALSE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

-- ── Oily / Small Fish ─────────────────────────────────────

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('mackerel','ayala','Ayala (Mackerel)','Ayala','Fresh Fish','Oily Fish',
 'Oily fish rich in omega-3. Perfect for frying and traditional curry preparations.',
 '/images/fish/mackerel.jpg',449,4.6,'2.5g','20g','190 kcal','Indian Ocean',
 ARRAY['Oily Fish','High Omega-3','Popular','Good for Fry'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":1.9},{"value":"2kg","label":"2kg","multiplier":3.6}]',
 TRUE,TRUE,FALSE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('sardines','sardines','Mathi (Sardines)','Mathi','Fresh Fish','Small Fish',
 'Small oily fish packed with nutrients. Perfect for quick frying and curries.',
 '/images/fish/sardines.jpg',349,4.4,'1.4g','24g','135 kcal','Coastal Waters',
 ARRAY['Small Fish','Nutrient Rich','Quick Fry','Affordable'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":1.9},{"value":"2kg","label":"2kg","multiplier":3.6}]',
 TRUE,TRUE,FALSE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('herring','herring','Herring Mathi (Herring)','Herring Mathi','Fresh Fish','Oily Fish',
 'Oily fish with rich flavor. Excellent source of omega-3 fatty acids.',
 '/images/fish/herring.jpg',549,4.3,'1.7g','18g','158 kcal','North Sea',
 ARRAY['Oily Fish','Rich Flavor','High Omega-3','Nutritious'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":1.9},{"value":"2kg","label":"2kg","multiplier":3.6}]',
 FALSE,FALSE,FALSE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('anchovies','anchovies','Nethili (Anchovies)','Nethili','Fresh Fish','Small Fish',
 'Small, flavorful fish perfect for frying. Rich in calcium and protein.',
 '/images/fish/anchovies.jpg',299,4.2,'1.8g','22g','175 kcal','Coastal Waters',
 ARRAY['Small Fish','High Protein','Rich Flavor','Calcium Rich'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":1.9},{"value":"2kg","label":"2kg","multiplier":3.6}]',
 TRUE,TRUE,FALSE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('mathi-fish','mathi-fish','Mathi (Oil Sardine)','Mathi','Fresh Fish','Local Fish',
 'Local variety of sardine with rich oil content. Perfect for traditional Kerala preparations.',
 '/images/fish/mathi-fish.jpg',399,4.5,'1.8g','24g','190 kcal','Kerala Coast',
 ARRAY['Local Favorite','Oily Fish','Traditional','Kerala Special'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":1.9},{"value":"2kg","label":"2kg","multiplier":3.6}]',
 TRUE,TRUE,FALSE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('nethili','nethili','Nethili (White Anchovy)','Nethili','Fresh Fish','Small Fish',
 'Small white anchovy perfect for frying. Local favorite with delicate flavor.',
 '/images/fish/nethili.jpg',329,4.3,'1.2g','27g','195 kcal','Tamil Nadu Coast',
 ARRAY['Small Fish','Delicate','Local Favorite','High Protein'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":1.9},{"value":"2kg","label":"2kg","multiplier":3.6}]',
 TRUE,TRUE,FALSE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

-- ── Local / Regional Fish ─────────────────────────────────

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('koduva','koduva','Koduva (Koduva Fish)','Koduva','Fresh Fish','Local Fish',
 'Local coastal fish with firm texture. Great for curry and traditional preparations.',
 '/images/fish/koduva.jpg',599,4.2,'0.9g','22g','125 kcal','South Indian Coast',
 ARRAY['Local Fish','Firm Texture','Good for Curry','Traditional'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":2},{"value":"2kg","label":"2kg","multiplier":3.8}]',
 FALSE,FALSE,FALSE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('small-koduva','small-koduva','Chinna Koduva (Small Koduva)','Chinna Koduva','Fresh Fish','Small Fish',
 'Small variety of koduva fish. Perfect for quick frying and home cooking.',
 '/images/fish/small-koduva.jpg',449,4.1,'0.8g','21g','118 kcal','South Indian Coast',
 ARRAY['Small Fish','Quick Fry','Home Cooking','Affordable'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":1.9},{"value":"2kg","label":"2kg","multiplier":3.6}]',
 FALSE,FALSE,FALSE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('kalava','kalava','Kalava (Kalava Fish)','Kalava','Fresh Fish','Local Fish',
 'Local fish with distinctive taste. Popular in Tamil Nadu coastal cuisine.',
 '/images/fish/kalava.jpg',549,4.0,'0.7g','20g','115 kcal','Tamil Nadu Coast',
 ARRAY['Local Fish','Distinctive Taste','Tamil Cuisine','Regional'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":2},{"value":"2kg","label":"2kg","multiplier":3.8}]',
 FALSE,FALSE,FALSE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

-- ── Pomfret ───────────────────────────────────────────────

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('karuva-vaval','karuva-vaval','Karuva Vaval (Black Pomfret)','Karuva Vaval','Premium Fish','Premium Fish',
 'Black pomfret with rich flavor. Premium fish perfect for special occasions.',
 '/images/fish/karuva-vaval.jpg',1099,4.6,'0.9g','25g','165 kcal','Bay of Bengal',
 ARRAY['Premium','Rich Flavor','Special Occasion','Black Pomfret'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":2},{"value":"2kg","label":"2kg","multiplier":3.8}]',
 TRUE,FALSE,TRUE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('white-vaval','white-vaval','Vella Vaval (White Pomfret)','Vella Vaval','Premium Fish','Premium Fish',
 'White pomfret with delicate flavor. Premium fish with fine texture.',
 '/images/fish/white-vaval.jpg',1199,4.7,'0.8g','24g','155 kcal','Arabian Sea',
 ARRAY['Premium','Delicate','Fine Texture','White Pomfret'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":2},{"value":"2kg","label":"2kg","multiplier":3.8}]',
 TRUE,TRUE,TRUE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('kola-fish','kola-fish','Kola Meen (Kola Fish)','Kola Meen','Fresh Fish','Local Fish',
 'Local fish variety with unique taste. Popular in South Indian coastal regions.',
 '/images/fish/kola-fish.jpg',599,4.0,'0.6g','21g','110 kcal','South Indian Coast',
 ARRAY['Local Fish','Unique Taste','South Indian','Regional'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":2},{"value":"2kg","label":"2kg","multiplier":3.8}]',
 FALSE,FALSE,FALSE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('shankara-fish','shankara-fish','Shankara (Shankara Fish)','Shankara','Fresh Fish','Marine Fish',
 'Local marine fish with firm texture. Good for curry and traditional preparations.',
 '/images/fish/shankara-fish.jpg',649,4.1,'0.7g','22g','120 kcal','Bay of Bengal',
 ARRAY['Local Fish','Firm Texture','Good for Curry','Marine'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":2},{"value":"2kg","label":"2kg","multiplier":3.8}]',
 FALSE,FALSE,FALSE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('sheela-fish','sheela-fish','Sheela (Sheela Fish)','Sheela','Fresh Fish','Local Fish',
 'Local fish with sweet taste. Perfect for home cooking and family meals.',
 '/images/fish/sheela-fish.jpg',549,4.0,'0.5g','20g','105 kcal','Coastal Waters',
 ARRAY['Local Fish','Sweet Taste','Home Cooking','Family Meals'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":2},{"value":"2kg","label":"2kg","multiplier":3.8}]',
 FALSE,FALSE,FALSE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('paal-sura','paal-sura','Paal Sura (Milk Shark)','Paal Sura','Fresh Fish','Shark',
 'Small shark with tender meat. Popular in Tamil Nadu for its unique taste.',
 '/images/fish/Paal-sura.jpg',799,4.3,'0.8g','26g','150 kcal','Bay of Bengal',
 ARRAY['Shark','Tender Meat','Unique Taste','Tamil Favorite'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":2},{"value":"2kg","label":"2kg","multiplier":3.8}]',
 FALSE,FALSE,FALSE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('oilfish','oilfish','Enna Meen (Oil Fish)','Enna Meen','Fresh Fish','Oily Fish',
 'Fish with high oil content. Rich in omega-3 and perfect for traditional preparations.',
 '/images/fish/oilfish.jpg',749,4.2,'2.2g','23g','185 kcal','Deep Sea',
 ARRAY['High Oil','Rich Omega-3','Traditional','Nutritious'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":2},{"value":"2kg","label":"2kg","multiplier":3.8}]',
 FALSE,FALSE,FALSE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

-- ── Shellfish & Crustaceans ───────────────────────────────

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('big-prawns','big-prawns','Periya Eral (Jumbo Prawns)','Periya Eral','Seafood','Prawns',
 'Large premium prawns with sweet, tender meat. Perfect for special occasions and grilling.',
 '/images/fish/big-prawn.webp',1199,4.9,'0.5g','18g','105 kcal','Bay of Bengal',
 ARRAY['Premium','Shellfish','Good for Grill','Party Special'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":2.1},{"value":"2kg","label":"2kg","multiplier":4.0}]',
 TRUE,TRUE,TRUE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('sea-prawns','sea-prawns','Kadal Eral (Sea Prawns)','Kadal Eral','Seafood','Prawns',
 'Fresh sea prawns with natural sweetness. Great for curry and biryani preparations.',
 '/images/fish/sea-prawn.webp',899,4.6,'0.4g','17g','99 kcal','Arabian Sea',
 ARRAY['Fresh','Sweet','Good for Curry','Biryani Special'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":2.1},{"value":"2kg","label":"2kg","multiplier":4.0}]',
 TRUE,TRUE,FALSE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('blue-crabs','blue-crabs','Neelambu Nandu (Blue Crabs)','Neelambu Nandu','Seafood','Crabs',
 'Fresh blue crabs with sweet, delicate meat. Perfect for traditional crab curry.',
 '/images/fish/blue-crabs.jpg',999,4.7,'0.4g','16g','97 kcal','Backwaters',
 ARRAY['Fresh','Sweet Meat','Traditional','Backwater Special'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":2},{"value":"2kg","label":"2kg","multiplier":3.8}]',
 TRUE,TRUE,FALSE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('normal-crabs','normal-crabs','Nandu (Mud Crabs)','Nandu','Seafood','Crabs',
 'Regular mud crabs with firm meat. Great for home cooking and traditional preparations.',
 '/images/fish/normal crabs.jpg',749,4.3,'0.3g','15g','90 kcal','Coastal Areas',
 ARRAY['Affordable','Home Cooking','Traditional','Firm Meat'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":2},{"value":"2kg","label":"2kg","multiplier":3.8}]',
 FALSE,FALSE,FALSE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('fresh-lobster','fresh-lobster','Konju (Fresh Lobster)','Konju','Seafood','Lobster',
 'Premium fresh lobster with sweet, tender meat. Perfect for special occasions.',
 '/images/fish/lobster.jpg',1899,4.9,'0.4g','19g','112 kcal','Deep Sea',
 ARRAY['Premium','Luxury','Special Occasion','Sweet Meat'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":2},{"value":"2kg","label":"2kg","multiplier":3.8}]',
 TRUE,TRUE,TRUE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('squid','squid','Kanava (Squid)','Kanava','Seafood','Cephalopod',
 'Fresh squid with tender texture. Great for frying, grilling, and traditional preparations.',
 '/images/fish/squid.jpg',899,4.4,'0.6g','16g','92 kcal','Arabian Sea',
 ARRAY['Tender','Good for Fry','Unique Texture','Versatile'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":2},{"value":"2kg","label":"2kg","multiplier":3.8}]',
 TRUE,TRUE,FALSE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('variety-fishes','variety-fishes','Kala Meen (Mixed Seafood)','Kala Meen','Seafood','Mixed Seafood',
 'Assorted variety of fresh seafood. Perfect for mixed seafood preparations.',
 '/images/fish/vareity-fishes.jpg',799,4.5,'1.2g','20g','135 kcal','Mixed Sources',
 ARRAY['Variety','Mixed Seafood','Assorted','Value Pack'],
 '[{"value":"250g","label":"250g","multiplier":0.5},{"value":"500g","label":"500g","multiplier":1},{"value":"1kg","label":"1kg","multiplier":2},{"value":"2kg","label":"2kg","multiplier":3.8}]',
 TRUE,TRUE,FALSE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  omega3=EXCLUDED.omega3, protein=EXCLUDED.protein, calories=EXCLUDED.calories,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

-- ── Fish Combo (catalogData.ts) ───────────────────────────

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('prd-1','family-fish-combo','Family Fish Combo',NULL,'Fish Combo','Combo',
 'A balanced fish combo for family meals.',
 '/images/fish/vanjaram.jpg',699,4.5,NULL,NULL,NULL,'Kadal curated',
 ARRAY['fish-combo','Combo'],
 '[{"value":"1 pack","label":"1 pack","multiplier":1}]',
 TRUE,TRUE,FALSE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('prd-2','weekend-grill-combo','Weekend Grill Combo',NULL,'Fish Combo','Combo',
 'Premium cuts suited for grilling.',
 '/images/fish/red-snapper.jpg',899,4.6,NULL,NULL,NULL,'Kadal curated',
 ARRAY['fish-combo','Combo'],
 '[{"value":"1 pack","label":"1 pack","multiplier":1}]',
 TRUE,TRUE,FALSE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

INSERT INTO public.catalog_products
  (id, slug, name, tanglish_name, category, type, description, image_url,
   base_price, rating, omega3, protein, calories, origin, tags, available_weights,
   is_featured, is_popular, is_premium)
VALUES
('prd-3','tiger-prawns','Tiger Prawns',NULL,'Seafood','Prawns',
 'Large tiger prawns, cleaned and chilled.',
 '/images/fish/sea-prawn.webp',599,4.7,NULL,NULL,NULL,'Kadal curated',
 ARRAY['seafood','Prawns'],
 '[{"value":"500g","label":"500g","multiplier":1}]',
 TRUE,TRUE,FALSE)
ON CONFLICT (id) DO UPDATE SET
  slug=EXCLUDED.slug, name=EXCLUDED.name, tanglish_name=EXCLUDED.tanglish_name,
  category=EXCLUDED.category, type=EXCLUDED.type, description=EXCLUDED.description,
  image_url=EXCLUDED.image_url, base_price=EXCLUDED.base_price, rating=EXCLUDED.rating,
  origin=EXCLUDED.origin, tags=EXCLUDED.tags, available_weights=EXCLUDED.available_weights,
  is_featured=EXCLUDED.is_featured, is_popular=EXCLUDED.is_popular, is_premium=EXCLUDED.is_premium,
  is_active=TRUE, updated_at=NOW();

-- ──────────────────────────────────────────────────────────
-- 5.  SEED: Inventory (insert-only; never overwrite stock)
-- ──────────────────────────────────────────────────────────
INSERT INTO public.catalog_inventory (product_id, stock_quantity, low_stock_threshold, allow_backorder)
SELECT id,
       CASE WHEN is_featured THEN 30 ELSE 18 END,
       5,
       FALSE
FROM   public.catalog_products
ON CONFLICT (product_id) DO NOTHING;

-- ──────────────────────────────────────────────────────────
-- 6.  Sanity check
-- ──────────────────────────────────────────────────────────
DO $$
DECLARE
  prod_count INT;
  inv_count  INT;
BEGIN
  SELECT COUNT(*) INTO prod_count FROM public.catalog_products;
  SELECT COUNT(*) INTO inv_count  FROM public.catalog_inventory;
  RAISE NOTICE 'Seed complete: % products, % inventory rows', prod_count, inv_count;
END;
$$;

COMMIT;
