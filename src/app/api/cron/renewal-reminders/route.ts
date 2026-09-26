export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { GuakiDataService, getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { notifyBusinessAudit } from '@/lib/notifications';

const REMINDER_DAYS = 7;
const HOUR_MS = 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  const authHeader = request.headers.get('authorization') || '';
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET_NOT_CONFIGURED' }, { status: 503 });
  }
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'ANALYTICS_UNAVAILABLE' }, { status: 503 });
  }

  let businesses: Awaited<ReturnType<typeof GuakiDataService.getAllBusinesses>> = [];
  try {
    businesses = await GuakiDataService.getAllBusinesses({});
  } catch {
    return NextResponse.json({ error: 'INVENTORY_UNAVAILABLE' }, { status: 503 });
  }

  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + REMINDER_DAYS * 24 * 60 * 60 * 1000);
  let reminded = 0;
  let skipped = 0;

  for (const business of businesses) {
    // Only plan verified or manual_ve
    if (business.plan !== 'verified' && business.plan_source !== 'manual_ve') {
      continue;
    }
    // Check plan_expires_at within next 7 days
    const expiresAt = business.plan_expires_at ? new Date(business.plan_expires_at) : null;
    if (!expiresAt) { skipped += 1; continue; }
    if (expiresAt > sevenDaysFromNow) { skipped += 1; continue; }
    // Idempotencia: no reenviar si ya se envió un reminder el mismo día
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Usar el client de Supabase directamente para verificar events de idempotencia
    const supa = getSupabaseClient();
    try {
      const { data: events } = await supa.from('events').select('*').eq('business_id', business.id).eq('event_name', 'notify_plan_renewal').maybeSingle();
      if (events && events.metadata && new Date(events.metadata.timestamp).setHours(0, 0, 0, 0) >= today.setHours(0, 0, 0, 0)) {
        skipped += 1;
        continue;
      }
    } catch {
      /* no bloquear si falla la consulta de events */
    }

    // Build renewal email context
    const ctx = {
      businessName: business.name,
      businessId: business.id,
      ownerName: business.ownerEmail ? business.ownerEmail.split('@')[0] : null,
      recipientEmail: business.ownerEmail || null,
    };

    await notifyBusinessAudit('plan_renewal', {
      businessName: business.name,
      businessId: business.id,
      ownerName: ctx.ownerName,
      recipientEmail: ctx.recipientEmail,
      notes: `Plan vence en ${REMINDER_DAYS} días: ${business.plan}`,
    });
    reminded += 1;
  }

  return NextResponse.json({ ok: true, checked: businesses.length, reminded, skipped });
}