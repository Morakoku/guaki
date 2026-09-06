export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { evaluateDiscoveryReadiness } from '../../../../../lib/mapache_discovery_readiness.mjs';

const MAPACHE_API = (process.env.MAPACHE_API_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '');

export async function GET() {
  const [apiResult, summaryResult] = await Promise.allSettled([
    fetch(`${MAPACHE_API}/health`, { cache: 'no-store', signal: AbortSignal.timeout(5000) }),
    fetch(`${MAPACHE_API}/api/v1/command-center/summary`, { cache: 'no-store', signal: AbortSignal.timeout(5000) }),
  ]);
  const result = evaluateDiscoveryReadiness({
    apiOk: apiResult.status === 'fulfilled' && apiResult.value.ok,
    bridgeOk: summaryResult.status === 'fulfilled' && summaryResult.value.ok,
    tenantConfigured: Boolean(process.env.MAPACHE_TENANT_ID),
    searchConfigured: Boolean(process.env.MAPACHE_DISCOVERY_SEARCH_ID),
    providerConfigured: Boolean(process.env.MAPACHE_DISCOVERY_PROVIDER),
  });

  return NextResponse.json({
    ...result,
    operation: result.canRun ? 'LOCAL_DISCOVERY_READY' : 'LOCAL_DISCOVERY_NOT_CONFIGURED',
    scraping: result.canRun ? 'READY_LOCAL_ONLY' : 'NOT_AVAILABLE',
    sending: 'BLOCKED',
    checkedAt: new Date().toISOString(),
  }, { status: result.status === 'PASS' ? 200 : 503 });
}
