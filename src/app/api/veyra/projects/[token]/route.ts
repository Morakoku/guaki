export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { VeyraStore } from '@/lib/veyra_store';

interface Props {
  params: { token: string };
}

export async function GET(_request: NextRequest, { params }: Props) {
  const project = VeyraStore.getProjectByToken(params.token);
  if (!project) {
    return NextResponse.json({ error: 'Proyecto no encontrado o token inválido.' }, { status: 404 });
  }

  return NextResponse.json({ project });
}
