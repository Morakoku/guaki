-- ==============================================================================
-- Panel admin Guaki: PIN (destacado), Suspender negocio y Precios persistentes.
-- Aditivo e idempotente. Aplicar en producción con el flujo de migraciones
-- (ver EVIDENCE/GUAKI_MIGRACIONES_PROD_RUNBOOK_v1.md). Vercel NO aplica migraciones.
-- ==============================================================================

-- 1) Destacado (PIN) y suspensión a nivel de negocio.
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS pinned BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS suspended BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_businesses_pinned ON public.businesses(pinned) WHERE pinned;
CREATE INDEX IF NOT EXISTS idx_businesses_suspended ON public.businesses(suspended) WHERE suspended;

-- 2) Settings persistentes del panel (precios/ofertas y futuros ajustes).
CREATE TABLE IF NOT EXISTS public.platform_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
-- La app lee/escribe con la service-role key desde el servidor (bypassa RLS).
-- No exponer a anon/authenticated: los precios se sirven server-side.
REVOKE ALL ON public.platform_settings FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.platform_settings TO authenticated;

-- Seed con los precios vigentes (la app hace fallback a estas cifras si no hay fila).
INSERT INTO public.platform_settings (key, value)
VALUES ('pricing', '{"priceVerificado":49900,"priceVip":149900,"flashDiscountEnabled":false,"flashDiscountPercent":20}'::jsonb)
ON CONFLICT (key) DO NOTHING;
