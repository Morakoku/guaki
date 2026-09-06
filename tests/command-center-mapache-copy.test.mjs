import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('mapache control describes local activation without the blocked-gates message', async () => {
  const page = await readFile(new URL('../src/components/command-center/AdminDashboard.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(page, /scraping externo pendiente de gates/i);
  assert.match(page, /Mapache Scraper & CRM Prospección/);
  assert.match(page, /OPERATIVO & SEARCHING/);
  assert.doesNotMatch(page, /Activar scraping/);
});

test('pending panel reports evidence-backed states instead of permanent UNKNOWN cards', async () => {
  const page = await readFile(new URL('../src/components/command-center/AdminDashboard.tsx', import.meta.url), 'utf8');
  const pending = await readFile(new URL('../src/lib/command_center_pending.mjs', import.meta.url), 'utf8');
  assert.match(pending, /status: 'PASS'/);
  assert.match(pending, /BLOQUEADO/);
  assert.match(pending, /Backup y verificación SHA-256/);
  assert.match(page, /buildPendingItems/);
  assert.match(pending, /leads == null \|\| leads <= 0 \? 'PENDIENTE'/);
  assert.match(pending, /estado UNKNOWN hasta la próxima ejecución real/);
});

test('mapache discovery command remains visible and uses the server-side bridge', async () => {
  const page = await readFile(new URL('../src/components/command-center/AdminDashboard.tsx', import.meta.url), 'utf8');
  const route = await readFile(new URL('../src/app/api/command-center/mapache/discovery/route.ts', import.meta.url), 'utf8');
  assert.match(page, /Mapache Scraper & CRM Prospección/);
  assert.match(page, /api\/command-center\/mapache\/control/);
  assert.match(route, /api\/v1\/hermes\/dispatch/);
  assert.match(route, /Idempotency-Key/);
  assert.doesNotMatch(page, /SERVICE_TOKEN_KEY/);
});

test('mapache activation reports local discovery readiness instead of a fixed scraping block', async () => {
  const route = await readFile(new URL('../src/app/api/command-center/mapache/activate/route.ts', import.meta.url), 'utf8');
  assert.match(route, /READY_LOCAL_ONLY/);
  assert.doesNotMatch(route, /scraping: 'BLOCKED'/);
});

test('mapache project card reflects the verified local runtime', async () => {
  const page = await readFile(new URL('../src/components/command-center/AdminDashboard.tsx', import.meta.url), 'utf8');
  assert.match(page, /LOCAL ACTIVE/);
  assert.doesNotMatch(page, /loop recurrente/);
});

test('pending panel lists current actionable work', async () => {
  const page = await readFile(new URL('../src/components/command-center/AdminDashboard.tsx', import.meta.url), 'utf8');
  const pending = await readFile(new URL('../src/lib/command_center_pending.mjs', import.meta.url), 'utf8');
  for (const label of ['Tenant y RLS de Mapache', 'Búsqueda La Trinidad autorizada', 'Proveedor de discovery', 'Correo profesional en Mapache', 'Enrutador La Trinidad & Despacho', 'Lanza Fast Offer & Checkout Wompi', 'Clasificación y Scoring DQS', 'Backup y verificación SHA-256']) {
    assert.match(pending, new RegExp(label));
  }
  assert.match(pending, /title:/);
  assert.match(page, /Backlog & Matriz de Pendientes del Ecosistema/);
});
