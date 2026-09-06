import { NextResponse } from 'next/server';
import { VeyraStore } from '@/lib/veyra_store';
import { VEYRA_ENTERPRISE_LEADS } from '@/lib/veyra_enterprise_leads';

export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  // C-06 FIX: Prevent public leakage of commercial intelligence and deal values
  const token = request.cookies.get('guaki_session')?.value;
  if (isSupabaseConfigured() && token) {
    const { data: actor, error } = await getSupabaseClient().auth.getUser(token);
    if (error || !actor.user || actor.user.app_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'ADMIN_REQUIRED' }, { status: 403 });
    }
  } else if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
  }
  const reports = VeyraStore.getAllMriReports();
  const intakes = VeyraStore.getAllIntakes();
  const enterpriseLeads = VEYRA_ENTERPRISE_LEADS;

  const totalPipelineUsd = enterpriseLeads.reduce((acc, curr) => acc + curr.dealValue, 0);

  return NextResponse.json({
    reports,
    intakes,
    enterpriseLeads,
    summary: {
      totalLeads: enterpriseLeads.length,
      totalPipelineUsd,
      totalIntakes: intakes.length,
      pendingDiagnostics: intakes.filter((i) => i.status === 'pending_review' || i.status === 'diagnosed').length,
      approvedReports: reports.filter((r) => r.status === 'approved').length,
    },
  });
}
