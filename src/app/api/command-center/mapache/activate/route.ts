export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { evaluateMapacheActivation } from '../../../../../lib/mapache_activation.mjs';
import { mapacheFetch } from '../../../../../lib/mapacheClient';

export async function GET() {
  const [healthResult, summaryResult] = await Promise.allSettled([
    mapacheFetch('/health', { method: 'GET' }),
    mapacheFetch('/api/v1/command-center/summary', { method: 'GET' }),
  ]);
  const healthOk = healthResult.status === 'fulfilled' && healthResult.value.ok;
  const summaryOk = summaryResult.status === 'fulfilled' && summaryResult.value.ok;
  const result = evaluateMapacheActivation({ healthOk, summaryOk });
  const localDiscoveryConfigured = Boolean(
    process.env.MAPACHE_TENANT_ID
      && process.env.MAPACHE_DISCOVERY_SEARCH_ID
      && process.env.MAPACHE_DISCOVERY_PROVIDER,
  );
  const scraping = result.status === 'PASS'
    ? (localDiscoveryConfigured ? 'READY_LOCAL_ONLY' : 'NOT_CONFIGURED')
    : 'BLOCKED';

  return NextResponse.json({
    ...result,
    checkedAt: new Date().toISOString(),
    crm: summaryOk ? 'READ_ONLY_SUMMARY' : 'UNAVAILABLE',
    scraping,
    discoveryConfigured: localDiscoveryConfigured,
    sending: 'BLOCKED',
  }, { status: result.status === 'PASS' ? 200 : 503 });
}
