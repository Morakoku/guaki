export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { evaluateDiscoveryReadiness } from '../../../../../lib/mapache_discovery_readiness.mjs';
import { mapacheFetch } from '../../../../../lib/mapacheClient';

export async function POST() {
  const tenantId = process.env.MAPACHE_TENANT_ID ?? '';
  const searchId = process.env.MAPACHE_DISCOVERY_SEARCH_ID ?? '';
  const provider = process.env.MAPACHE_DISCOVERY_PROVIDER ?? '';

  const [apiResult, summaryResult] = await Promise.allSettled([
    mapacheFetch('/health', { method: 'GET' }),
    mapacheFetch('/api/v1/command-center/summary', { method: 'GET' }),
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
    const result = await mapacheFetch('/api/v1/hermes/dispatch', {
      method: 'POST',
      headers: {
        'Idempotency-Key': `command-center-discovery-${crypto.randomUUID()}`,
        'X-Tenant-ID': tenantId,
      },
      body: JSON.stringify({
        job_type: 'DISCOVERY',
        payload: { search_id: searchId, provider },
      }),
    });

    return NextResponse.json({
      status: result.ok ? 'QUEUED' : 'BLOCKED',
      operation: 'LOCAL_DISCOVERY_DISPATCH',
      ...(result.data && typeof result.data === 'object' && !Array.isArray(result.data) ? result.data : {}),
    }, { status: result.ok ? 202 : result.status });
  } catch {
    return NextResponse.json({
      status: 'BLOCKED',
      operation: 'LOCAL_DISCOVERY_DISPATCH',
      message: 'Mapache local no responde; no se creó ningún job.',
    }, { status: 502 });
  }
}
