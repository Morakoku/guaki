import test from 'node:test';
import assert from 'node:assert/strict';

test('mapache activation passes only when health and read-only summary are available', async () => {
  const { evaluateMapacheActivation } = await import('../src/lib/mapache_activation.mjs');

  assert.deepEqual(evaluateMapacheActivation({ healthOk: true, summaryOk: true }), {
    status: 'PASS',
    message: 'Mapache local responde y el resumen CRM esta disponible.',
  });
});

test('mapache activation is blocked when the local health check is unavailable', async () => {
  const { evaluateMapacheActivation } = await import('../src/lib/mapache_activation.mjs');

  assert.deepEqual(evaluateMapacheActivation({ healthOk: false, summaryOk: true }), {
    status: 'BLOCKED',
    message: 'Mapache local no responde en health.',
  });
});
