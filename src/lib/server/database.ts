import { Pool, PoolClient } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not configured');
}

const globalForDb = globalThis as unknown as {
  kadalPool?: Pool;
  kadalSchemaReady?: Promise<void>;
};

// Build connection URL.
// Supabase exposes two endpoints:
//   - port 5432 : direct / session mode  (supports DDL, prepared statements)
//   - port 6543 : transaction pooler      (does NOT support DDL or SET commands)
// The schema migration needs session mode so we always use port 5432.
// If the env var already contains 6543 we rewrite it to 5432 so DDL works.
function toSessionUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.port === '6543') {
      u.port = '5432';
    }
    return u.toString();
  } catch {
    return url;
  }
}

const SESSION_URL = toSessionUrl(DATABASE_URL);

export const db =
  globalForDb.kadalPool ??
  new Pool({
    connectionString: SESSION_URL,
    ssl: { rejectUnauthorized: false },
    // Serverless-friendly pool sizing:
    max: 3,                // keep a small pool — Next.js can spawn many workers
    idleTimeoutMillis: 30_000,   // release idle connections after 30 s
    connectionTimeoutMillis: 10_000, // fail fast instead of hanging
  });

if (!globalForDb.kadalPool) {
  globalForDb.kadalPool = db;
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema SQL — split into safe independent statements so one failure does not
// abort the rest.  Every statement uses IF NOT EXISTS / IF EXISTS guards.
// ─────────────────────────────────────────────────────────────────────────────
const schemaSqlStatements = [
  `CREATE EXTENSION IF NOT EXISTS pgcrypto`,

  // ── Core tables ──────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id TEXT UNIQUE,
    name TEXT NOT NULL DEFAULT 'Kadal Customer',
    email TEXT UNIQUE,
    phone_number TEXT,
    profile_image TEXT,
    loyalty_points INTEGER NOT NULL DEFAULT 0,
    notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    notif_order_updates BOOLEAN NOT NULL DEFAULT TRUE,
    notif_promotions BOOLEAN NOT NULL DEFAULT TRUE,
    notif_loyalty_updates BOOLEAN NOT NULL DEFAULT TRUE,
    notif_newsletter BOOLEAN NOT NULL DEFAULT FALSE,
    notif_sms BOOLEAN NOT NULL DEFAULT TRUE,
    notif_email BOOLEAN NOT NULL DEFAULT TRUE,
    notif_push BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  // ── ADD COLUMN IF NOT EXISTS guards (idempotent on existing DBs) ─────────
  `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notif_order_updates BOOLEAN NOT NULL DEFAULT TRUE`,
  `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notif_promotions    BOOLEAN NOT NULL DEFAULT TRUE`,
  `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notif_loyalty_updates BOOLEAN NOT NULL DEFAULT TRUE`,
  `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notif_newsletter    BOOLEAN NOT NULL DEFAULT FALSE`,
  `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notif_sms           BOOLEAN NOT NULL DEFAULT TRUE`,
  `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notif_email         BOOLEAN NOT NULL DEFAULT TRUE`,
  `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notif_push          BOOLEAN NOT NULL DEFAULT TRUE`,
  `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auth_user_id        TEXT`,
  `DO $$
   BEGIN
     IF EXISTS (
       SELECT 1
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'profiles'
         AND column_name = 'auth_user_id'
         AND data_type <> 'text'
     ) THEN
       ALTER TABLE profiles
       ALTER COLUMN auth_user_id TYPE TEXT
       USING auth_user_id::text;
     END IF;
   END $$`,
  `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_number        TEXT`,
  `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_image       TEXT`,
  `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at          TIMESTAMPTZ DEFAULT NOW()`,
  `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at          TIMESTAMPTZ DEFAULT NOW()`,

  `CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone_number TEXT,
    address TEXT NOT NULL,
    city TEXT,
    state TEXT,
    pincode TEXT,
    type TEXT NOT NULL DEFAULT 'home',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `ALTER TABLE addresses ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'home'`,

  `CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    nickname TEXT NOT NULL,
    provider TEXT,
    masked_value TEXT,
    card_holder_name TEXT,
    expiry_date TEXT,
    upi_id TEXT,
    bank_name TEXT,
    account_last4 TEXT,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'confirmed',
    total_amount NUMERIC(12,2) NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    payment_method TEXT NOT NULL,
    tracking_number TEXT UNIQUE,
    estimated_delivery TIMESTAMPTZ,
    shipping_name TEXT NOT NULL,
    shipping_phone TEXT,
    shipping_address TEXT NOT NULL,
    shipping_city TEXT,
    shipping_state TEXT,
    shipping_pincode TEXT,
    delivery_slot TEXT,
    points_earned INTEGER NOT NULL DEFAULT 0,
    processing_video_url TEXT,
    delivery_person_name TEXT,
    delivery_person_phone TEXT,
    is_delivery_reached BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `ALTER TABLE orders ADD COLUMN IF NOT EXISTS processing_video_url  TEXT`,
  `ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_person_name  TEXT`,
  `ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_person_phone TEXT`,
  `ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_delivery_reached   BOOLEAN NOT NULL DEFAULT FALSE`,
  `ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id     TEXT`,
  `ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id   TEXT`,
  `ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_signature    TEXT`,
  `ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_verified_at   TIMESTAMPTZ`,

  `CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT,
    product_name TEXT NOT NULL,
    product_image TEXT,
    quantity INTEGER NOT NULL,
    price NUMERIC(12,2) NOT NULL,
    weight TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS order_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS loyalty_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    points INTEGER NOT NULL,
    description TEXT NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS loyalty_claimed_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    points_redeemed INTEGER NOT NULL,
    discount_amount NUMERIC(12,2) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    used_at TIMESTAMPTZ,
    used_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    attempts INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS auth_login_attempts (
    identity_key TEXT PRIMARY KEY,
    failed_count INTEGER NOT NULL DEFAULT 0,
    blocked_until TIMESTAMPTZ,
    last_failed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    user_name TEXT,
    user_email TEXT,
    user_phone TEXT,
    subject TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    message TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'normal',
    status TEXT NOT NULL DEFAULT 'open',
    admin_response TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    type TEXT NOT NULL DEFAULT 'percentage',
    discount_value NUMERIC(12,2),
    discount_label TEXT,
    min_order NUMERIC(12,2) NOT NULL DEFAULT 0,
    valid_until TIMESTAMPTZ,
    usage_limit INTEGER,
    used_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS user_settings (
    profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    theme TEXT NOT NULL DEFAULT 'system',
    language TEXT NOT NULL DEFAULT 'en',
    currency TEXT NOT NULL DEFAULT 'INR',
    profile_visibility TEXT NOT NULL DEFAULT 'private',
    search_history BOOLEAN NOT NULL DEFAULT TRUE,
    analytics BOOLEAN NOT NULL DEFAULT TRUE,
    cookies BOOLEAN NOT NULL DEFAULT TRUE,
    high_contrast BOOLEAN NOT NULL DEFAULT FALSE,
    large_text BOOLEAN NOT NULL DEFAULT FALSE,
    reduced_motion BOOLEAN NOT NULL DEFAULT FALSE,
    screen_reader BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS user_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL,
    source_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(profile_id, source_type, source_id)
  )`,

  // ── Catalog ───────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS catalog_products (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    tanglish_name TEXT,
    category TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    base_price NUMERIC(12,2) NOT NULL,
    rating NUMERIC(4,2) NOT NULL DEFAULT 0,
    omega3 TEXT,
    protein TEXT,
    calories TEXT,
    origin TEXT,
    tags TEXT[] NOT NULL DEFAULT '{}',
    available_weights JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_popular BOOLEAN NOT NULL DEFAULT FALSE,
    is_premium BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS catalog_inventory (
    product_id TEXT PRIMARY KEY REFERENCES catalog_products(id) ON DELETE CASCADE,
    stock_quantity INTEGER NOT NULL DEFAULT 25,
    low_stock_threshold INTEGER NOT NULL DEFAULT 5,
    allow_backorder BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS premium_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL REFERENCES catalog_products(id) ON DELETE CASCADE,
    tag TEXT,
    discount_percent INTEGER NOT NULL DEFAULT 0,
    default_weight TEXT NOT NULL DEFAULT '500g',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(product_id)
  )`,

  // ── Indexes ───────────────────────────────────────────────────────────────
  `CREATE INDEX IF NOT EXISTS idx_catalog_products_slug     ON catalog_products(slug)`,
  `CREATE INDEX IF NOT EXISTS idx_catalog_products_category ON catalog_products(category)`,
  `CREATE INDEX IF NOT EXISTS idx_catalog_products_featured ON catalog_products(is_featured, is_active)`,
  `CREATE INDEX IF NOT EXISTS idx_premium_collections_active_order ON premium_collections(is_active, display_order, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_orders_profile_id         ON orders(profile_id)`,
  `CREATE INDEX IF NOT EXISTS idx_orders_tracking_number    ON orders(tracking_number)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS ux_orders_razorpay_payment_id
    ON orders(razorpay_payment_id)
    WHERE razorpay_payment_id IS NOT NULL`,
  `CREATE INDEX IF NOT EXISTS idx_auth_login_attempts_blocked_until ON auth_login_attempts(blocked_until)`,
  `CREATE INDEX IF NOT EXISTS idx_order_items_order_id      ON order_items(order_id)`,
  `CREATE INDEX IF NOT EXISTS idx_order_events_order_id     ON order_events(order_id)`,
  `CREATE INDEX IF NOT EXISTS idx_addresses_profile_id      ON addresses(profile_id)`,
  `CREATE INDEX IF NOT EXISTS idx_payment_methods_profile_id ON payment_methods(profile_id)`,
  `CREATE INDEX IF NOT EXISTS idx_loyalty_activities_profile_id ON loyalty_activities(profile_id)`,
  `CREATE INDEX IF NOT EXISTS idx_loyalty_claimed_coupons_profile_id ON loyalty_claimed_coupons(profile_id, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_loyalty_claimed_coupons_active ON loyalty_claimed_coupons(profile_id, is_used, expires_at)`,
  `CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id   ON support_tickets(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_support_tickets_status    ON support_tickets(status)`,
  `CREATE INDEX IF NOT EXISTS idx_coupons_active            ON coupons(is_active)`,
  `CREATE INDEX IF NOT EXISTS idx_user_notifications_profile ON user_notifications(profile_id, is_read, created_at DESC)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS ux_profiles_auth_user_id ON profiles(auth_user_id) WHERE auth_user_id IS NOT NULL`,
];

// ─────────────────────────────────────────────────────────────────────────────
// Error classification
// ─────────────────────────────────────────────────────────────────────────────
const ignorableSqlErrorCodes = new Set([
  '42701', // duplicate_column
  '42P07', // duplicate_table
  '42710', // duplicate_object
  '23505', // unique_violation during competing creates
  '42501', // insufficient_privilege on managed DBs
]);

function isIgnorableSchemaError(error: unknown): boolean {
  const dbError = error as { code?: string; message?: string } | null;
  if (!dbError) return false;
  if (dbError.code && ignorableSqlErrorCodes.has(dbError.code)) return true;
  const msg = (dbError.message ?? '').toLowerCase();
  return (
    msg.includes('already exists') ||
    msg.includes('duplicate') ||
    msg.includes('insufficient privilege') ||
    msg.includes('permission denied')
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ensureSchema — runs once per server process (cached on globalThis).
// Clears itself on failure so the next request can retry.
// ─────────────────────────────────────────────────────────────────────────────
export async function ensureSchema(): Promise<void> {
  if (!globalForDb.kadalSchemaReady) {
    const attempt = (async () => {
      const client = await db.connect();
      try {
        for (const statement of schemaSqlStatements) {
          try {
            await client.query(statement);
          } catch (err) {
            if (isIgnorableSchemaError(err)) {
              // Expected on an already-migrated DB — skip silently.
              continue;
            }
            console.error('[ensureSchema] fatal statement:', statement.slice(0, 120), err);
            throw err;
          }
        }
      } finally {
        client.release();
      }
    })();

    globalForDb.kadalSchemaReady = attempt.catch((err) => {
      globalForDb.kadalSchemaReady = undefined; // allow retry
      throw err;
    });
  }
  await globalForDb.kadalSchemaReady;
}

// ─────────────────────────────────────────────────────────────────────────────
// withTransaction — helper for routes that need ACID guarantees
// ─────────────────────────────────────────────────────────────────────────────
export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  await ensureSchema();
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
