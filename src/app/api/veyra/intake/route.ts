export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { VeyraStore } from '@/lib/veyra_store';

import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  // C-05 FIX: Prevent public leakage of customer intake PII and budgets
  const token = request.cookies.get('guaki_session')?.value;
  if (isSupabaseConfigured() && token) {
    const { data: actor, error } = await getSupabaseClient().auth.getUser(token);
    if (error || !actor.user || actor.user.app_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'ADMIN_REQUIRED' }, { status: 403 });
    }
  } else if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
  }

  const intakes = VeyraStore.getAllIntakes();
  return NextResponse.json({
    intakes,
    total: intakes.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    if (!payload.name || !payload.email || (!payload.company_name && !payload.companyName)) {
      return NextResponse.json(
        { error: 'Campos requeridos: name, email, company_name' },
        { status: 400 },
      );
    }

    const newIntake = VeyraStore.createIntake({
      name: payload.name,
      companyName: payload.company_name || payload.companyName,
      email: payload.email,
      phone: payload.phone || '',
      city: payload.city || '',
      sector: payload.sector || '',
      companySize: payload.company_size || payload.companySize,
      priority: payload.priority,
      goal: payload.goal || '',
      bottleneck: payload.bottleneck || '',
      servicesNeeded: payload.services_needed || payload.servicesNeeded,
      systems: payload.systems,
      budget: payload.budget,
    });

    const newReport = (newIntake as unknown as { report: { id: string } }).report;

    return NextResponse.json(
      {
        success: true,
        message: 'Solicitud Business MRI™ registrada exitosamente.',
        intake: newIntake,
        report: newReport,
        reportId: newReport?.id,
        redirectUrl: `/business-mri-report.html?id=${newReport?.id || 'MRI-001'}`,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al procesar solicitud.' },
      { status: 500 },
    );
  }
}
