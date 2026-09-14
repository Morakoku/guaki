export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { adminClient } from '@/lib/admin_server';
import { GuakiDataService } from '@/lib/supabase';

const DECISIONS = ['approved', 'rejected'] as const;
type ReviewDecision = (typeof DECISIONS)[number];

interface Props {
  params: { id: string };
}

async function reconcileBusinessRating(admin: SupabaseClient, businessId: string) {
  const { data } = await admin
    .from('reviews')
    .select('rating')
    .eq('business_id', businessId)
    .eq('moderation_status', 'approved');
  const rows = (data || []) as Array<{ rating: number }>;
  const count = rows.length;
  const avg = count ? Math.round((rows.reduce((acc, r) => acc + Number(r.rating || 0), 0) / count) * 100) / 100 : null;
  await admin
    .from('businesses')
    .update({ rating: avg, review_count: count, updated_at: new Date().toISOString() })
    .eq('id', businessId);
}

export async function POST(request: NextRequest, { params }: Props) {
  const ctx = await adminClient(request);
  if ('denied' in ctx) return ctx.denied;

  let body: { decision?: string; reply?: string; reason?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
  }
  const decision = String(body.decision || '') as ReviewDecision;
  if (!DECISIONS.includes(decision)) {
    return NextResponse.json({ error: 'INVALID_DECISION', valid: DECISIONS }, { status: 400 });
  }
  if (decision === 'rejected' && !String(body.reason || '').trim()) {
    return NextResponse.json(
      { error: 'REVIEW_REASON_REQUIRED', message: 'Indica el motivo del rechazo; queda en el registro de auditoría.' },
      { status: 400 },
    );
  }

  const { data: current } = await ctx.admin
    .from('reviews')
    .select('id,business_id,moderation_status,businesses(name)')
    .eq('id', params.id)
    .maybeSingle();
  if (!current) return NextResponse.json({ error: 'REVIEW_NOT_FOUND' }, { status: 404 });

  const patch: Record<string, unknown> = { moderation_status: decision };
  const reply = String(body.reply || '').trim();
  if (reply) patch.reply = reply.slice(0, 1000);

  const { data: updated, error } = await ctx.admin
    .from('reviews')
    .update(patch)
    .eq('id', params.id)
    .select('id,moderation_status,reply')
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: 'REVIEW_UPDATE_FAILED', detail: error.message }, { status: 502 });
  }

  await reconcileBusinessRating(ctx.admin, (current as Record<string, any>).business_id);

  await GuakiDataService.recordEvent('admin_action', {
    action: `review_${decision}`,
    target: (current as Record<string, any>).businesses?.name || 'review',
    target_id: params.id,
    actor_id: ctx.actorId,
    reason: String(body.reason || '').slice(0, 500) || null,
    reply: reply || null,
    origen: 'admin-panel',
  }).catch(() => undefined);

  return NextResponse.json({ ok: true, review: updated });
}
