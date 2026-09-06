export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

const MAPACHE_API = (process.env.MAPACHE_API_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '');
const TENANT_ID = process.env.MAPACHE_TENANT_ID ?? '';

const SUPPORTED_FILTERS = ['all', 'unanswered', 'answered', 'pending', 'interested', 'closed'];

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const filter = SUPPORTED_FILTERS.includes(params.get('filter') ?? '') ? params.get('filter')! : 'all';

  const query = new URLSearchParams({ filter });
  if (params.get('channel')) query.set('channel', params.get('channel')!);
  if (params.get('q')) query.set('q', params.get('q')!);
  if (params.get('page')) query.set('page', params.get('page')!);
  if (params.get('size')) query.set('size', params.get('size')!);

  try {
    const response = await fetch(`${MAPACHE_API}/api/v1/conversations?${query.toString()}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': TENANT_ID,
      },
    });
    if (!response.ok) throw new Error(`MAPACHE_${response.status}`);
    const payload = await response.json() as Record<string, any>;
    return NextResponse.json({
      ...payload,
      status: 'PASS',
      filter,
      source: MAPACHE_API,
    });
  } catch {
    return NextResponse.json(
      {
        status: 'BLOCKED',
        filter,
        source: MAPACHE_API,
        items: [],
        total: 0,
        page: 1,
        size: 50,
        pages: 0,
        message: 'Mapache local no responde',
      },
      { status: 503 },
    );
  }
}
