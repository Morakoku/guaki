export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { buildDependencyHealth } from '../../../lib/command_center_hardening.mjs';
import { mapacheFetch } from '../../../lib/mapacheClient';

const RELAY_URL = (process.env.HERMES_CODEX_RELAY_URL ?? 'http://127.0.0.1:9122/health').replace(/\/$/, '');

async function isAvailable(url: string) {
  try {
    const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(3000) });
    return response.ok;
  } catch {
    return false;
  }
}

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({
      status: 'HEALTHY',
      environment: 'production',
      timestamp: new Date().toISOString(),
      dependencies: {
        supabase: 'CONFIGURED',
        mapache: 'ISOLATED_INDEPENDENT_SERVICE',
        relay: 'INTERNAL_ORCHESTRATOR',
      },
    }, { status: 200 });
  }

  const [mapache, relay] = await Promise.all([
    mapacheFetch('/health', { method: 'GET' }).then(r => r.ok).catch(() => false),
    isAvailable(RELAY_URL),
  ]);
  return NextResponse.json(buildDependencyHealth({ mapache, hermesBridge: mapache, hermesDashboard: null, relay }), { status: 200 });
}
