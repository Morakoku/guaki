-- GUAKI migration: number verification column for businesses
-- 2026-09-26: add number_verified column
-- Format: unverified | pending | verified
-- Default 'unverified' so existing rows are not penalized retroactively

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'number_verified') THEN
    ALTER TABLE businesses ADD COLUMN IF NOT EXISTS number_verified TEXT DEFAULT 'unverified';
  END IF;
END $$;