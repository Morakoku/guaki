export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { GuakiDataService, isSupabaseConfigured } from '@/lib/supabase';
import { notifyBusinessAudit } from '@/lib/notifications';

const HOUR_MS = 60 * 60 * 1000;
const REMINDER_AFTER_HOURS = 48;
const REMINDER_WINDOW_HOURS = 72;

// Recordatorio del loop transaccional (mensaje 4): afiches rechazados sin
// reenvío entre 48 h y 72 h. La ventana evita duplicados con un cron diario.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  const authHeader = request.headers.get('authorization') || '';
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'ANALYTICS_UNAVAILABLE' }, { status: 503 });
  }

  let rejected: Awaited<ReturnType<typeof GuakiDataService.getAllBusinesses>> = [];
  try {
    rejected = await GuakiDataService.getAllBusinesses({ status: 'rejected' });
  } catch {
    return NextResponse.json({ error: 'INVENTORY_UNAVAILABLE' }, { status: 503 });
  }

  const now = Date.now();
  let reminded = 0;

  for (const business of rejected) {
    const updatedAt = business.updatedAt ? new Date(business.updatedAt).getTime() : 0;
    if (!updatedAt) continue;
    const ageHours = (now - updatedAt) / HOUR_MS;
    if (ageHours < REMINDER_AFTER_HOURS || ageHours > REMINDER_WINDOW_HOURS) continue;

    await notifyBusinessAudit('audit_reminder', {
      businessName: business.name,
      businessId: business.id,
      ownerName: business.ownerEmail ? business.ownerEmail.split('@')[0] : null,
      recipientEmail: business.ownerEmail || null,
      notes: business.auditNotes || null,
    });
    reminded += 1;
  }

  return NextResponse.json({ ok: true, checked: rejected.length, reminded });
}
