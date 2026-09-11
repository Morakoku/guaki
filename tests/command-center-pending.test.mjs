import test from 'node:test';
import assert from 'node:assert/strict';

test('pending catalog changes runtime-driven statuses from evidence', async () => {
  const { buildPendingItems } = await import('../src/lib/command_center_pending.mjs');
  const blocked = buildPendingItems({ tenantConfigured: false, searchConfigured: false, providerConfigured: false });
  assert.equal(blocked.find((item) => item.title === 'Tenant y RLS de Mapache')?.status, 'BLOQUEADO');
  assert.equal(blocked.find((item) => item.title === 'Búsqueda La Trinidad autorizada')?.status, 'PENDIENTE');

  const ready = buildPendingItems({ tenantConfigured: true, searchConfigured: true, providerConfigured: true, discovery: { status: 'COMPLETED', found: 30, new: 30, duplicate: 0, blocked: false }, discoveryCaptured: 30 });
  assert.equal(ready.find((item) => item.title === 'Tenant y RLS de Mapache')?.status, 'PASS');
  assert.equal(ready.find((item) => item.title === 'Búsqueda La Trinidad autorizada')?.status, 'PASS');
  assert.equal(ready.find((item) => item.title === 'Proveedor de discovery')?.status, 'PASS');

  const templateReady = buildPendingItems({ tenantConfigured: true, searchConfigured: true, providerConfigured: true, discovery: { status: 'COMPLETED', found: 30, new: 30, duplicate: 0, blocked: false }, templateConfigured: true, activeTemplate: false });
  assert.equal(templateReady.find((item) => item.title === 'Proveedor de discovery')?.status, 'PASS');
});

test('pending catalog records the latest real discovery run', async () => {
  const { buildPendingItems } = await import('../src/lib/command_center_pending.mjs');
  const items = buildPendingItems({
    tenantConfigured: true,
    searchConfigured: true,
    providerConfigured: true,
    discovery: { status: 'COMPLETED', found: 30, new: 30, duplicate: 0, blocked: false },
    discoveryCaptured: 30,
    discoveryContactable: 30,
    leads: 38,
    sent: 0,
  });
  assert.match(items.find((item) => item.title === 'Búsqueda La Trinidad autorizada')?.description ?? '', /30/);
  assert.match(items.find((item) => item.title === 'Proveedor de discovery')?.description ?? '', /COMPLETED/);
  assert.match(items.find((item) => item.title === 'Clasificación y Scoring DQS')?.description ?? '', /38/);
});

test('pending catalog does not invent a lead count or stale target count', async () => {
  const { buildPendingItems } = await import('../src/lib/command_center_pending.mjs');
  const items = buildPendingItems({ tenantConfigured: false, searchConfigured: false, providerConfigured: false });
  const leads = items.find((item) => item.key === 'leads');
  assert.match(leads?.description ?? '', /UNKNOWN/);
  assert.doesNotMatch(leads?.description ?? '', /38|800/);
});

test('pending panel refreshes from its live endpoint', async () => {
  const fs = await import('node:fs/promises');
  const route = await fs.readFile(new URL('../src/app/api/command-center/pending/route.ts', import.meta.url), 'utf8');
  assert.match(route, /buildPendingSections/);
  // Sin caché: los pendientes se recalculan por petición.
  assert.match(route, /force-dynamic/);
  // Consume el bridge HTTP interno de Mapache (cliente compartido, URL por env).
  assert.match(route, /mapacheFetch/);
});

test('separates resolved work into history and leaves partial work pending', async () => {
  const { buildPendingSections } = await import('../src/lib/command_center_pending.mjs');
  const sections = buildPendingSections({
    tenantConfigured: true,
    searchConfigured: true,
    providerConfigured: true,
    discovery: { status: 'COMPLETED', found: 30, new: 30, duplicate: 0, blocked: false },
    templateConfigured: true,
    activeTemplate: true,
    emailAccountStatus: 'ACTIVE',
    leads: 38,
  });

  assert.ok(sections.history.some((item) => item.title === 'Tenant y RLS de Mapache' && item.status === 'PASS'));
  assert.ok(sections.history.some((item) => item.title === 'Correo profesional en Mapache' && item.status === 'PASS'));
  assert.equal(sections.pending.some((item) => item.status === 'PASS'), false);
  assert.ok(sections.history.some((item) => item.title === 'Clasificación y Scoring DQS' && item.status === 'PASS'));
});

test('builds a professional Codex prompt without secrets', async () => {
  const { buildCodexPrompt } = await import('../src/lib/command_center_prompts.mjs');
  const prompt = buildCodexPrompt({
    key: 'seo',
    title: 'SEO/SEM de Veyra',
    owner: 'Marketing',
    description: 'Faltan analítica y Search Console.',
    status: 'PENDIENTE',
  });
  assert.match(prompt, /Misi[oó]n: SEO\/SEM de Veyra/);
  assert.match(prompt, /REAL DATA ONLY/);
  assert.match(prompt, /PASS \/ BLOCKED \/ UNKNOWN/);
  assert.doesNotMatch(prompt.toLowerCase(), /token|password|secret|api[_ -]?key/);
});

test('pending cards expose prompt generation and Codex relay actions', async () => {
  const fs = await import('node:fs/promises');
  const route = await fs.readFile(new URL('../src/app/api/command-center/codex-task/route.ts', import.meta.url), 'utf8');
  assert.match(route, /X-Hermes-Signature/);
  assert.match(route, /operation: 'REVIEW'/);
});
