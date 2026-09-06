import { NextResponse } from 'next/server';
import { VeyraToolsEngine, HandoverInput } from '@/lib/veyra_tools_engine';

export async function POST(req: Request) {
  try {
    const body: HandoverInput = await req.json();

    if (!body.clientName || !body.totalBudgetUsd) {
      return NextResponse.json(
        { error: 'Parámetros obligatorios faltantes (clientName, totalBudgetUsd)' },
        { status: 400 }
      );
    }

    const result = VeyraToolsEngine.generateHandover(body);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error en generación de handover' }, { status: 500 });
  }
}
