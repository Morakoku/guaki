export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { evaluateDiscoveryReadiness } from '../../../../lib/mapache_discovery_readiness.mjs';
import { buildPendingSections } from '../../../../lib/command_center_pending.mjs';

const MAPACHE_API = (process.env.MAPACHE_API_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '');

export async function GET() {
  const tenantId = process.env.MAPACHE_TENANT_ID ?? '';
  const [apiResult, summaryResult, emailAccountsResult] = await Promise.allSettled([
    fetch(`${MAPACHE_API}/health`, { cache: 'no-store', signal: AbortSignal.timeout(5000) }),
    fetch(`${MAPACHE_API}/api/v1/command-center/summary`, {
      headers: { 'X-Tenant-ID': tenantId },
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    }),
    fetch(`${MAPACHE_API}/api/v1/settings/email-accounts`, { cache: 'no-store', signal: AbortSignal.timeout(5000) }),
  ]);
  const readiness = evaluateDiscoveryReadiness({
    apiOk: apiResult.status === 'fulfilled' && apiResult.value.ok,
    summaryOk: summaryResult.status === 'fulfilled' && summaryResult.value.ok,
    tenantConfigured: Boolean(process.env.MAPACHE_TENANT_ID),
    searchConfigured: Boolean(process.env.MAPACHE_DISCOVERY_SEARCH_ID),
    providerConfigured: Boolean(process.env.MAPACHE_DISCOVERY_PROVIDER),
  });
  const summary = summaryResult.status === 'fulfilled' && summaryResult.value.ok
    ? await summaryResult.value.clone().json() as {
      lastDiscovery?: { status: string; found?: number; new?: number; duplicate?: number; blocked?: boolean } | null;
      discoveryCaptured?: number;
      discoveryContactable?: number;
      leads?: number;
      sent?: number;
      templateCount?: number;
      activeTemplateCount?: number;
    }
    : {};
  const emailAccounts = emailAccountsResult.status === 'fulfilled' && emailAccountsResult.value.ok
    ? await emailAccountsResult.value.clone().json() as Array<{ status?: string }>
    : [];
  const emailAccountStatus = emailAccounts[0]?.status ?? 'NONE';
  const sections = buildPendingSections({
    tenantConfigured: !readiness.missing.includes('tenant'),
    searchConfigured: !readiness.missing.includes('search'),
    providerConfigured: !readiness.missing.includes('provider'),
    discovery: summary.lastDiscovery ?? null,
    discoveryCaptured: summary.discoveryCaptured ?? 0,
    discoveryContactable: summary.discoveryContactable ?? 0,
    leads: summary.leads ?? 0,
    sent: summary.sent ?? 0,
    templateConfigured: (summary.templateCount ?? 0) > 0,
    activeTemplate: (summary.activeTemplateCount ?? 0) > 0,
    emailAccountStatus,
  });
  return NextResponse.json({
    status: 'PASS',
    source: 'LOCAL_EVIDENCE',
    operationalStatus: readiness.status,
    transport: { mapacheApi: readiness.missing.includes('mapache_api') ? 'BLOCKED' : 'PASS' },
    items: sections.pending,
    history: sections.history,
  });
}
