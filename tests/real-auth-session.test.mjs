import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const loginContent = await readFile(new URL('../src/app/login/page.tsx', import.meta.url), 'utf8');
const dashboardContent = await readFile(new URL('../src/app/provider/dashboard/page.tsx', import.meta.url), 'utf8');
const businessRouteContent = await readFile(new URL('../src/app/api/businesses/[id]/route.ts', import.meta.url), 'utf8');

test('real auth session is bridged to the httpOnly server cookie without storing identity in localStorage', () => {
  assert.match(loginContent, /api\/auth\/session/);
  assert.match(loginContent, /credentials:\s*['"]include['"]/);
  assert.doesNotMatch(loginContent, /localStorage\.setItem\(\s*['"]guaki_provider_auth/);
});

test('provider dashboard does not persist the merchant identity as its source of truth', () => {
  assert.match(dashboardContent, /fetch\('\/api\/businesses/);
  assert.match(dashboardContent, /credentials:\s*['"]include['"]/);
  assert.doesNotMatch(dashboardContent, /localStorage\.setItem\(\s*['"]guaki_merchant_user/);
  assert.doesNotMatch(dashboardContent, /localStorage\.getItem\(\s*['"]guaki_merchant_user/);
});

test('provider edits are routed through the Supabase-backed API and status transitions are not client-controlled', () => {
  assert.match(businessRouteContent, /GuakiDataService\.updateBusinessWithToken/);
  assert.match(businessRouteContent, /GuakiDataService\.updateBusinessWorkflowWithToken/);
  assert.match(businessRouteContent, /ADMIN_REQUIRED/);
  assert.match(businessRouteContent, /CLAIM_MUST_BE_VERIFIED_BEFORE_PUBLISH/);
});

test('provider WhatsApp field keeps telephone input semantics without blocking browser E2E typing', () => {
  assert.match(dashboardContent, /type="text"[\s\S]*inputMode="tel"[\s\S]*value=\{whatsapp\}/);
});
