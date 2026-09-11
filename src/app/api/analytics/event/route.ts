export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { GuakiDataService, isSupabaseConfigured } from '@/lib/supabase';

const ALLOWED_EVENTS = new Set([
  'afiche_vista',
  'whatsapp_clicked',
  'ficha_vista',
  'search_executed',
  'search_result_clicked',
]);

const MAX_METADATA_BYTES = 4096;

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: 'ANALYTICS_UNAVAILABLE' }, { status: 503 });
  }

  let payload: any = null;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
  }

  const eventName = typeof payload?.event_name === 'string' ? payload.event_name.trim() : '';
  if (!ALLOWED_EVENTS.has(eventName)) {
    return NextResponse.json({ error: 'EVENT_NOT_ALLOWED' }, { status: 400 });
  }

  const metadata =
    payload?.metadata && typeof payload.metadata === 'object' && !Array.isArray(payload.metadata)
      ? payload.metadata
      : {};

  try {
    if (JSON.stringify(metadata).length > MAX_METADATA_BYTES) {
      return NextResponse.json({ error: 'METADATA_TOO_LARGE' }, { status: 413 });
    }
  } catch {
    return NextResponse.json({ error: 'INVALID_METADATA' }, { status: 400 });
  }

  const businessId =
    typeof payload?.business_id === 'string' && payload.business_id.trim().length > 0
      ? payload.business_id.trim()
      : undefined;

  try {
    await GuakiDataService.recordEvent(eventName, metadata, businessId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'EVENT_INSERT_FAILED' }, { status: 500 });
  }
}
