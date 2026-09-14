export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/admin_server';
import { GuakiDataService } from '@/lib/supabase';

const VALID_STATUSES = ['new', 'contacted', 'quoted', 'scheduled', 'closed'] as const;
type InquiryStatus = (typeof VALID_STATUSES)[number];

interface Props {
  params: { id: string };
}

export async function PATCH(request: NextRequest, { params }: Props) {
  const ctx = await adminClient(request);
  if ('denied' in ctx) return ctx.denied;

  let body: { status?: string; notes?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
  }
  const status = String(body.status || '') as InquiryStatus;
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'INVALID_STATUS', valid: VALID_STATUSES }, { status: 400 });
  }

  const { data: current } = await ctx.admin
    .from('inquiries')
    .select('id,status,business_id,businesses(name)')
    .eq('id', params.id)
    .maybeSingle();
  if (!current) return NextResponse.json({ error: 'INQUIRY_NOT_FOUND' }, { status: 404 });

  const { data: updated, error } = await ctx.admin
    .from('inquiries')
    .update({ status })
    .eq('id', params.id)
    .select('id,status')
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: 'INQUIRY_UPDATE_FAILED', detail: error.message }, { status: 502 });
  }

  await GuakiDataService.recordEvent('admin_action', {
    action: 'inquiry_status',
    target: (current as Record<string, any>).businesses?.name || 'inquiry',
    target_id: params.id,
    actor_id: ctx.actorId,
    from: (current as Record<string, any>).status,
    to: status,
    reason: String(body.notes || '').slice(0, 500) || null,
    origen: 'admin-panel',
  }).catch(() => undefined);

  return NextResponse.json({ ok: true, inquiry: updated });
}
