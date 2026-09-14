export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { adminClient, sanitizeFilter } from '@/lib/admin_server';

const VALID_STATUSES = ['new', 'contacted', 'quoted', 'scheduled', 'closed'] as const;
type InquiryStatus = (typeof VALID_STATUSES)[number];

export async function GET(request: NextRequest) {
  const ctx = await adminClient(request);
  if ('denied' in ctx) return ctx.denied;

  const status = request.nextUrl.searchParams.get('status') || '';
  const q = sanitizeFilter(request.nextUrl.searchParams.get('q') || '');

  let query = ctx.admin
    .from('inquiries')
    .select('id,business_id,client_name,client_contact,email,message,service_requested,scheduled_date,status,created_at,businesses(name,city,whatsapp)')
    .order('created_at', { ascending: false })
    .limit(200);
  if (VALID_STATUSES.includes(status as InquiryStatus)) query = query.eq('status', status);
  if (q) query = query.or(`client_name.ilike.%${q}%,client_contact.ilike.%${q}%,message.ilike.%${q}%`);

  const [{ data, error }, { data: statusRows }] = await Promise.all([
    query,
    ctx.admin.from('inquiries').select('status'),
  ]);
  if (error) {
    return NextResponse.json({ error: 'INQUIRIES_QUERY_FAILED', detail: error.message }, { status: 500 });
  }

  const inquiries = (data || []).map((r: Record<string, any>) => ({
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

  const summary = VALID_STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = (statusRows || []).filter((row: any) => row.status === s).length;
    return acc;
  }, {});
  summary.total = (statusRows || []).length;

  return NextResponse.json({ ok: true, inquiries, summary }, { headers: { 'Cache-Control': 'no-store, private' } });
}
