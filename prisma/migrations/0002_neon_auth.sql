ALTER TABLE store_users
  ADD COLUMN IF NOT EXISTS neon_auth_user_id TEXT;

ALTER TABLE store_users
  ALTER COLUMN password_hash DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS store_users_neon_auth_user_id_idx
  ON store_users(neon_auth_user_id)
  WHERE neon_auth_user_id IS NOT NULL;
