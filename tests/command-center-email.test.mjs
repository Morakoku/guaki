import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('smtp route forwards only to local Mapache and never logs the password', async () => {
  const source = await readFile(new URL('../src/app/api/command-center/email-account/route.ts', import.meta.url), 'utf8');
  assert.match(source, /127\.0\.0\.1:8000/);
  assert.match(source, /email-accounts\/smtp/);
  assert.match(source, /no-store/);
  assert.doesNotMatch(source, /console\.(log|info|error).*password/i);
});

test('pending email status reflects the real buildPendingItems output', async () => {
  const { buildPendingItems } = await import('../src/lib/command_center_pending.mjs');
  const withActive = buildPendingItems({ tenantConfigured: true, searchConfigured: true, providerConfigured: true, emailAccountStatus: 'ACTIVE' });
  const withNone = buildPendingItems({ tenantConfigured: true, searchConfigured: true, providerConfigured: true, emailAccountStatus: 'NONE' });
  assert.equal(withActive.find((item) => item.key === 'email')?.status, 'PASS');
  assert.equal(withNone.find((item) => item.key === 'email')?.status, 'BLOQUEADO');
});

test('Mapache panel exposes a local password form with Hostinger defaults', async () => {
  const source = await readFile(new URL('../src/components/command-center/AdminDashboard.tsx', import.meta.url), 'utf8');
  assert.match(source, /Correo Profesional Veyra/);
  assert.match(source, /api\/command-center\/email-account/);
  assert.match(source, /type="password"/);
  assert.match(source, /smtp\.hostinger\.com/);
  assert.doesNotMatch(source, /localStorage\.(setItem|getItem).*smtp_password/i);
});
