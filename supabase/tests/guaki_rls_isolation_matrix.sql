BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
SET LOCAL search_path = extensions, public, auth;

SELECT plan(37);

-- Fixed test-only identities. The enclosing transaction is rolled back below.
INSERT INTO auth.users (id, email) VALUES
  ('10000000-0000-0000-0000-000000000001', 'rls-provider-a@local.test'),
  ('10000000-0000-0000-0000-000000000002', 'rls-provider-b@local.test'),
  ('10000000-0000-0000-0000-000000000003', 'rls-client@local.test'),
  ('10000000-0000-0000-0000-000000000004', 'rls-admin@local.test');

INSERT INTO public.businesses (id, slug, name, category, city, status, owner_id) VALUES
  ('RLS-BUSINESS-A', 'rls-business-a', 'RLS Provider A', 'Testing', 'Local', 'draft', '10000000-0000-0000-0000-000000000001'),
  ('RLS-BUSINESS-B', 'rls-business-b', 'RLS Provider B', 'Testing', 'Local', 'draft', '10000000-0000-0000-0000-000000000002');

INSERT INTO public.inquiries (id, business_id, client_name, client_contact, message, client_user_id) VALUES
  ('20000000-0000-0000-0000-000000000001', 'RLS-BUSINESS-A', 'RLS Client', 'client@local.test', 'Inquiry for provider A', '10000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000002', 'RLS-BUSINESS-B', 'RLS Client', 'client@local.test', 'Inquiry for provider B', '10000000-0000-0000-0000-000000000003');

INSERT INTO public.reviews (id, business_id, author_name, rating, comment, verified_transaction, moderation_status, author_user_id) VALUES
  ('30000000-0000-0000-0000-000000000001', 'RLS-BUSINESS-A', 'RLS Client', 5, 'Client submitted review', false, 'submitted', '10000000-0000-0000-0000-000000000003'),
  ('30000000-0000-0000-0000-000000000002', 'RLS-BUSINESS-A', 'RLS Provider A', 4, 'Provider A submitted review', false, 'submitted', '10000000-0000-0000-0000-000000000001');

INSERT INTO public.events (id, event_name, business_id, metadata, actor_user_id) VALUES
  ('40000000-0000-0000-0000-000000000001', 'rls.provider_a.created', 'RLS-BUSINESS-A', '{"fixture": true}', '10000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0000-000000000002', 'rls.provider_b.created', 'RLS-BUSINESS-B', '{"fixture": true}', '10000000-0000-0000-0000-000000000002');

-- Provider A: own scope works; Provider B's private rows are not visible or mutable.
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
SET LOCAL request.jwt.claim.role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated","app_metadata":{"role":"provider"}}';

SELECT results_eq(
  $$ SELECT id FROM public.businesses WHERE id = 'RLS-BUSINESS-A' $$,
  ARRAY['RLS-BUSINESS-A']::text[],
  'provider A reads its own draft business'
);
SELECT is_empty(
  $$ SELECT id FROM public.businesses WHERE id = 'RLS-BUSINESS-B' $$,
  'provider A cannot read provider B draft business'
);
SELECT results_eq(
  $$ UPDATE public.businesses SET description = 'provider A updated own row' WHERE id = 'RLS-BUSINESS-A' RETURNING id $$,
  ARRAY['RLS-BUSINESS-A']::text[],
  'provider A updates its own business'
);
SELECT is_empty(
  $$ UPDATE public.businesses SET description = 'cross-tenant write' WHERE id = 'RLS-BUSINESS-B' RETURNING id $$,
  'provider A cannot update provider B business'
);
SELECT results_eq(
  $$ SELECT id FROM public.inquiries WHERE id = '20000000-0000-0000-0000-000000000001' $$,
  ARRAY['20000000-0000-0000-0000-000000000001'::uuid],
  'provider A reads its own business inquiry'
);
SELECT is_empty(
  $$ SELECT id FROM public.inquiries WHERE id = '20000000-0000-0000-0000-000000000002' $$,
  'provider A cannot read provider B inquiry'
);
SELECT results_eq(
  $$ UPDATE public.inquiries SET status = 'contacted' WHERE id = '20000000-0000-0000-0000-000000000001' RETURNING id $$,
  ARRAY['20000000-0000-0000-0000-000000000001'::uuid],
  'provider A updates its own business inquiry'
);
SELECT is_empty(
  $$ UPDATE public.inquiries SET status = 'closed' WHERE id = '20000000-0000-0000-0000-000000000002' RETURNING id $$,
  'provider A cannot update provider B inquiry'
);
SELECT is_empty(
  $$ SELECT id FROM public.reviews WHERE id = '30000000-0000-0000-0000-000000000001' $$,
  'provider A cannot read an unmoderated client review'
);
SELECT is_empty(
  $$ UPDATE public.reviews SET comment = 'cross-tenant write' WHERE id = '30000000-0000-0000-0000-000000000001' RETURNING id $$,
  'provider A cannot update a client review'
);
SELECT results_eq(
  $$ SELECT id FROM public.events WHERE id = '40000000-0000-0000-0000-000000000001' $$,
  ARRAY['40000000-0000-0000-0000-000000000001'::uuid],
  'provider A reads its own event'
);
SELECT is_empty(
  $$ SELECT id FROM public.events WHERE id = '40000000-0000-0000-0000-000000000002' $$,
  'provider A cannot read provider B event'
);
SELECT lives_ok(
  $$ INSERT INTO public.events (event_name, business_id, actor_user_id) VALUES ('rls.provider_a.inserted', 'RLS-BUSINESS-A', '10000000-0000-0000-0000-000000000001') $$,
  'provider A inserts its own event'
);
SELECT throws_ok(
  $$ INSERT INTO public.events (event_name, business_id, actor_user_id) VALUES ('rls.provider_a.forged', 'RLS-BUSINESS-B', '10000000-0000-0000-0000-000000000002') $$,
  '42501', NULL,
  'provider A cannot forge provider B event'
);

-- Provider B: symmetric isolation, including review submission.
SET LOCAL request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
SET LOCAL request.jwt.claims = '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated","app_metadata":{"role":"provider"}}';

SELECT results_eq(
  $$ SELECT id FROM public.businesses WHERE id = 'RLS-BUSINESS-B' $$,
  ARRAY['RLS-BUSINESS-B']::text[],
  'provider B reads its own draft business'
);
SELECT is_empty(
  $$ SELECT id FROM public.businesses WHERE id = 'RLS-BUSINESS-A' $$,
  'provider B cannot read provider A draft business'
);
SELECT results_eq(
  $$ SELECT id FROM public.inquiries WHERE id = '20000000-0000-0000-0000-000000000002' $$,
  ARRAY['20000000-0000-0000-0000-000000000002'::uuid],
  'provider B reads its own business inquiry'
);
SELECT is_empty(
  $$ UPDATE public.inquiries SET status = 'closed' WHERE id = '20000000-0000-0000-0000-000000000001' RETURNING id $$,
  'provider B cannot update provider A inquiry'
);
SELECT lives_ok(
  $$ INSERT INTO public.reviews (business_id, author_name, rating, comment, author_user_id) VALUES ('RLS-BUSINESS-B', 'RLS Provider B', 5, 'Provider B submitted review', '10000000-0000-0000-0000-000000000002') $$,
  'provider B submits a review as itself'
);
SELECT lives_ok(
  $$ INSERT INTO public.events (event_name, business_id, actor_user_id) VALUES ('rls.provider_b.inserted', 'RLS-BUSINESS-B', '10000000-0000-0000-0000-000000000002') $$,
  'provider B inserts its own event'
);

-- Client: it cannot see provider drafts or impersonate another client or event actor.
SET LOCAL request.jwt.claim.sub = '10000000-0000-0000-0000-000000000003';
SET LOCAL request.jwt.claims = '{"sub":"10000000-0000-0000-0000-000000000003","role":"authenticated","app_metadata":{"role":"client"}}';

SELECT is_empty(
  $$ SELECT id FROM public.businesses WHERE id IN ('RLS-BUSINESS-A', 'RLS-BUSINESS-B') $$,
  'client cannot read either provider draft business'
);
SELECT results_eq(
  $$ SELECT count(*) FROM public.inquiries WHERE id IN ('20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002') $$,
  ARRAY[2::bigint],
  'client reads its own inquiries'
);
SELECT lives_ok(
  $$ INSERT INTO public.inquiries (business_id, client_name, client_contact, message, client_user_id) VALUES ('RLS-BUSINESS-A', 'RLS Client', 'client@local.test', 'Client-owned inquiry', '10000000-0000-0000-0000-000000000003') $$,
  'client inserts its own inquiry'
);
SELECT throws_ok(
  $$ INSERT INTO public.inquiries (business_id, client_name, client_contact, message, client_user_id) VALUES ('RLS-BUSINESS-A', 'RLS Client', 'client@local.test', 'Forged inquiry', '10000000-0000-0000-0000-000000000001') $$,
  '42501', NULL,
  'client cannot forge another inquiry owner'
);
SELECT lives_ok(
  $$ INSERT INTO public.reviews (business_id, author_name, rating, comment, author_user_id) VALUES ('RLS-BUSINESS-A', 'RLS Client', 5, 'Client owned review', '10000000-0000-0000-0000-000000000003') $$,
  'client submits a review as itself'
);
SELECT results_eq(
  $$ UPDATE public.reviews SET comment = 'Client edited own review' WHERE id = '30000000-0000-0000-0000-000000000001' RETURNING id $$,
  ARRAY['30000000-0000-0000-0000-000000000001'::uuid],
  'client updates its own submitted review'
);
SELECT is_empty(
  $$ UPDATE public.reviews SET comment = 'Client cross-tenant write' WHERE id = '30000000-0000-0000-0000-000000000002' RETURNING id $$,
  'client cannot update another author review'
);
SELECT lives_ok(
  $$ INSERT INTO public.events (event_name, actor_user_id) VALUES ('rls.client.inserted', '10000000-0000-0000-0000-000000000003') $$,
  'client inserts its own event'
);
SELECT throws_ok(
  $$ INSERT INTO public.events (event_name, actor_user_id) VALUES ('rls.client.forged', '10000000-0000-0000-0000-000000000001') $$,
  '42501', NULL,
  'client cannot forge provider A event'
);

-- Admin: app_metadata.role=admin must have operational scope over every protected table.
SET LOCAL request.jwt.claim.sub = '10000000-0000-0000-0000-000000000004';
SET LOCAL request.jwt.claims = '{"sub":"10000000-0000-0000-0000-000000000004","role":"authenticated","app_metadata":{"role":"admin"}}';

SELECT results_eq(
  $$ SELECT count(*) FROM public.businesses WHERE id IN ('RLS-BUSINESS-A', 'RLS-BUSINESS-B') $$,
  ARRAY[2::bigint],
  'admin reads both private businesses'
);
SELECT results_eq(
  $$ UPDATE public.businesses SET description = 'admin updated provider B' WHERE id = 'RLS-BUSINESS-B' RETURNING id $$,
  ARRAY['RLS-BUSINESS-B']::text[],
  'admin updates provider B business'
);
SELECT results_eq(
  $$ SELECT count(*) FROM public.inquiries WHERE id IN ('20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002') $$,
  ARRAY[2::bigint],
  'admin reads both provider inquiries'
);
SELECT results_eq(
  $$ UPDATE public.inquiries SET status = 'closed' WHERE id = '20000000-0000-0000-0000-000000000002' RETURNING id $$,
  ARRAY['20000000-0000-0000-0000-000000000002'::uuid],
  'admin updates provider B inquiry'
);
SELECT results_eq(
  $$ SELECT id FROM public.reviews WHERE id = '30000000-0000-0000-0000-000000000001' $$,
  ARRAY['30000000-0000-0000-0000-000000000001'::uuid],
  'admin reads a submitted review for moderation'
);
SELECT results_eq(
  $$ UPDATE public.reviews SET moderation_status = 'approved' WHERE id = '30000000-0000-0000-0000-000000000001' RETURNING id $$,
  ARRAY['30000000-0000-0000-0000-000000000001'::uuid],
  'admin moderates a submitted review'
);
SELECT results_eq(
  $$ SELECT id FROM public.events WHERE id = '40000000-0000-0000-0000-000000000001' $$,
  ARRAY['40000000-0000-0000-0000-000000000001'::uuid],
  'admin reads provider A event'
);
SELECT lives_ok(
  $$ INSERT INTO public.events (event_name, actor_user_id) VALUES ('rls.admin.inserted', '10000000-0000-0000-0000-000000000004') $$,
  'admin inserts its own event'
);

SELECT * FROM finish();
ROLLBACK;
