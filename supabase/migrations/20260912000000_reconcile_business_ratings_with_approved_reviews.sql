-- ==============================================================================
-- Reconciliación de reputación: businesses.rating / review_count
-- ------------------------------------------------------------------------------
-- La migración inicial (20260822214406_initial_schema_and_rls.sql) sembró
-- rating = 4.95 y review_count = 148 para el negocio GKI-0001290 sin que
-- existiera ninguna reseña real en public.reviews.
--
-- Esta migración recalcula las columnas denormalizadas a partir de la tabla
-- public.reviews con moderación aprobada y deja en NULL / 0 los negocios que no
-- tienen reseñas aprobadas. No modifica ni borra ninguna reseña ni negocio.
--
-- NOTA DE DESPLIEGUE: el deploy de Vercel no aplica migraciones de Supabase.
-- Esta migración queda versionada para aplicarla con el flujo de migraciones
-- (`supabase db push` / panel SQL) y corregir también los datos en producción.
-- ==============================================================================

-- El rating por defecto 5.0 fabricaba una valoración para negocios nuevos.
ALTER TABLE public.businesses ALTER COLUMN rating DROP DEFAULT;

-- 1) Negocios con al menos una reseña aprobada: promedio y conteo reales.
UPDATE public.businesses AS b
SET rating = stats.avg_rating,
    review_count = stats.review_count,
    updated_at = CURRENT_TIMESTAMP
FROM (
  SELECT business_id,
         ROUND(AVG(rating)::numeric, 2) AS avg_rating,
         COUNT(*)::int AS review_count
  FROM public.reviews
  WHERE moderation_status = 'approved'
  GROUP BY business_id
) AS stats
WHERE b.id = stats.business_id;

-- 2) Negocios sin reseñas aprobadas: sin valoración agregada.
UPDATE public.businesses AS b
SET rating = NULL,
    review_count = 0,
    updated_at = CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM public.reviews AS r
  WHERE r.business_id = b.id
    AND r.moderation_status = 'approved'
);
