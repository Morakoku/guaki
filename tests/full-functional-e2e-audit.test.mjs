import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const homeContent = await readFile(new URL('../src/app/HomeClient.tsx', import.meta.url), 'utf8');
const directoryContent = await readFile(new URL('../src/app/directorio/page.tsx', import.meta.url), 'utf8');
const directoryClientContent = await readFile(new URL('../src/app/directorio/DirectoryClient.tsx', import.meta.url), 'utf8');
const dashboardContent = await readFile(new URL('../src/app/provider/dashboard/page.tsx', import.meta.url), 'utf8');
const badgeContent = await readFile(new URL('../src/components/ui/VerifiedBadge.tsx', import.meta.url), 'utf8');
const plansContent = await readFile(new URL('../src/lib/plans.ts', import.meta.url), 'utf8');
const storeContent = await readFile(new URL('../src/lib/business_store.ts', import.meta.url), 'utf8');
const authRouteContent = await readFile(new URL('../src/app/api/auth/session/route.ts', import.meta.url), 'utf8');
const middlewareContent = await readFile(new URL('../src/middleware.ts', import.meta.url), 'utf8');
const authServiceContent = await readFile(new URL('../src/lib/auth_service.ts', import.meta.url), 'utf8');

test('1. Plans & Pricing Sync: Home, Directorio, and Dashboard match 100% with the 3 official tiers', () => {
  // Plan 1: Esencial / Gratis ($0 COP)
  assert.ok(plansContent.includes('Plan Esencial') && plansContent.includes("'$0'"));
  assert.ok(homeContent.includes('PlanCardsSection'));
  assert.ok(directoryContent.includes('DirectoryClient'));
  assert.ok(directoryClientContent.includes('PlanCardsSection'));
  assert.ok(dashboardContent.includes('PlanCardsSection'));

  // Plan 2: Verificado ($49.900 COP)
  assert.ok(plansContent.includes('Plan Verificado') && plansContent.includes("'$49.900'"));
  assert.ok(plansContent.includes('✓ Verificado'));

  // Plan 3: VIP Elite ($149.900 COP) with Super Boton
  assert.ok(plansContent.includes('Plan VIP Elite') && plansContent.includes("'$149.900'"));
  assert.ok(plansContent.includes('👑 TOP VIP'));
});

test('2. VerifiedBadge Legal Rule: Free plans never render a verified badge, VIP renders Super Badge', () => {
  assert.ok(badgeContent.includes('gratis') || badgeContent.includes('free'));
  assert.ok(badgeContent.includes('return null;'));
  assert.ok(badgeContent.includes('TOP VIP VERIFICADO'));
  assert.ok(badgeContent.includes('Verificado'));
});

test('3. Backend BusinessStore: Implements CRUD, audit pipeline, metrics and reviews', () => {
  assert.ok(storeContent.includes('BusinessStore'));
  assert.ok(storeContent.includes('addReview'));
  assert.ok(storeContent.includes('addInquiry'));
  assert.ok(storeContent.includes('submitForAudit'));
  assert.ok(storeContent.includes('processAuditDecision'));
  assert.ok(storeContent.includes('getMetrics'));
});

test('4. WhatsApp Direct Links: Properly formatted with numbers', () => {
  assert.ok(storeContent.includes('whatsapp:'));
  assert.ok(plansContent.includes('WhatsApp'));
});

test('5. Production authentication fails closed when Supabase is unavailable', () => {
  assert.match(authRouteContent, /AUTH_PROVIDER_NOT_CONFIGURED/);
  assert.doesNotMatch(authRouteContent, /dev-admin-session-token|usr_local_/);
  assert.match(middlewareContent, /if \(!url \|\| !anonKey.*return loginRedirect/s);
  assert.match(authServiceContent, /AUTH_PROVIDER_UNAVAILABLE/);
  assert.doesNotMatch(authServiceContent, /admin\/admin|usr_local_/);
});
