-- =====================================================================
-- 1. Admin users table (for login). Seed one row: antony / 12anto34
-- 2. Add phone column to Message table (for contact form + messages UI)
-- =====================================================================

-- --- Users table ---
CREATE TABLE IF NOT EXISTS "AdminUser" (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT ''
);

-- Seed the admin user (ignore if already exists)
INSERT INTO "AdminUser" (username, password, display_name)
VALUES ('antony', '12anto34', 'Antony Muthii')
ON CONFLICT (username) DO NOTHING;

-- --- Phone column on Message ---
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS phone TEXT NOT NULL DEFAULT '';
