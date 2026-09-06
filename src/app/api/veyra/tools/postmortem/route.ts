import { NextResponse } from 'next/server';
import { VeyraToolsEngine, PostMortemInput } from '@/lib/veyra_tools_engine';

export async function POST(req: Request) {
  try {
    const body: PostMortemInput = await req.json();

    if (!body.clientName || !body.quotedHours || !body.actualHours) {
      return NextResponse.json(
        { error: 'Parámetros obligatorios faltantes (clientName, quotedHours, actualHours)' },
        { status: 400 }
      );
    }

    const result = VeyraToolsEngine.processPostMortem(body);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error en procesamiento de post-mortem' }, { status: 500 });
  }
}
