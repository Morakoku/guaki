export function evaluateDiscoveryReadiness({ apiOk = false, summaryOk = false, bridgeOk = false, tenantConfigured = false, searchConfigured = false, providerConfigured = false } = {}) {
  const missing = [];
  const ok = Boolean(apiOk || summaryOk || bridgeOk);
  if (!ok) missing.push('mapache_api');
  if (!tenantConfigured) missing.push('tenant');
  if (!searchConfigured) missing.push('search');
  if (!providerConfigured) missing.push('provider');
  return { status: missing.length ? 'BLOCKED' : 'PASS', canRun: missing.length === 0, missing };
}
