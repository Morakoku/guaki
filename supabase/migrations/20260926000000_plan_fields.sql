-- GUAKI migration: plan/promo/payment fields for businesses
-- 2026-09-26: add plan_source, plan_expires_at, payment_method columns
-- updated_at already exists in init_schema.sql:63, so we skip it

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'plan_source') THEN
    ALTER TABLE businesses ADD COLUMN plan_source TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'plan_expires_at') THEN
    ALTER TABLE businesses ADD COLUMN plan_expires_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'payment_method') THEN
    ALTER TABLE businesses ADD COLUMN payment_method TEXT;
  END IF;
END $$;