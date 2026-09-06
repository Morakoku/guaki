-- Local-only review moderation hardening.
-- Reviews are submitted unverified and become public only after admin moderation.

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS moderation_status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (moderation_status IN ('submitted', 'approved', 'rejected'));

CREATE INDEX IF NOT EXISTS idx_reviews_moderation_status
  ON public.reviews(moderation_status);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.reviews FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;

DROP POLICY IF EXISTS reviews_public_read ON public.reviews;
DROP POLICY IF EXISTS reviews_public_approved_read ON public.reviews;
CREATE POLICY reviews_public_approved_read
  ON public.reviews FOR SELECT TO anon, authenticated
  USING (moderation_status = 'approved');

DROP POLICY IF EXISTS reviews_author_insert ON public.reviews;
CREATE POLICY reviews_author_insert
  ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (
    author_user_id = (select auth.uid())
    AND verified_transaction = false
    AND moderation_status = 'submitted'
  );

DROP POLICY IF EXISTS reviews_author_update ON public.reviews;
CREATE POLICY reviews_author_update
  ON public.reviews FOR UPDATE TO authenticated
  USING (
    author_user_id = (select auth.uid())
    OR (select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'admin'
  )
  WITH CHECK (
    (
      author_user_id = (select auth.uid())
      AND verified_transaction = false
      AND moderation_status = 'submitted'
    )
    OR (select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'admin'
  );

DROP POLICY IF EXISTS reviews_author_delete ON public.reviews;
CREATE POLICY reviews_author_delete
  ON public.reviews FOR DELETE TO authenticated
  USING (
    author_user_id = (select auth.uid())
    OR (select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'admin'
  );
