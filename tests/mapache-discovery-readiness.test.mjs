import test from 'node:test';
import assert from 'node:assert/strict';

test('discovery is not ready without tenant, search, and provider configuration', async () => {
  const { evaluateDiscoveryReadiness } = await import('../src/lib/mapache_discovery_readiness.mjs');
  const result = evaluateDiscoveryReadiness({ apiOk: true, bridgeOk: true, tenantConfigured: false, searchConfigured: false, providerConfigured: false });

  assert.equal(result.status, 'BLOCKED');
  assert.equal(result.canRun, false);
  assert.deepEqual(result.missing, ['tenant', 'search', 'provider']);
});

test('discovery is ready only when transport and operation configuration are present', async () => {
  const { evaluateDiscoveryReadiness } = await import('../src/lib/mapache_discovery_readiness.mjs');
  const result = evaluateDiscoveryReadiness({ apiOk: true, bridgeOk: true, tenantConfigured: true, searchConfigured: true, providerConfigured: true });

  assert.deepEqual(result, { status: 'PASS', canRun: true, missing: [] });
});
