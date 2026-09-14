export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { adminClient, sanitizeFilter } from '@/lib/admin_server';

const MODERATION_STATES = ['submitted', 'approved', 'rejected'] as const;
type ModerationState = (typeof MODERATION_STATES)[number];

export async function GET(request: NextRequest) {
  const ctx = await adminClient(request);
  if ('denied' in ctx) return ctx.denied;

  const status = request.nextUrl.searchParams.get('status') || 'submitted';
  const q = sanitizeFilter(request.nextUrl.searchParams.get('q') || '');

  let query = ctx.admin
    .from('reviews')
    .select('id,business_id,author_name,rating,comment,verified_transaction,reply,moderation_status,created_at,businesses(name,city)')
    .order('created_at', { ascending: false })
    .limit(200);
  if (MODERATION_STATES.includes(status as ModerationState)) query = query.eq('moderation_status', status);
  if (q) query = query.or(`author_name.ilike.%${q}%,comment.ilike.%${q}%`);

  const [{ data, error }, { data: stateRows }] = await Promise.all([
    query,
    ctx.admin.from('reviews').select('moderation_status'),
  ]);
  if (error) {
    return NextResponse.json({ error: 'REVIEWS_QUERY_FAILED', detail: error.message }, { status: 500 });
  }

  const reviews = (data || []).map((r: Record<string, any>) => ({
    id: r.id,
    businessId: r.business_id,
    businessName: r.businesses?.name || '',
    businessCity: r.businesses?.city || '',
    authorName: r.author_name,
    rating: Number(r.rating || 0),
    comment: r.comment,
    verifiedTransaction: Boolean(r.verified_transaction),
    reply: r.reply || null,
    status: MODERATION_STATES.includes(r.moderation_status) ? r.moderation_status : 'submitted',
    createdAt: r.created_at,
  }));

  const summary = MODERATION_STATES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = (stateRows || []).filter((row: any) => row.moderation_status === s).length;
    return acc;
  }, {});
  summary.total = (stateRows || []).length;

  return NextResponse.json({ ok: true, reviews, summary }, { headers: { 'Cache-Control': 'no-store, private' } });
}
