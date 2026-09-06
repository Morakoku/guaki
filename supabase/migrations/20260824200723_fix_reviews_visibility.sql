-- Public visitors may only see approved reviews. Authenticated authors need
-- visibility of their own submitted rows so UPDATE/DELETE policies can work,
-- and administrators need visibility for moderation.
DROP POLICY IF EXISTS reviews_authenticated_read ON public.reviews;
CREATE POLICY reviews_authenticated_read
  ON public.reviews FOR SELECT TO authenticated
  USING (
    moderation_status = 'approved'
    OR author_user_id = (SELECT auth.uid())
    OR COALESCE((SELECT auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin'
  );
