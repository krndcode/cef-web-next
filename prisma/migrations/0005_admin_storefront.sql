ALTER TABLE store_users
  ADD COLUMN IF NOT EXISTS is_primary_admin BOOLEAN NOT NULL DEFAULT FALSE;

WITH first_admin AS (
  SELECT id
  FROM store_users
  WHERE role = 'admin' AND is_active = TRUE
  ORDER BY created_at, id
  LIMIT 1
)
UPDATE store_users
SET is_primary_admin = TRUE
WHERE id IN (SELECT id FROM first_admin)
  AND NOT EXISTS (
    SELECT 1 FROM store_users WHERE is_primary_admin = TRUE
  );

CREATE UNIQUE INDEX IF NOT EXISTS store_users_single_primary_admin_idx
  ON store_users(is_primary_admin)
  WHERE is_primary_admin = TRUE;

ALTER TABLE store_products
  ADD COLUMN IF NOT EXISTS product_type TEXT NOT NULL DEFAULT 'book',
  ADD COLUMN IF NOT EXISTS download_path TEXT;

ALTER TABLE store_products
  ADD CONSTRAINT store_products_product_type_check
  CHECK (product_type IN ('book', 'free_resource'));

UPDATE store_products
SET product_type = 'free_resource',
    price_pesewas = 0,
    stock_quantity = 0
WHERE LOWER(category) LIKE '%parchment%';

CREATE TABLE IF NOT EXISTS store_resource_access (
  user_id UUID NOT NULL REFERENCES store_users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  topic TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'in_progress', 'replied', 'closed')),
  reply TEXT,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS support_messages_status_created_idx
  ON support_messages(status, created_at DESC);
