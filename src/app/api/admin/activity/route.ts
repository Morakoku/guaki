export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/admin_server';

export async function GET(request: NextRequest) {
  const ctx = await adminClient(request);
  if ('denied' in ctx) return ctx.denied;

  const { data, error } = await ctx.admin
    .from('events')
    .select('id,event_name,metadata,business_id,actor_user_id,timestamp')
    .eq('event_name', 'admin_action')
    .order('timestamp', { ascending: false })
    .limit(100);
  if (error) {
    console.error('[admin] activity query failed:', error.message);
    return NextResponse.json({ error: 'ACTIVITY_QUERY_FAILED' }, { status: 500 });
  }

  const events = (data || []).map((r: Record<string, any>) => ({
    id: r.id,
    action: r.metadata?.action || r.event_name,
    target: r.metadata?.target || null,
    targetId: r.metadata?.target_id || r.business_id || null,
    from: r.metadata?.from ?? null,
    to: r.metadata?.to ?? null,
    reason: r.metadata?.reason ?? null,
    origen: r.metadata?.origen || null,
    actorId: r.actor_user_id || null,
    timestamp: r.timestamp,
  }));

  return NextResponse.json({ ok: true, events }, { headers: { 'Cache-Control': 'no-store, private' } });
}
