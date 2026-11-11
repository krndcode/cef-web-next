ALTER TABLE support_messages
  ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS support_messages_read_created_idx
  ON support_messages(is_read, created_at DESC);
