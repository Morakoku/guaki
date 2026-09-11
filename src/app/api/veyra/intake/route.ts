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

    // H-13 FIX (audit v2): validate email format and bound every free-text field.
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailPattern.test(String(payload.email).trim())) {
      return NextResponse.json({ error: 'INVALID_EMAIL' }, { status: 400 });
    }

    const cap = (value: unknown, max: number) =>
      typeof value === 'string' ? value.trim().slice(0, max) : undefined;

    const newIntake = VeyraStore.createIntake({
      name: cap(payload.name, 120) || '',
      companyName: cap(payload.company_name || payload.companyName, 160) || '',
      email: cap(payload.email, 160) || '',
      phone: cap(payload.phone, 40) || '',
      city: cap(payload.city, 80) || '',
      sector: cap(payload.sector, 80) || '',
      companySize: cap(payload.company_size || payload.companySize, 40),
      priority: cap(payload.priority, 40),
      goal: cap(payload.goal, 1200) || '',
      bottleneck: cap(payload.bottleneck, 1200) || '',
      servicesNeeded: cap(payload.services_needed || payload.servicesNeeded, 600),
      systems: cap(payload.systems, 600),
      budget: cap(payload.budget, 60),
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
