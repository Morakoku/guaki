export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { VeyraStore } from '@/lib/veyra_store';

interface Props {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: Props) {
  const report = VeyraStore.getMriReportById(params.id);
  if (!report) {
    return NextResponse.json({ error: 'Reporte Business MRI no encontrado.' }, { status: 404 });
  }
  return NextResponse.json({ report });
}

export async function PATCH(request: NextRequest, { params }: Props) {
  try {
    const payload = await request.json();
    const action = payload.action;

    if (action === 'approve') {
      const approved = VeyraStore.approveMriReport(params.id);
      if (!approved) {
        return NextResponse.json({ error: 'Reporte no encontrado.' }, { status: 404 });
      }
      return NextResponse.json({
        message: 'Diagnóstico Business MRI™ APROBADO exitosamente.',
        report: approved,
      });
    }

    return NextResponse.json({ error: 'Acción no soportada.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al actualizar diagnóstico.' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest, { params }: Props) {
  return PATCH(request, { params });
}


