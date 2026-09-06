export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { evaluateDiscoveryReadiness } from '../../../../../lib/mapache_discovery_readiness.mjs';

const MAPACHE_API = (process.env.MAPACHE_API_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '');

export async function POST() {
  const tenantId = process.env.MAPACHE_TENANT_ID ?? '';
  const searchId = process.env.MAPACHE_DISCOVERY_SEARCH_ID ?? '';
  const provider = process.env.MAPACHE_DISCOVERY_PROVIDER ?? '';
  const [apiResult, summaryResult] = await Promise.allSettled([
    fetch(`${MAPACHE_API}/health`, { cache: 'no-store', signal: AbortSignal.timeout(5000) }),
    fetch(`${MAPACHE_API}/api/v1/command-center/summary`, { cache: 'no-store', signal: AbortSignal.timeout(5000) }),
  ]);
  const readiness = evaluateDiscoveryReadiness({
    apiOk: apiResult.status === 'fulfilled' && apiResult.value.ok,
    bridgeOk: summaryResult.status === 'fulfilled' && summaryResult.value.ok,
    tenantConfigured: Boolean(tenantId),
    searchConfigured: Boolean(searchId),
    providerConfigured: Boolean(provider),
  });

  if (!readiness.canRun) {
    return NextResponse.json({
      ...readiness,
      operation: 'LOCAL_DISCOVERY_NOT_CONFIGURED',
      message: 'No se creó ningún job. Configura tenant, búsqueda y proveedor autorizados.',
    }, { status: 503 });
  }

  try {
    const response = await fetch(`${MAPACHE_API}/api/v1/hermes/dispatch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': `command-center-discovery-${crypto.randomUUID()}`,
        'X-Tenant-ID': tenantId,
      },
      body: JSON.stringify({
        job_type: 'DISCOVERY',
        payload: { search_id: searchId, provider },
      }),
      signal: AbortSignal.timeout(10000),
    });
    const payload = await response.json().catch(() => ({}));
    return NextResponse.json({
      status: response.ok ? 'QUEUED' : 'BLOCKED',
      operation: 'LOCAL_DISCOVERY_DISPATCH',
      ...payload,
    }, { status: response.ok ? 202 : response.status });
  } catch {
    return NextResponse.json({
      status: 'BLOCKED',
      operation: 'LOCAL_DISCOVERY_DISPATCH',
      message: 'Mapache local no responde; no se creó ningún job.',
    }, { status: 502 });
  }
}
