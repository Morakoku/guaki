import { NextResponse } from 'next/server';
import { VeyraToolsEngine, MRICalculationInput } from '@/lib/veyra_tools_engine';

export async function POST(req: Request) {
  try {
    const body: MRICalculationInput = await req.json();

    if (!body.clientName || !body.monthlyLeads) {
      return NextResponse.json(
        { error: 'Parámetros obligatorios faltantes (clientName, monthlyLeads)' },
        { status: 400 }
      );
    }

    const result = VeyraToolsEngine.calculateMRI(body);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error en el cálculo' }, { status: 500 });
  }
}
