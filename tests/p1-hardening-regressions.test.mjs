import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('bootstrap schema uses RLS and minimal grants rather than blanket Data API access', () => {
  const schema = read('supabase/init_schema.sql');
  assert.doesNotMatch(schema, /GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated/i);
  assert.doesNotMatch(schema, /ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated/i);
  assert.match(schema, /ALTER TABLE public\.reviews ENABLE ROW LEVEL SECURITY/i);
  assert.match(schema, /CREATE POLICY reviews_public_approved_read/i);
});

test('non-durable business, inquiry, and review writes fail closed outside the explicit test boundary', () => {
  const listRoute = read('src/app/api/businesses/route.ts');
  const detailRoute = read('src/app/api/businesses/[id]/route.ts');
  assert.match(listRoute, /PERSISTENCE_UNAVAILABLE/);
  assert.doesNotMatch(listRoute, /const newBusiness = BusinessStore\.create/);
  assert.match(detailRoute, /PERSISTENCE_UNAVAILABLE/);
  assert.doesNotMatch(detailRoute, /const inquiry = BusinessStore\.addInquiry/);
  assert.doesNotMatch(detailRoute, /const review = BusinessStore\.addReview/);
});

test('registration cannot request provider or admin authority through user metadata', () => {
  const auth = read('src/lib/auth_service.ts');
  const publicRegistration = read('src/app/login/page.tsx');
  const providerOnboarding = read('src/app/provider/dashboard/page.tsx');
  assert.doesNotMatch(auth, /data:\s*\{[\s\S]{0,120}role[\s\S]{0,120}\}/);
  assert.match(auth, /role:\s*UserRole\s*=\s*'client'/);
  assert.match(publicRegistration, /authService\.register\(userEmail, userPass, userName\)/);
  assert.match(providerOnboarding, /authService\.register\(ownerEmail\.trim\(\), ownerPassword, ownerName\.trim\(\) \|\| 'Comerciante Guaki'\)/);
  assert.doesNotMatch(providerOnboarding, /authService\.register\([^\n]+,\s*'provider'\)/);
  assert.match(auth, /PROVIDER_PROVISIONING_REQUIRED/);
});

test('protected page redirects use the framework-normalized request origin', () => {
  const middlewareContent = read('src/middleware.ts');
  assert.match(middlewareContent, /request\.nextUrl\.clone\(\)/);
  assert.match(middlewareContent, /loginUrl\.pathname\s*=\s*['"]\/login['"]/);
  assert.doesNotMatch(middlewareContent, /new URL\(['"]\/login['"],\s*request\.url\)/);
  assert.doesNotMatch(middlewareContent, /request\.headers\.get\(['"](?:host|x-forwarded-host)['"]\)/);
});

test('admin audit decisions require canonical claim ownership and status evidence', () => {
  const route = read('src/app/api/admin/audit/[id]/decision/route.ts');
  assert.match(route, /CLAIM_PENDING_AUDIT_REQUIRED/);
  assert.match(route, /CLAIM_VERIFIED_APPROVAL_REQUIRED/);
  assert.doesNotMatch(route, /claimStatus:\s*decision === 'approved' \|\| decision === 'published' \? 'verified'/);
});

test('review submissions are always unverified and pending moderation', () => {
  const service = read('src/lib/supabase.ts');
  const validation = read('src/lib/validation.ts');
  assert.match(service, /moderation_status:\s*'submitted'/);
  assert.match(service, /verified_transaction:\s*false/);
  assert.doesNotMatch(validation, /verified:\s*Boolean\(payload\.verified\)/);
});
