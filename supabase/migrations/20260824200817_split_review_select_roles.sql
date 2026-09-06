-- Keep one SELECT policy per role/action. Authenticated visibility is handled
-- by reviews_authenticated_read from the previous migration.
DROP POLICY IF EXISTS reviews_public_approved_read ON public.reviews;
CREATE POLICY reviews_public_approved_read
  ON public.reviews FOR SELECT TO anon
  USING (moderation_status = 'approved');
