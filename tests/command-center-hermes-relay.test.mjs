import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('command center hides Hermes controls and legacy inventory from the interface', async () => {
  const page = await fs.readFile(new URL('../src/components/command-center/AdminDashboard.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(page, /\{ id: 'hermes', label: 'Hermes'/);
  assert.doesNotMatch(page, /<HermesPanel/);
  assert.doesNotMatch(page, /\['Hermes', 'Agente heredado'/);
  assert.match(page, /!item\.name\.includes\('Hermes'\)/);
});

test('legacy relay endpoint remains available without a Command Center surface', async () => {
  const route = await fs.readFile(new URL('../src/app/api/command-center/hermes-tasks/route.ts', import.meta.url), 'utf8');
  assert.match(route, /TASK_INBOX/);
  assert.match(route, /NextResponse/);
});

test('ecosystem overview removes legacy Hermes evidence and wording before display', async () => {
  const page = await fs.readFile(new URL('../src/components/command-center/AdminDashboard.tsx', import.meta.url), 'utf8');
  assert.match(page, /!item\.name\.includes\('Hermes'\)/);
  assert.match(page, /replace\(\/;\?\\s\*Hermes permanece apagado/);
});
