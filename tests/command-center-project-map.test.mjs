import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('project map reflects the verified local state and next gates', async () => {
  const page = await fs.readFile(new URL('../src/components/command-center/AdminDashboard.tsx', import.meta.url), 'utf8');
  assert.match(page, /name: 'Guaki',[\s\S]*badge: 'PROD LIVE'/);
  assert.match(page, /name: 'VEYRA',[\s\S]*badge: 'ENTERPRISE READY'/);
  assert.match(page, /name: 'Mapache',[\s\S]*badge: 'LOCAL ACTIVE'/);
  assert.match(page, /Secuencias de prospección B2B y cierre/);
  assert.match(page, /name: 'LANZA',[\s\S]*badge: 'PHASE 1 READY'/);
  assert.match(page, /name: 'Atlas',[\s\S]*badge: 'WORKSPACE READY'/);
  assert.match(page, /inventoryBadge\(project\.badge\)/);
  assert.doesNotMatch(page, /Datos reales: 30 empresas capturadas/);
});
