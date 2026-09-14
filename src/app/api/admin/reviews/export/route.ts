export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { adminClient, sanitizeFilter } from '@/lib/admin_server';

const MODERATION_STATES = ['submitted', 'approved', 'rejected'] as const;

function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
}

export async function GET(request: NextRequest) {
  const ctx = await adminClient(request);
  if ('denied' in ctx) return ctx.denied;

  const status = request.nextUrl.searchParams.get('status') || '';
  const q = sanitizeFilter(request.nextUrl.searchParams.get('q') || '');

  let query = ctx.admin
    .from('reviews')
    .select('id,author_name,rating,comment,moderation_status,created_at,businesses(name,city)')
    .order('created_at', { ascending: false })
    .limit(5000);
  if (MODERATION_STATES.includes(status as (typeof MODERATION_STATES)[number])) query = query.eq('moderation_status', status);
  if (q) query = query.or(`author_name.ilike.%${q}%,comment.ilike.%${q}%`);

  const { data, error } = await query;
  if (error) {
    console.error('[admin] reviews export failed:', error.message);
    return NextResponse.json({ error: 'REVIEWS_EXPORT_FAILED' }, { status: 500 });
  }

  const header = ['ID', 'Negocio', 'Ciudad', 'Autor', 'Calificacion', 'Comentario', 'Estado', 'Fecha'];
  const rows = (data || []).map((r: Record<string, any>) =>
    [
      r.id,
      r.businesses?.name || '',
      r.businesses?.city || '',
      r.author_name,
      r.rating,
      r.comment,
      r.moderation_status,
      r.created_at,
    ].map(csvCell).join(';'),
  );
  const csv = '\uFEFF' + [header.join(';'), ...rows].join('\r\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="guaki-resenas-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store, private',
    },
  });
}
