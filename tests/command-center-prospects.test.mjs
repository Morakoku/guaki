import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('counts only rows with phone or email as contactable', async () => {
  const { summarizeProspects } = await import('../src/lib/command_center_prospects.mjs');
  const summary = summarizeProspects({
    companies_found: 3,
    companies_with_email: 1,
    leads: 0,
    emails: { sent: 0 },
    recent: [
      { name: 'Con telefono', phone: '+57 300 000 0000', email: null },
      { name: 'Con correo', phone: null, email: 'hola@example.test' },
      { name: 'Sin contacto', phone: null, email: null },
    ],
  });

  assert.equal(summary.captured, 3);
  assert.equal(summary.contactable, 2);
  assert.equal(summary.uncontactable, 1);
  assert.equal(summary.leads, 0);
  assert.equal(summary.sent, 0);
});

test('command center exposes live contactability labels', () => {
  const page = fs.readFileSync(new URL('../src/components/command-center/AdminDashboard.tsx', import.meta.url), 'utf8');
  for (const label of ['Empresas Mapeadas', 'Contactables', 'Con Email Corporativo', 'Correos Despachados']) {
    assert.match(page, new RegExp(label));
  }
  assert.match(page, /Total Capturados/);
});

test('command center reads summary directly from local Mapache API', () => {
  const route = fs.readFileSync(new URL('../src/app/api/command-center/prospects/route.ts', import.meta.url), 'utf8');
  assert.match(route, /127\.0\.0\.1:8000/);
  assert.match(route, /command-center\/summary/);
  assert.doesNotMatch(route, /127\.0\.0\.1:8001/);
});

test('overview and leads consume one shared live prospect snapshot', () => {
  const page = fs.readFileSync(new URL('../src/components/command-center/AdminDashboard.tsx', import.meta.url), 'utf8');
  assert.match(page, /function useLiveProspects\(\)/);
  assert.match(page, /const liveProspects = useLiveProspects\(\);/);
  assert.match(page, /<ProspectingLivePanel data=\{liveProspects\} \/>/);
  assert.match(page, /<LeadsPanel data=\{liveProspects\} onOpen=\{setActiveTab\} \/>/);
});
