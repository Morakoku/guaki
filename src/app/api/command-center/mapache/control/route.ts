export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

const MAPACHE_API = (process.env.MAPACHE_API_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '');
const TENANT_ID = process.env.MAPACHE_TENANT_ID ?? '';
const SEARCH_ID = process.env.MAPACHE_DISCOVERY_SEARCH_ID ?? '';

function headers() {
  return {
    'Content-Type': 'application/json',
    'X-Tenant-ID': TENANT_ID,
    'X-Search-ID': SEARCH_ID,
  };
}

async function forward(method: 'GET' | 'PATCH', request?: NextRequest) {
  try {
    const response = await fetch(`${MAPACHE_API}/api/v1/command-center/control`, {
      method,
      headers: headers(),
      body: method === 'PATCH' && request ? JSON.stringify(await request.json()) : undefined,
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
    const payload = await response.json().catch(() => ({
      status: 'BLOCKED',
      message: 'Mapache devolvió una respuesta no legible.',
    }));
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json({
      status: 'BLOCKED',
      message: 'Mapache no responde; no se cambió el estado de control.',
    }, { status: 502 });
  }
}

export async function GET() {
  return forward('GET');
}

export async function PATCH(request: NextRequest) {
  return forward('PATCH', request);
}
