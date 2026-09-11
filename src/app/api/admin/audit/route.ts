import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { GuakiDataService, getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('guaki_session')?.value;
  if (!isSupabaseConfigured() || !token || token.startsWith('dev-') || token.startsWith('usr_local_')) {
    return NextResponse.json({ error: 'ADMIN_PERSISTENCE_NOT_CONFIGURED' }, { status: 503 });
  }
  const { data: actor, error } = await getSupabaseClient().auth.getUser(token);
  if (error || !actor.user || actor.user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'ADMIN_REQUIRED' }, { status: 403 });
  }
  const businesses = await GuakiDataService.getBusinessesWithToken(token);
  const queue = {
    pending: businesses.filter((business) => business.status === 'draft'),
    inReview: businesses.filter((business) => business.status === 'in_audit'),
    approved: businesses.filter((business) => business.status === 'approved'),
    rejected: businesses.filter((business) => business.status === 'rejected'),
  };
  const summary = {
    pendingCount: queue.pending.length,
    inReviewCount: queue.inReview.length,
    approvedCount: queue.approved.length,
    rejectedCount: queue.rejected.length,
  };

  return NextResponse.json({
    summary,
    queue,
    refreshedAt: new Date().toISOString(),
  }, { headers: { 'Cache-Control': 'no-store, private' } });
}
