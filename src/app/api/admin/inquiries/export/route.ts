export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { adminClient, sanitizeFilter } from '@/lib/admin_server';

const VALID_STATUSES = ['new', 'contacted', 'quoted', 'scheduled', 'closed'] as const;

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
    .from('inquiries')
    .select('id,client_name,client_contact,email,service_requested,message,status,created_at,businesses(name,city)')
    .order('created_at', { ascending: false })
    .limit(5000);
  if (VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) query = query.eq('status', status);
  if (q) query = query.or(`client_name.ilike.%${q}%,client_contact.ilike.%${q}%,message.ilike.%${q}%`);

  const { data, error } = await query;
  if (error) {
    console.error('[admin] inquiries export failed:', error.message);
    return NextResponse.json({ error: 'INQUIRIES_EXPORT_FAILED' }, { status: 500 });
  }

  const header = ['ID', 'Negocio', 'Ciudad', 'Cliente', 'Contacto', 'Email', 'Servicio', 'Mensaje', 'Estado', 'Fecha'];
  const rows = (data || []).map((r: Record<string, any>) =>
    [
      r.id,
      r.businesses?.name || '',
      r.businesses?.city || '',
      r.client_name,
      r.client_contact,
      r.email || '',
      r.service_requested || '',
      r.message,
      r.status,
      r.created_at,
    ].map(csvCell).join(';'),
  );
  const csv = '\uFEFF' + [header.join(';'), ...rows].join('\r\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="guaki-contactos-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store, private',
    },
  });
}
