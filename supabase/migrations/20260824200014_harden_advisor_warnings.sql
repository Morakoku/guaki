-- Forward-only local hardening for Supabase advisor findings.
-- Keep authorization predicates unchanged while making every auth helper call
-- an advisor-recognized scalar initplan.

ALTER FUNCTION public.protect_business_workflow_fields()
  SET search_path = pg_catalog, auth;

DROP POLICY IF EXISTS businesses_public_read ON public.businesses;
CREATE POLICY businesses_public_read
  ON public.businesses FOR SELECT TO anon, authenticated
  USING (
    status = 'published'
    OR owner_id = (SELECT auth.uid())
    OR COALESCE((SELECT auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin'
  );

DROP POLICY IF EXISTS businesses_owner_insert ON public.businesses;
CREATE POLICY businesses_owner_insert
  ON public.businesses FOR INSERT TO authenticated
  WITH CHECK (
    owner_id = (SELECT auth.uid())
    OR COALESCE((SELECT auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin'
  );

DROP POLICY IF EXISTS businesses_owner_update ON public.businesses;
CREATE POLICY businesses_owner_update
  ON public.businesses FOR UPDATE TO authenticated
  USING (
    owner_id = (SELECT auth.uid())
    OR COALESCE((SELECT auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin'
  )
  WITH CHECK (
    owner_id = (SELECT auth.uid())
    OR COALESCE((SELECT auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin'
  );

DROP POLICY IF EXISTS businesses_owner_delete ON public.businesses;
CREATE POLICY businesses_owner_delete
  ON public.businesses FOR DELETE TO authenticated
  USING (
    owner_id = (SELECT auth.uid())
    OR COALESCE((SELECT auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin'
  );

DROP POLICY IF EXISTS inquiries_participant_read ON public.inquiries;
CREATE POLICY inquiries_participant_read
  ON public.inquiries FOR SELECT TO authenticated
  USING (
    client_user_id = (SELECT auth.uid())
    OR business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = (SELECT auth.uid())
    )
    OR COALESCE((SELECT auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin'
  );

DROP POLICY IF EXISTS inquiries_provider_update ON public.inquiries;
CREATE POLICY inquiries_provider_update
  ON public.inquiries FOR UPDATE TO authenticated
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = (SELECT auth.uid())
    )
    OR COALESCE((SELECT auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin'
  )
  WITH CHECK (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = (SELECT auth.uid())
    )
    OR COALESCE((SELECT auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin'
  );

DROP POLICY IF EXISTS inquiries_owner_delete ON public.inquiries;
CREATE POLICY inquiries_owner_delete
  ON public.inquiries FOR DELETE TO authenticated
  USING (
    client_user_id = (SELECT auth.uid())
    OR business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = (SELECT auth.uid())
    )
    OR COALESCE((SELECT auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin'
  );

DROP POLICY IF EXISTS events_actor_read ON public.events;
CREATE POLICY events_actor_read
  ON public.events FOR SELECT TO authenticated
  USING (
    actor_user_id = (SELECT auth.uid())
    OR COALESCE((SELECT auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin'
  );

DROP POLICY IF EXISTS events_actor_insert ON public.events;
CREATE POLICY events_actor_insert
  ON public.events FOR INSERT TO authenticated
  WITH CHECK (
    actor_user_id = (SELECT auth.uid())
    OR COALESCE((SELECT auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin'
  );

DROP POLICY IF EXISTS reviews_author_update ON public.reviews;
CREATE POLICY reviews_author_update
  ON public.reviews FOR UPDATE TO authenticated
  USING (
    author_user_id = (SELECT auth.uid())
    OR COALESCE((SELECT auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin'
  )
  WITH CHECK (
    (
      author_user_id = (SELECT auth.uid())
      AND verified_transaction = false
      AND moderation_status = 'submitted'
    )
    OR COALESCE((SELECT auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin'
  );

DROP POLICY IF EXISTS reviews_author_delete ON public.reviews;
CREATE POLICY reviews_author_delete
  ON public.reviews FOR DELETE TO authenticated
  USING (
    author_user_id = (SELECT auth.uid())
    OR COALESCE((SELECT auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin'
  );
