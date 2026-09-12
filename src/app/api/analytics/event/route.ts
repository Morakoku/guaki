export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { GuakiDataService, isSupabaseConfigured } from '@/lib/supabase';

const ALLOWED_EVENTS = new Set([
  'afiche_vista',
  'whatsapp_clicked',
  'ficha_vista',
  'search_executed',
  'search_result_clicked',
  'call_clicked',
  'register_started',
  'register_completed',
  'ficha_saved',
  'audit_submitted',
  'claim_started',
  'claim_completed',
  'plan_interest',
  'merchant_cta_clicked',
]);

const MAX_METADATA_BYTES = 4096;
const FORBIDDEN_METADATA_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function sanitizeMetadata(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (!key || key.length > 64 || FORBIDDEN_METADATA_KEYS.has(key)) continue;
    if (value === null || typeof value === 'number' || typeof value === 'boolean') {
      output[key] = value;
    } else if (typeof value === 'string') {
      output[key] = value.slice(0, 500);
    } else if (Array.isArray(value)) {
      output[key] = value
        .slice(0, 20)
        .filter((item) => item === null || ['string', 'number', 'boolean'].includes(typeof item))
        .map((item) => (typeof item === 'string' ? item.slice(0, 200) : item));
    }
  }
  return output;
}

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

  const metadata = sanitizeMetadata(payload?.metadata);

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
