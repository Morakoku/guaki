export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { VeyraStore } from '@/lib/veyra_store';

interface Props {
  params: { token: string };
}

export async function POST(request: NextRequest, { params }: Props) {
  try {
    const payload = await request.json();
    const { approvalId, selectedOption } = payload;

    if (!approvalId || !selectedOption) {
      return NextResponse.json(
        { error: 'Campos requeridos: approvalId, selectedOption' },
        { status: 400 },
      );
    }

    const updated = VeyraStore.approveProjectOption(params.token, approvalId, selectedOption);
    if (!updated) {
      return NextResponse.json({ error: 'No se pudo registrar la aprobación.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Aprobación registrada exitosamente en el proyecto.',
      project: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al registrar aprobación.' },
      { status: 500 },
    );
  }
}
