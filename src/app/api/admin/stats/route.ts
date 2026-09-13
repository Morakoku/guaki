export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GuakiDataService, getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { getPlansForCountry } from '@/lib/plans';

async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const token = request.cookies.get('guaki_session')?.value;
  if (!isSupabaseConfigured() || !token || token.startsWith('dev-') || token.startsWith('usr_local_')) {
    return NextResponse.json({ error: 'ADMIN_REQUIRED' }, { status: 403 });
  }
  const { data: actor, error } = await getSupabaseClient().auth.getUser(token);
  if (error || actor.user?.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'ADMIN_REQUIRED' }, { status: 403 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const businesses = await GuakiDataService.getAllBusinesses();
  const byStatus: Record<string, number> = {};
  const byPlan: Record<string, number> = {};
  for (const b of businesses) {
    byStatus[b.status] = (byStatus[b.status] || 0) + 1;
    const plan = String((b as { plan?: string }).plan || 'gratis');
    byPlan[plan] = (byPlan[plan] || 0) + 1;
  }

  // MRR desde la fuente de verdad: planes persistidos en las fichas x precio del plan CO.
  const plans = getPlansForCountry('CO');
  let mrrCop = 0;
  for (const plan of plans) mrrCop += (byPlan[plan.id] || 0) * (plan.priceAmount || 0);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  let inquiries = { total: 0, new: 0 };
  let reviews = 0;
  let events7d = 0;
  if (url && serviceKey) {
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
    const since = new Date(Date.now() - 7 * 864e5).toISOString();
    const [inq, inqNew, rev, ev] = await Promise.all([
      admin.from('inquiries').select('id', { count: 'exact', head: true }),
      admin.from('inquiries').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      admin.from('reviews').select('id', { count: 'exact', head: true }),
      admin.from('events').select('id', { count: 'exact', head: true }).gte('timestamp', since),
    ]);
    inquiries = { total: inq.count || 0, new: inqNew.count || 0 };
    reviews = rev.count || 0;
    events7d = ev.count || 0;
  }

  const rejectedStale = businesses.filter((b) => {
    if (b.status !== 'rejected') return false;
    const at = (b as { updatedAt?: string }).updatedAt;
    return at ? Date.now() - new Date(at).getTime() > 7 * 864e5 : false;
  }).length;

  return NextResponse.json({
    ok: true,
    fichas: { total: businesses.length, byStatus, rejectedStale },
    planes: byPlan,
    mrr: { cop: mrrCop, currency: 'COP' },
    inquiries,
    reviews,
    events7d,
    generatedAt: new Date().toISOString(),
  }, { headers: { 'Cache-Control': 'no-store, private' } });
}
