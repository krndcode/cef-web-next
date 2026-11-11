CREATE TABLE IF NOT EXISTS store_users (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS store_sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES store_users(id) ON DELETE CASCADE,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS store_sessions_user_id_idx
  ON store_sessions(user_id);
CREATE INDEX IF NOT EXISTS store_sessions_expiry_idx
  ON store_sessions(expires_at);

CREATE TABLE IF NOT EXISTS store_products (
  id UUID PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  price_pesewas INTEGER NOT NULL CHECK (price_pesewas >= 0),
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  image_url TEXT,
  badge TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS store_products_active_idx
  ON store_products(is_active, created_at DESC);

CREATE TABLE IF NOT EXISTS store_orders (
  id UUID PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES store_users(id),
  status TEXT NOT NULL DEFAULT 'pending_delivery_quote'
    CHECK (status IN ('pending_delivery_quote', 'awaiting_payment', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'failed')),
  subtotal_pesewas INTEGER NOT NULL CHECK (subtotal_pesewas >= 0),
  delivery_fee_pesewas INTEGER CHECK (delivery_fee_pesewas >= 0),
  total_pesewas INTEGER CHECK (total_pesewas >= 0),
  recipient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  region TEXT NOT NULL,
  delivery_note TEXT,
  paystack_reference TEXT UNIQUE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS store_orders_user_created_idx
  ON store_orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS store_orders_status_created_idx
  ON store_orders(status, created_at DESC);

CREATE TABLE IF NOT EXISTS store_order_items (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES store_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES store_products(id) ON DELETE SET NULL,
  product_title TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_pesewas INTEGER NOT NULL CHECK (unit_price_pesewas >= 0)
);

CREATE INDEX IF NOT EXISTS store_order_items_order_id_idx
  ON store_order_items(order_id);

CREATE TABLE IF NOT EXISTS store_auth_limits (
  email TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL DEFAULT 0,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS store_payment_events (
  id UUID PRIMARY KEY,
  reference TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (reference, event_type)
);

CREATE INDEX IF NOT EXISTS store_payment_events_reference_idx
  ON store_payment_events(reference);

INSERT INTO store_products (
  id, slug, title, category, description, price_pesewas, stock_quantity, badge
) VALUES
  (
    '55555555-5555-4555-8555-555555555501',
    'absolute-supremacy-of-christ',
    'The Absolute Supremacy of Christ',
    'V.O.C Books',
    'An insightful publication examining the eternal victory and dominion of our Lord Jesus Christ.',
    12000,
    0,
    'Bestseller'
  ),
  (
    '55555555-5555-4555-8555-555555555502',
    'walking-in-the-light-study-parchment',
    'Walking in the Light of His Word (Study Parchment)',
    'Study Parchments',
    'A comprehensive breakdown and study guide centered around Isaiah 2:2-5.',
    4500,
    0,
    'New Release'
  ),
  (
    '55555555-5555-4555-8555-555555555503',
    'voice-of-the-cross-volume-1',
    'The Voice of the Cross - Volume 1',
    'V.O.C Books',
    'Encouraging writings and spiritual doctrines designed to turn hearts back to the Father.',
    9000,
    0,
    'Foundation Classic'
  )
ON CONFLICT (slug) DO NOTHING;
