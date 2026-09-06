import test from 'node:test';
import assert from 'node:assert/strict';

test('the command center ecosystem summary exposes identity, capabilities, and evidence states', async () => {
  const { getEcosystemSummary } = await import('../src/lib/command_center_ecosystem.mjs');
  const summary = getEcosystemSummary();

  assert.equal(summary.identity.title, 'Holding Morakoku OS');
  assert.ok(summary.programs.some((program) => program.name === 'Mapache CRM'));
  assert.ok(summary.capabilities.some((capability) => capability.name === 'Enrutador Inteligente La Trinidad'));
  assert.ok(summary.evidence.some((item) => item.status === 'LOCAL_ACTIVE'));
  assert.ok(summary.evidence.some((item) => item.name === 'PostgreSQL 5435 (Mapache)' && item.status === 'LOCAL_ACTIVE'));
  assert.equal(JSON.stringify(summary).match(/36|71|800|43[.,]?988/g), null);
});
