export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { VeyraStore } from '@/lib/veyra_store';

interface Props {
  params: { token: string };
}

export async function POST(request: NextRequest, { params }: Props) {
  try {
    const payload = await request.json();
    const { selectedOption } = payload;
    const project = VeyraStore.getProjectByToken(params.token);

    if (!project) {
      return NextResponse.json({ error: 'Proyecto no encontrado.' }, { status: 404 });
    }

    const approvalId = project.pendingApproval?.id || 'APR-001';
    const updated = VeyraStore.approveProjectOption(params.token, approvalId, selectedOption || 'opt_a');

    if (!updated) {
      return NextResponse.json({ error: 'No se pudo registrar la aprobación.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, project: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error procesando aprobación.' },
      { status: 500 },
    );
  }
}
