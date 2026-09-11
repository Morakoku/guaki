import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = decodeURIComponent(new URL('../', import.meta.url).pathname).replace(/^\//, '').replaceAll('/', '\\');
const read = (relative) => fs.readFileSync(`${root}${relative}`, 'utf8');

test('admin audit endpoints use the Supabase-backed service and enforce admin decisions', () => {
  const list = read('src/app/api/admin/audit/route.ts');
  const decision = read('src/app/api/admin/audit/[id]/decision/route.ts');
  assert.match(list, /GuakiDataService/);
  assert.match(list, /ADMIN_REQUIRED/);
  assert.match(decision, /GuakiDataService/);
  assert.match(decision, /ADMIN_REQUIRED/);
  assert.doesNotMatch(list, /BusinessStore\.getAuditQueue/);
  assert.doesNotMatch(decision, /BusinessStore\.processAuditDecision/);
  assert.match(read('src/lib/validation.ts'), /rawDecision === 'publish'/);
});

test('real inquiry, review and event persistence has token-aware service methods', () => {
  const source = read('src/lib/supabase.ts');
  assert.match(source, /addInquiryWithToken/);
  assert.match(source, /addReviewWithToken/);
  assert.match(source, /recordEventWithToken/);
  assert.match(source, /client_user_id/);
  assert.match(source, /author_user_id/);
  assert.match(source, /actor_user_id/);
});

test('business workflow protection exists at the database boundary', () => {
  const migrations = fs.readdirSync(`${root}supabase\\migrations`).filter((name) => name.endsWith('.sql'));
  const sql = migrations.map((name) => read(`supabase/migrations/${name}`)).join('\n');
  assert.match(sql, /protect_business_workflow_fields/);
  assert.match(sql, /ALTER FUNCTION public\.protect_business_workflow_fields\(\)\s+SET search_path = public, pg_temp/);
  assert.match(sql, /OLD\.owner_id IS DISTINCT FROM NEW\.owner_id/);
  assert.match(sql, /OLD\.status = 'draft' AND NEW\.status = 'in_audit'/);
});

test('demo authentication is isolated from production session routes', () => {
  const session = read('src/app/api/auth/session/route.ts');
  const auth = read('src/lib/auth_service.ts');
  assert.doesNotMatch(session, /dev-admin-session-token/);
  assert.doesNotMatch(auth, /admin\/admin/);
  assert.doesNotMatch(auth, /usr_local_/);
});

test('admin dashboard has no simulated business source of truth', () => {
  const dashboard = read('src/app/admin/dashboard/page.tsx');
  assert.doesNotMatch(dashboard, /INITIAL_BUSINESSES/);
  assert.doesNotMatch(dashboard, /guaki_admin_businesses/);
  assert.doesNotMatch(dashboard, /localStorage\.setItem\('guaki_admin_businesses'/);
  assert.match(dashboard, /\/api\/admin\/audit/);
  assert.match(dashboard, /decision: value/);
  assert.match(dashboard, /\/api\/businesses\//);
});

test('persistent provider creation assigns the required business id', () => {
  const route = read('src/app/api/businesses/route.ts');
  assert.match(route, /id:\s*`GKI-\$\{crypto\.randomUUID\(\)\}`/);
});

test('provider business reads are owner-scoped while admin reads remain broad', () => {
  const route = read('src/app/api/businesses/route.ts');
  const service = read('src/lib/supabase.ts');
  // Catálogo público (?status=published) muestra todo el directorio aun con sesión;
  // el alcance por dueño aplica al dashboard (sin status) y admins leen sin filtro.
  assert.match(route, /status === 'published'/);
  assert.match(route, /items = await GuakiDataService\.getAllBusinesses\(\{ status: 'published' \}\)/);
  assert.match(route, /ownerId: actor\.user\.id/);
  assert.match(service, /query = query\.eq\('owner_id', filters\.ownerId\)/);
});

test('client role cannot enter the provider dashboard', () => {
  const middleware = read('src/middleware.ts');
  assert.match(middleware, /path\.startsWith\('\/provider'\) && role === 'client'/);
});
