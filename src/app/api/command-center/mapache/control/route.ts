export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { mapacheFetch } from '../../../../../lib/mapacheClient';

const TENANT_ID = process.env.MAPACHE_TENANT_ID ?? '';
const SEARCH_ID = process.env.MAPACHE_DISCOVERY_SEARCH_ID ?? '';

function headers() {
  return {
    'X-Tenant-ID': TENANT_ID,
    'X-Search-ID': SEARCH_ID,
  };
}

async function forward(method: 'GET' | 'PATCH', request?: NextRequest) {
  try {
    const result = await mapacheFetch('/api/v1/command-center/control', {
      method,
      headers: headers(),
      body: method === 'PATCH' && request ? JSON.stringify(await request.json()) : undefined,
    });
    return NextResponse.json(result.data, { status: result.status });
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
