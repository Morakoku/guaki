export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { adminClient, sanitizeFilter } from '@/lib/admin_server';

const MODERATION_STATES = ['submitted', 'approved', 'rejected'] as const;
type ModerationState = (typeof MODERATION_STATES)[number];
const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

function parsePagination(searchParams: URLSearchParams): { page: number; limit: number } {
  const rawPage = Number(searchParams.get('page'));
  const rawLimit = Number(searchParams.get('limit'));
  const page = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1;
  const limit = Math.min(Math.max(Number.isInteger(rawLimit) && rawLimit >= 1 ? rawLimit : DEFAULT_LIMIT, 1), MAX_LIMIT);
  return { page, limit };
}

export async function GET(request: NextRequest) {
  const ctx = await adminClient(request);
  if ('denied' in ctx) return ctx.denied;

  const { page, limit } = parsePagination(request.nextUrl.searchParams);
  const status = request.nextUrl.searchParams.get('status') || 'submitted';
  const q = sanitizeFilter(request.nextUrl.searchParams.get('q') || '');

  const from = (page - 1) * limit;
  // Una fila extra detecta si hay más páginas sin otra consulta de conteo.
  let query = ctx.admin
    .from('reviews')
    .select('id,business_id,author_name,rating,comment,verified_transaction,reply,moderation_status,created_at,businesses(name,city)')
    .order('created_at', { ascending: false })
    .range(from, page * limit);
  if (MODERATION_STATES.includes(status as ModerationState)) query = query.eq('moderation_status', status);
  if (q) query = query.or(`author_name.ilike.%${q}%,comment.ilike.%${q}%`);

  // Conteos baratos: head:true no trae filas, solo el COUNT exacto por estado.
  const stateCounts = MODERATION_STATES.map((s) =>
    ctx.admin.from('reviews').select('*', { count: 'exact', head: true }).eq('moderation_status', s),
  );
  const [{ data, error }, totalRes, ...countRes] = await Promise.all([
    query,
    ctx.admin.from('reviews').select('*', { count: 'exact', head: true }),
    ...stateCounts,
  ]);
  if (error) {
    console.error('[admin] reviews query failed:', error.message);
    return NextResponse.json({ error: 'REVIEWS_QUERY_FAILED' }, { status: 500 });
  }

  const rows = data || [];
  const hasMore = rows.length > limit;
  const reviews = rows.slice(0, limit).map((r: Record<string, any>) => ({
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

  const summary: Record<string, number> = {};
  countRes.forEach((res, index) => {
    summary[MODERATION_STATES[index]] = res.count ?? 0;
  });
  summary.total = totalRes.count ?? 0;

  return NextResponse.json({ ok: true, reviews, summary, page, limit, hasMore }, { headers: { 'Cache-Control': 'no-store, private' } });
}