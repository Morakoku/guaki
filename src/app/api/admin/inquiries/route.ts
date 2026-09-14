export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { adminClient, sanitizeFilter } from '@/lib/admin_server';

const VALID_STATUSES = ['new', 'contacted', 'quoted', 'scheduled', 'closed'] as const;
type InquiryStatus = (typeof VALID_STATUSES)[number];
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
  const status = request.nextUrl.searchParams.get('status') || '';
  const q = sanitizeFilter(request.nextUrl.searchParams.get('q') || '');

  const from = (page - 1) * limit;
  // Una fila extra detecta si hay más páginas sin otra consulta de conteo.
  let query = ctx.admin
    .from('inquiries')
    .select('id,business_id,client_name,client_contact,email,message,service_requested,scheduled_date,status,created_at,businesses(name,city,whatsapp)')
    .order('created_at', { ascending: false })
    .range(from, page * limit);
  if (VALID_STATUSES.includes(status as InquiryStatus)) query = query.eq('status', status);
  if (q) query = query.or(`client_name.ilike.%${q}%,client_contact.ilike.%${q}%,message.ilike.%${q}%`);

  // Conteos baratos: head:true no trae filas, solo el COUNT exacto por estado.
  const statusCounts = VALID_STATUSES.map((s) =>
    ctx.admin.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', s),
  );
  const [{ data, error }, totalRes, ...countRes] = await Promise.all([
    query,
    ctx.admin.from('inquiries').select('*', { count: 'exact', head: true }),
    ...statusCounts,
  ]);
  if (error) {
    console.error('[admin] inquiries query failed:', error.message);
    return NextResponse.json({ error: 'INQUIRIES_QUERY_FAILED' }, { status: 500 });
  }

  const rows = data || [];
  const hasMore = rows.length > limit;
  const inquiries = rows.slice(0, limit).map((r: Record<string, any>) => ({
    id: r.id,
    businessId: r.business_id,
    businessName: r.businesses?.name || '',
    businessCity: r.businesses?.city || '',
    businessWhatsapp: r.businesses?.whatsapp || '',
    clientName: r.client_name,
    clientContact: r.client_contact,
    email: r.email || null,
    message: r.message,
    serviceRequested: r.service_requested || null,
    scheduledDate: r.scheduled_date || null,
    status: VALID_STATUSES.includes(r.status) ? r.status : 'new',
    createdAt: r.created_at,
  }));

  const summary: Record<string, number> = {};
  countRes.forEach((res, index) => {
    summary[VALID_STATUSES[index]] = res.count ?? 0;
  });
  summary.total = totalRes.count ?? 0;

  return NextResponse.json({ ok: true, inquiries, summary, page, limit, hasMore }, { headers: { 'Cache-Control': 'no-store, private' } });
}